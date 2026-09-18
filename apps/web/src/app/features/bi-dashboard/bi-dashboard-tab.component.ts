import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SlaBadgeComponent } from '../../shared/ui/sla-badge/sla-badge.component.js';
import { EmptyStateComponent } from '../../shared/ui/empty-state/empty-state.component.js';

interface ContractProfitabilityRow {
  code: string;
  client: string;
  monthlyRevenue: number;
  sparesCost: number;
  laborCost: number;
  netMargin: number;
  marginPercent: number;
  slaDelayMinutes: number;
  slaBreached: boolean;
}

@Component({
  selector: 'app-bi-dashboard-tab',
  standalone: true,
  imports: [CommonModule, SlaBadgeComponent, EmptyStateComponent],
  templateUrl: './bi-dashboard-tab.component.html',
})
export class BiDashboardTabComponent {
  isPeriodEmpty: boolean = false;

  contractsProfitability: ContractProfitabilityRow[] = [
    {
      code: 'CTR-2026-01',
      client: 'Clínica Sánchez Ferrer S.A.C.',
      monthlyRevenue: 3800,
      sparesCost: 920,
      laborCost: 280,
      netMargin: 2600,
      marginPercent: 68.4,
      slaDelayMinutes: 0,
      slaBreached: false,
    },
    {
      code: 'CTR-2026-02',
      client: 'Laboratorio Clínico Biolab',
      monthlyRevenue: 2400,
      sparesCost: 450,
      laborCost: 210,
      netMargin: 1740,
      marginPercent: 72.5,
      slaDelayMinutes: 45,
      slaBreached: false,
    },
    {
      code: 'CTR-2026-03',
      client: 'Clínica San Antonio',
      monthlyRevenue: 4500,
      sparesCost: 2900,
      laborCost: 700,
      netMargin: 900,
      marginPercent: 20.0,
      slaDelayMinutes: 180,
      slaBreached: true,
    },
  ];

  toggleEmptyPeriod(): void {
    this.isPeriodEmpty = !this.isPeriodEmpty;
  }
}
