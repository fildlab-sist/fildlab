import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';

export interface CreateAddendumDto {
  workOrderId: string;
  createdById: string; // ID de usuario Gerencia (RN-01)
  reason: string;
  correctionDetails: string;
}

@Injectable()
export class CreateOrderAddendumUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(dto: CreateAddendumDto) {
    const { workOrderId, createdById, reason, correctionDetails } = dto;

    const order = await this.prisma.workOrder.findUnique({
      where: { id: workOrderId },
      include: { addendums: true },
    });

    if (!order) {
      throw new NotFoundException(`Orden de trabajo con ID ${workOrderId} no encontrada`);
    }

    if (!order.isLocked) {
      throw new BadRequestException(
        'Solo se pueden emitir adendas sobre órdenes de trabajo cerradas e inmutables (RN-04)',
      );
    }

    // Generar código correlativo de la adenda: AD-{CODIGO_ORDEN}-{NUMERO}
    const addendumNumber = (order.addendums.length + 1).toString().padStart(2, '0');
    const addendumCode = `AD-${order.orderCode}-${addendumNumber}`;

    const newAddendum = await this.prisma.workOrderAddendum.create({
      data: {
        workOrderId,
        addendumCode,
        createdById,
        reason,
        correctionDetails,
      },
      include: {
        createdBy: {
          select: {
            fullName: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Nota Administrativa de Corrección / Adenda registrada conforme a ley (RN-04)',
      addendumCode: newAddendum.addendumCode,
      workOrderCode: order.orderCode,
      createdAt: newAddendum.createdAt,
      createdBy: newAddendum.createdBy.fullName,
    };
  }
}
