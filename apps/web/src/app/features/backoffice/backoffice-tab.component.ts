import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserRole, OrderStatus, validateRucSUNAT, RucValidationResult } from '@fildlab/shared-dtos';
import { SlaBadgeComponent } from '../../shared/ui/sla-badge/sla-badge.component.js';
import { PdfReportGeneratorService } from '../../core/pdf/pdf-report-generator.service.js';
import { ContractModalComponent } from './contract-modal/contract-modal.component.js';
import { StockDispatchModalComponent } from './stock-dispatch-modal/stock-dispatch-modal.component.js';

interface BackofficeOrderRow {
  id: string;
  code: string;
  client: string;
  date: string;
  status: OrderStatus;
  isLocked: boolean;
  sparesCount: number;
  sparesCost: number;
  laborCost: number;
  slaBreached: boolean;
  delayMinutes: number;
  hasAddendum: boolean;
}

@Component({
  selector: 'app-backoffice-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SlaBadgeComponent,
    ContractModalComponent,
    StockDispatchModalComponent,
  ],
  templateUrl: './backoffice-tab.component.html',
})
export class BackofficeTabComponent {
  @Input() currentRole: UserRole = UserRole.TECNICO;
  OrderStatus = OrderStatus;

  isContractModalOpen = false;
  isDispatchModalOpen = false;

  clients = [
    { id: 'cli-01', ruc: '20123456786', businessName: 'Clínica Sánchez Ferrer S.A.C.' },
    { id: 'cli-02', ruc: '20538219453', businessName: 'Hospital Belén de Trujillo' },
  ];

  rucInput: string = '20612493821';
  rucValidation: RucValidationResult = validateRucSUNAT('20612493821');

  backofficeOrders: BackofficeOrderRow[] = [
    {
      id: 'ord-trjillo-001',
      code: 'OT-2026-0042',
      client: 'Clínica Sánchez Ferrer',
      date: '18/09/2026',
      status: OrderStatus.SINCRONIZADA,
      isLocked: true,
      sparesCount: 3,
      sparesCost: 920,
      laborCost: 140,
      slaBreached: false,
      delayMinutes: 0,
      hasAddendum: false,
    },
    {
      id: 'ord-trjillo-002',
      code: 'OT-2026-0043',
      client: 'Hospital Belén de Trujillo',
      date: '17/09/2026',
      status: OrderStatus.LIQUIDADA_APROBADA,
      isLocked: true,
      sparesCount: 1,
      sparesCost: 180,
      laborCost: 105,
      slaBreached: true,
      delayMinutes: 135,
      hasAddendum: true,
    },
  ];

  onRucChange(val: string): void {
    this.rucInput = val;
    this.rucValidation = validateRucSUNAT(val);
  }

  constructor(private readonly pdfService: PdfReportGeneratorService) {}

  liquidateOrder(orderId: string): void {
    if (this.currentRole !== UserRole.GERENCIA) {
      alert('Acceso restringido: Se requieren privilegios de Gerencia General para liquidar contablemente una orden.');
      return;
    }

    this.backofficeOrders = this.backofficeOrders.map((o) =>
      o.id === orderId ? { ...o, status: OrderStatus.LIQUIDADA_APROBADA } : o,
    );
    alert('Orden liquidada exitosamente. Se ha actualizado el inventario central.');
  }

  createAddendum(orderId: string): void {
    if (this.currentRole !== UserRole.GERENCIA) {
      alert('Acceso restringido: Solo Gerencia General puede emitir Adendas de Corrección.');
      return;
    }

    const reason = prompt('Ingrese el motivo formal de la Adenda de Corrección:');
    if (reason) {
      this.backofficeOrders = this.backofficeOrders.map((o) =>
        o.id === orderId ? { ...o, hasAddendum: true } : o,
      );
      alert(`Adenda registrada con éxito para la orden ${orderId}. El acta técnica original permanece inmutable.`);
    }
  }

  async downloadReportPdf(order: BackofficeOrderRow): Promise<void> {
    await this.pdfService.downloadReportPdf({
      orderCode: order.code,
      clientName: order.client,
      clientRuc: '20123456786',
      branchName: 'Sede Central - Hemodiálisis',
      branchAddress: 'Av. América Oeste 450, Trujillo',
      equipmentType: 'Ósmosis Inversa Doble Paso (BW30-4040)',
      equipmentSerial: 'EQUIP-2026-001',
      diagnosis: 'Mantenimiento preventivo programado según SLA. Calidad de agua conforme.',
      workPerformed: 'Calibración de presostatos, medición de conductividad y desinfección de línea.',
      technicalParams: {
        inletTdsPpm: 580,
        postMembraneTdsPpm: 18,
        finalProductTdsPpm: 3.5,
        ph: 6.85,
        conductivityUs: 7.2,
        resistivityMohm: 13.8,
        networkConsumedLiters: 4500,
        totalPureWaterLiters: 3375,
      },
      sparesUsed: [
        { name: 'Membrana Filmtec BW30-4040', quantity: 1, unitCost: 850 },
        { name: 'Filtro Spun 5 micras', quantity: 2, unitCost: 35 },
      ],
      technicianName: 'Mauro Gutierrez',
      technicianHours: 3.5,
      signatureMetadata: {
        signatureImage: '',
        vectorStrokes: [],
        latitude: -8.111678,
        longitude: -79.028774,
        accuracyMeters: 4.2,
        timestampIso: new Date().toISOString(),
        signerFullName: 'Dr. Roberto Sánchez (Director Médico)',
        signerDniOrRuc: '10458291',
        signerRole: 'Responsable de Sede',
        technicianId: 'TECH-MGUTIERREZ',
      },
      integrityHash: 'a7c9f84283de1b9f7c81d234a9b5f67e890123456789abcdef0123456789abcd',
    });
  }

  openContractModal(): void {
    if (this.currentRole !== UserRole.GERENCIA) {
      alert('Acceso restringido: Solo la Gerencia General puede crear clientes y emitir contratos.');
      return;
    }
    this.isContractModalOpen = true;
  }

  openDispatchModal(): void {
    if (this.currentRole !== UserRole.GERENCIA) {
      alert('Acceso restringido: Solo Gerencia General puede autorizar salidas del almacén central.');
      return;
    }
    this.isDispatchModalOpen = true;
  }

  onContractSaved(contract: any): void {
    alert(`Contrato ${contract.contractNumber} guardado exitosamente con SLA de ${contract.emergencyMaxHours}h.`);
  }

  onClientSaved(client: any): void {
    this.clients = [...this.clients, client];
  }

  onStockDispatched(res: any): void {
    alert(`Despacho autorizado: ${res.quantity}x ${res.spareName} transferido al técnico ${res.technicianName} para la orden ${res.orderCode}.`);
  }
}
