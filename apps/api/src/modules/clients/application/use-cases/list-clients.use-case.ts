import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';

@Injectable()
export class ListClientsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * REQ-01: Consulta de clientes corporativos con sedes y contratos vigentes.
   */
  async execute() {
    const clients = await this.prisma.client.findMany({
      where: { isActive: true },
      include: {
        branches: true,
        contracts: {
          include: {
            slaPolicy: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { businessName: 'asc' },
    });

    return clients.map((c) => ({
      id: c.id,
      ruc: c.ruc,
      businessName: c.businessName,
      commercialName: c.commercialName,
      contactEmail: c.contactEmail,
      contactPhone: c.contactPhone,
      fiscalAddress: c.fiscalAddress,
      branchesCount: c.branches.length,
      branches: c.branches.map((b) => ({
        id: b.id,
        name: b.name,
        address: b.address,
      })),
      contracts: c.contracts.map((ct) => ({
        id: ct.id,
        contractNumber: ct.contractNumber,
        startDate: ct.startDate.toISOString().split('T')[0],
        endDate: ct.endDate.toISOString().split('T')[0],
        monthlyFee: Number(ct.monthlyFee),
        status: ct.status,
        sla: ct.slaPolicy
          ? {
              emergencyMaxHours: ct.slaPolicy.emergencyMaxHours,
              penaltyPerHourDelay: Number(ct.slaPolicy.penaltyPerHourDelay),
            }
          : null,
      })),
    }));
  }
}
