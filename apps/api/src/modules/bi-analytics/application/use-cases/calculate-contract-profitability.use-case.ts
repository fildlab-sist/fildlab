import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { ContractProfitabilityCalculator } from '../../domain/services/contract-profitability.calculator.js';

export interface ProfitabilityQueryParams {
  startDate?: Date;
  endDate?: Date;
}

@Injectable()
export class CalculateContractProfitabilityUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: ContractProfitabilityCalculator,
  ) {}

  async execute(params: ProfitabilityQueryParams) {
    const { startDate, endDate } = params;

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = startDate;
    if (endDate) dateFilter.lte = endDate;

    // 1. Obtención de datos de persistencia
    const contracts = await this.prisma.contract.findMany({
      where: { status: 'ACTIVO' },
      include: {
        client: {
          select: { businessName: true, ruc: true },
        },
        slaPolicy: true,
        workOrders: {
          where: {
            status: { in: ['SINCRONIZADA', 'LIQUIDADA_APROBADA'] },
            ...(startDate || endDate ? { completedAt: dateFilter } : {}),
          },
          include: {
            sparesUsed: true,
          },
        },
      },
    });

    // 2. Manejo de condición REQ-13: "Sin datos disponibles para el periodo"
    if (!contracts || contracts.length === 0) {
      return {
        hasData: false,
        message: 'Sin datos disponibles para el periodo seleccionado (REQ-13)',
        contracts: [],
      };
    }

    // 3. Delegación del cálculo financiero a servicio especializado (SRP)
    const calculation = this.calculator.calculate(contracts as any);

    return {
      hasData: true,
      summary: calculation.summary,
      contracts: calculation.contracts,
    };
  }
}
