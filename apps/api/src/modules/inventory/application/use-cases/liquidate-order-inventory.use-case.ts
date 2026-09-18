import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { OrderStatus, WorkOrderSpareStatus, SpareMovementType } from '@fildlab/shared-dtos';

export interface LiquidateOrderDto {
  workOrderId: string;
  gerenciaUserId: string; // Validado por RN-01 (Solo GERENCIA)
  liquidationNotes?: string;
}

@Injectable()
export class LiquidateOrderInventoryUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: LiquidateOrderDto) {
    const { workOrderId, gerenciaUserId, liquidationNotes } = dto;

    const order = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: {
        sparesUsed: {
          include: { sparePart: true },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Orden de trabajo con ID ${workOrderId} no encontrada`);
    }

    if (order.status === OrderStatus.LIQUIDADA_APROBADA) {
      throw new BadRequestException(`La orden ${order.orderCode} ya ha sido liquidada contablemente con anterioridad.`);
    }

    if (!order.isLocked) {
      throw new BadRequestException(
        `RN-03: No se puede liquidar contablemente una orden que no ha sido cerrada con firma legal en campo (isLocked = false).`,
      );
    }

    // Transacción ACID: Ejecución de Fase 3 del Inventario (RN-03 / REQ-06)
    return this.prisma.$transaction(async (tx) => {
      // 1. Descuento contable y físico definitivo de repuestos en Almacén Central
      for (const item of order.sparesUsed) {
        if (item.status === WorkOrderSpareStatus.COMPROMETIDO_EN_TRANSITO) {
          // Descontar del almacén central
          await tx.sparePart.update({
            where: { id: item.sparePartId },
            data: {
              centralStock: {
                decrement: item.quantity,
              },
            },
          });

          // Registrar movimiento de auditoría de inventario (REQ-04)
          await tx.stockMovement.create({
            data: {
              sparePartId: item.sparePartId,
              workOrderId: order.id,
              technicianId: order.assignedTechnicianId,
              movementType: SpareMovementType.CONSUMO_EN_ORDEN,
              quantity: item.quantity,
              unitCost: item.unitCost,
              notes: `Descuento contable definitivo por liquidación de orden ${order.orderCode}`,
              createdById: gerenciaUserId,
            },
          });

          // Pasar estado del repuesto a LIQUIDADO_DESCONTADO
          await tx.workOrderSpare.update({
            where: { id: item.id },
            data: {
              status: WorkOrderSpareStatus.LIQUIDADO_DESCONTADO,
            },
          });
        }
      }

      // 2. Transición de estado de la Orden a LIQUIDADA_APROBADA
      const liquidatedOrder = await tx.workOrder.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.LIQUIDADA_APROBADA,
          liquidatedAt: new Date(),
          liquidatedById: gerenciaUserId,
          liquidationNotes,
        },
        include: {
          sparesUsed: true,
          liquidatedBy: {
            select: { fullName: true, role: true },
          },
        },
      });

      return {
        message: 'Orden liquidada exitosamente. Descuento definitivo del almacén central ejecutado (RN-03 Fase 3).',
        orderCode: liquidatedOrder.orderCode,
        status: liquidatedOrder.status,
        liquidatedAt: liquidatedOrder.liquidatedAt,
        approvedBy: liquidatedOrder.liquidatedBy?.fullName,
        sparesLiquidatedCount: liquidatedOrder.sparesUsed.length,
      };
    });
  }
}
