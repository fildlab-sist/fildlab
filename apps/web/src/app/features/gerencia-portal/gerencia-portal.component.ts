import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserRole } from '@fildlab/shared-dtos';
import { BackofficeTabComponent } from '../backoffice/backoffice-tab.component.js';
import { BiDashboardTabComponent } from '../bi-dashboard/bi-dashboard-tab.component.js';
import { PredictiveAiTabComponent } from '../predictive-ai/predictive-ai-tab.component.js';

export type GerenciaTab = 'BACKOFFICE' | 'BI_DASHBOARD' | 'PREDICTIVE_AI';

@Component({
  selector: 'app-gerencia-portal',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    BackofficeTabComponent,
    BiDashboardTabComponent,
    PredictiveAiTabComponent,
  ],
  templateUrl: './gerencia-portal.component.html',
})
export class GerenciaPortalComponent {
  activeTab = signal<GerenciaTab>('BACKOFFICE');
  gerenciaRole = UserRole.GERENCIA;

  setActiveTab(tab: GerenciaTab): void {
    this.activeTab.set(tab);
  }
}
