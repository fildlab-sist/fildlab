import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { AssignStockToTechnicianDto, SpareMovementType } from '@fildlab/shared-dtos';

@Injectable()
export class AssignStockToTechnicianUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * REQ-04: Registrar salida de almacén central vinculada obligatoriamente a una orden
   * de trabajo válida y reflejar de inmediato la asignación al stock del almacén móvil del técnico.
   */
  async execute(dto: AssignStockToTechnicianDto, gerenciaUserId: string) {
    if (!dto.quantity || dto.quantity <= 0) {
      throw new BadRequestException('REQ-04: La cantidad de repuestos a trasladar debe ser mayor a 0.');
    }

    if (!dto.workOrderId || !dto.workOrderId.trim()) {
      throw new BadRequestException(
        'REQ-04: Cada salida física del almacén central debe estar vinculada obligatoriamente a una orden de trabajo válida.',
      );
    }

    // 1. Validar que la orden de trabajo existe
    const order = await this.prisma.workOrder.findUnique({
      where: { id: dto.workOrderId },
    });
    if (!order) {
      throw new BadRequestException(
        `REQ-04: No se encontró una orden de trabajo válida con ID ${dto.workOrderId}. No se puede despachar sin orden.`,
      );
    }

    // 2. Validar que el repuesto existe y tiene stock central suficiente
    const spare = await this.prisma.sparePart.findUnique({
      where: { id: dto.sparePartId },
    });
    if (!spare) {
      throw new NotFoundException(`Repuesto con ID ${dto.sparePartId} no encontrado en catálogo.`);
    }
    if (spare.centralStock < dto.quantity) {
      throw new BadRequestException(
        `REQ-04: Stock insuficiente en almacén central. Disponible: ${spare.centralStock} ${spare.unitMeasure}, Requerido: ${dto.quantity}.`,
      );
    }

    // 3. Validar técnico
    const technician = await this.prisma.user.findUnique({
      where: { id: dto.technicianId },
    });
    if (!technician) {
      throw new NotFoundException(`Técnico con ID ${dto.technicianId} no encontrado.`);
    }

    // 4. Transacción ACID: Descuento central -> Acreditación móvil -> Registro de auditoría
    return this.prisma.$transaction(async (tx) => {
      // 4.1. Descontar del almacén central
      const updatedSpare = await tx.sparePart.update({
        where: { id: spare.id },
        data: {
          centralStock: { decrement: dto.quantity },
        },
      });

      // 4.2. Acreditar de forma inmediata al stock móvil del técnico
      const updatedTechStock = await tx.technicianStock.upsert({
        where: {
          technicianId_sparePartId: {
            technicianId: dto.technicianId,
            sparePartId: dto.sparePartId,
          },
        },
        update: {
          localQuantity: { increment: dto.quantity },
        },
        create: {
          technicianId: dto.technicianId,
          sparePartId: dto.sparePartId,
          localQuantity: dto.quantity,
        },
      });

      // 4.3. Registrar movimiento oficial con tipo ASIGNACION_A_TECNICO
      const movement = await tx.stockMovement.create({
        data: {
          sparePartId: spare.id,
          technicianId: dto.technicianId,
          workOrderId: dto.workOrderId,
          movementType: SpareMovementType.ASIGNACION_A_TECNICO,
          quantity: dto.quantity,
          unitCost: spare.unitCost,
          notes: dto.notes || `Despacho para orden ${order.orderCode}`,
          createdById: gerenciaUserId,
        },
      });

      return {
        movementId: movement.id,
        workOrderCode: order.orderCode,
        sparePartName: spare.name,
        transferredQuantity: dto.quantity,
        remainingCentralStock: updatedSpare.centralStock,
        newTechnicianMobileStock: updatedTechStock.localQuantity,
        technicianName: technician.fullName,
        timestamp: movement.createdAt,
      };
    });
  }
}
