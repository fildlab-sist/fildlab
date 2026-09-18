import { Injectable, BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { CreateContractDto } from '@fildlab/shared-dtos';

@Injectable()
export class CreateContractUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * REQ-02 y REQ-03: Asociación de contrato de tratamiento de agua y SLA
   * con validación de fechas y mensajes descriptivos de error.
   */
  async execute(dto: CreateContractDto, createdByUserId: string) {
    // 1. REQ-03: Validación de campos obligatorios vacíos
    if (!dto.clientId || !dto.clientId.trim()) {
      throw new BadRequestException('REQ-03: Debe seleccionar obligatoriamente un cliente corporativo.');
    }
    if (!dto.contractNumber || !dto.contractNumber.trim()) {
      throw new BadRequestException('REQ-03: El número o código oficial del contrato es obligatorio.');
    }
    if (!dto.startDate || !dto.endDate) {
      throw new BadRequestException(
        'REQ-03: Debe especificar obligatoriamente tanto la fecha de inicio como la de término del contrato.',
      );
    }
    if (dto.monthlyRevenue == null || dto.monthlyRevenue <= 0) {
      throw new BadRequestException('REQ-03: La cuota mensual pactada debe ser un valor positivo mayor a 0 Soles.');
    }
    if (dto.emergencyResponseHours == null || dto.emergencyResponseHours <= 0) {
      throw new BadRequestException(
        'REQ-03: El tiempo de respuesta para emergencias en el SLA debe ser mayor a 0 horas.',
      );
    }

    // 2. REQ-03: Validación estricta de consistencia de fechas
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('REQ-03: El formato de fecha ingresado no es válido.');
    }

    if (end.getTime() <= start.getTime()) {
      throw new BadRequestException(
        `REQ-03: La fecha de término (${dto.endDate}) no puede ser anterior o igual a la fecha de inicio (${dto.startDate}). El periodo del contrato debe ser válido.`,
      );
    }

    // 3. Verificar que el cliente existe
    const client = await this.prisma.client.findUnique({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException(`REQ-02: No se encontró el cliente corporativo con ID ${dto.clientId}.`);
    }

    // 4. Verificar unicidad de número de contrato
    const existingContract = await this.prisma.contract.findUnique({
      where: { contractNumber: dto.contractNumber.trim() },
    });
    if (existingContract) {
      throw new ConflictException(
        `REQ-02: Ya existe un contrato registrado con el número ${dto.contractNumber}.`,
      );
    }

    // 5. Persistencia atómica de Contrato y SLA Policy (REQ-02)
    const contract = await this.prisma.contract.create({
      data: {
        contractNumber: dto.contractNumber.trim(),
        clientId: dto.clientId,
        startDate: start,
        endDate: end,
        monthlyFee: dto.monthlyRevenue,
        createdById: createdByUserId,
        slaPolicy: {
          create: {
            emergencyMaxHours: dto.emergencyResponseHours,
            penaltyPerHourDelay: dto.penaltyPerHourSoles || 0,
          },
        },
      },
      include: {
        slaPolicy: true,
        client: true,
      },
    });

    return {
      id: contract.id,
      contractNumber: contract.contractNumber,
      clientBusinessName: contract.client.businessName,
      startDate: contract.startDate.toISOString().split('T')[0],
      endDate: contract.endDate.toISOString().split('T')[0],
      monthlyFee: Number(contract.monthlyFee),
      status: contract.status,
      sla: contract.slaPolicy
        ? {
            emergencyMaxHours: contract.slaPolicy.emergencyMaxHours,
            penaltyPerHourDelay: Number(contract.slaPolicy.penaltyPerHourDelay),
          }
        : null,
      createdAt: contract.createdAt,
    };
  }
}
