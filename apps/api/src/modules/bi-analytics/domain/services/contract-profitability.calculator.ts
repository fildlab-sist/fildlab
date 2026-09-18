import { Injectable } from '@nestjs/common';
import { ProfitabilityMarginDto } from '@fildlab/shared-dtos';

export interface RawContractData {
  id: string;
  contractNumber: string;
  monthlyFee: any;
  client: { businessName: string };
  workOrders: Array<{
    slaBreached: boolean;
    technicianWorkHours: any;
    technicianHourlyRate: any;
    sparesUsed: Array<{ quantity: number; unitCost: any }>;
  }>;
}

export interface ProfitabilityCalculationOutput {
  summary: {
    totalGlobalRevenue: number;
    totalGlobalCost: number;
    globalNetMargin: number;
    globalMarginPercentage: number;
    totalSlaBreaches: number;
  };
  contracts: ProfitabilityMarginDto[];
}

@Injectable()
export class ContractProfitabilityCalculator {
  /**
   * Responsabilidad Única: Cálculo financiero estricto de costos operativos,
   * margen neto real por contrato y métricas globales de SLA (REQ-11, 12).
   */
  calculate(contracts: RawContractData[]): ProfitabilityCalculationOutput {
    let totalGlobalRevenue = 0;
    let totalGlobalCost = 0;
    let totalSlaBreaches = 0;

    const reports: ProfitabilityMarginDto[] = contracts.map((contract) => {
      const monthlyRevenue = Number(contract.monthlyFee);
      let totalSparesCost = 0;
      let totalTechnicianLaborCost = 0;

      contract.workOrders.forEach((order) => {
        if (order.slaBreached) {
          totalSlaBreaches++;
        }

        order.sparesUsed.forEach((spare) => {
          totalSparesCost += spare.quantity * Number(spare.unitCost);
        });

        const hours = Number(order.technicianWorkHours);
        const rate = Number(order.technicianHourlyRate);
        totalTechnicianLaborCost += hours * rate;
      });

      // Margen = Ingreso Mensual Pactado - (Costo Repuestos + Costo Horas Técnico)
      const totalOperatingCost = totalSparesCost + totalTechnicianLaborCost;
      const netMargin = monthlyRevenue - totalOperatingCost;
      const marginPercentage = monthlyRevenue > 0 ? (netMargin / monthlyRevenue) * 100 : 0;

      totalGlobalRevenue += monthlyRevenue;
      totalGlobalCost += totalOperatingCost;

      return {
        contractId: contract.id,
        contractNumber: contract.contractNumber,
        clientBusinessName: contract.client.businessName,
        monthlyRevenue,
        totalSparesCost,
        totalTechnicianLaborCost,
        netMargin: Math.round(netMargin * 100) / 100,
        marginPercentage: Math.round(marginPercentage * 10) / 10,
      };
    });

    const globalNetMargin = totalGlobalRevenue - totalGlobalCost;
    const globalMarginPercentage =
      totalGlobalRevenue > 0 ? (globalNetMargin / totalGlobalRevenue) * 100 : 0;

    return {
      summary: {
        totalGlobalRevenue,
        totalGlobalCost,
        globalNetMargin,
        globalMarginPercentage: Math.round(globalMarginPercentage * 10) / 10,
        totalSlaBreaches,
      },
      contracts: reports,
    };
  }
}
