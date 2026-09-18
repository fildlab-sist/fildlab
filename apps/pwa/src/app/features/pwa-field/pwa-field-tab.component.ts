import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DigitalSignatureMetadataDto,
  CloseWorkOrderPayloadDto,
  TechnicalParametersDto,
} from '@fildlab/shared-dtos';
import { FildlabDexieDb } from '../../core/offline/dexie-db.service.js';
import { SyncEngineService } from '../../core/offline/sync-engine.service.js';
import { PdfReportGeneratorService } from '../../core/pdf/pdf-report-generator.service.js';
import { SignaturePadComponent } from '../../shared/ui/signature-pad/signature-pad.component.js';
import {
  SparePartsPickerComponent,
  SelectedSpareItem,
} from './components/spare-parts-picker/spare-parts-picker.component.js';
import { WaterParametersFormComponent } from './components/water-parameters-form/water-parameters-form.component.js';
import { ASSIGNED_ORDERS_MOCK, AssignedOrder } from './assigned-orders.data.js';

@Component({
  selector: 'app-pwa-field-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SignaturePadComponent,
    SparePartsPickerComponent,
    WaterParametersFormComponent,
  ],
  templateUrl: './pwa-field-tab.component.html',
})
export class PwaFieldTabComponent implements OnInit {
  activeSection: 1 | 2 | 3 = 1;
  showDetails = false;
  signatureCompleted = false;
  lastSignatureMetadata: DigitalSignatureMetadataDto | null = null;

  assignedOrders: AssignedOrder[] = ASSIGNED_ORDERS_MOCK;
  activeOrderId = this.assignedOrders[0].id;
  selectedOrder = this.assignedOrders[0];
  technicalParams = { ...this.assignedOrders[0].params };
  selectedSpares: SelectedSpareItem[] = [...this.assignedOrders[0].spares];

  get recoveryPercentage(): number {
    const { totalPureWaterLiters, networkConsumedLiters } = this.technicalParams;
    return networkConsumedLiters > 0 ? Number(((totalPureWaterLiters / networkConsumedLiters) * 100).toFixed(1)) : 0;
  }

  get saltRejectionPercentage(): number {
    const { inletTdsPpm, finalProductTdsPpm } = this.technicalParams;
    return inletTdsPpm > 0 ? Number((((inletTdsPpm - finalProductTdsPpm) / inletTdsPpm) * 100).toFixed(1)) : 0;
  }

  constructor(
    private readonly dexieDb: FildlabDexieDb,
    readonly syncEngine: SyncEngineService,
    private readonly pdfService: PdfReportGeneratorService,
  ) {}

  async ngOnInit(): Promise<void> {
    await this.syncEngine.refreshPendingCount();
  }

  onOrderChange(newOrderId: string): void {
    const found = this.assignedOrders.find((o) => o.id === newOrderId);
    if (found) {
      this.activeOrderId = found.id;
      this.selectedOrder = found;
      this.technicalParams = { ...found.params };
      this.selectedSpares = [...found.spares];
      this.signatureCompleted = false;
      this.lastSignatureMetadata = null;
    }
  }

  toggleDetails(): void {
    this.showDetails = !this.showDetails;
  }

  setSection(sec: 1 | 2 | 3): void {
    this.activeSection = sec;
  }

  onParamsUpdated(params: TechnicalParametersDto): void {
    this.technicalParams = params;
  }

  onSparesUpdated(spares: SelectedSpareItem[]): void {
    this.selectedSpares = spares;
  }

  async handleSignatureCaptured(metadata: DigitalSignatureMetadataDto): Promise<void> {
    this.lastSignatureMetadata = metadata;
    this.signatureCompleted = true;

    const payload: CloseWorkOrderPayloadDto = {
      orderId: this.activeOrderId,
      diagnosis: this.selectedOrder.diagnosis,
      workPerformed: this.selectedOrder.workPerformed,
      technicalParameters: this.technicalParams,
      usedSpares: this.selectedSpares.map((s) => ({
        sparePartId: s.sparePartId,
        quantity: s.quantity,
        unitCost: s.unitCost,
      })),
      technicianWorkHours: 3.5,
      technicianHourlyRate: 40,
      signatureMetadata: metadata,
    };

    await this.dexieDb.recordFieldInterventionLocally(this.activeOrderId, payload);
    await this.syncEngine.refreshPendingCount();

    if (typeof navigator !== 'undefined' && navigator.onLine) {
      await this.syncEngine.processPendingSyncQueue();
    }
  }

  triggerSync(): void {
    this.syncEngine.processPendingSyncQueue();
  }

  async downloadPdf(): Promise<void> {
    if (!this.lastSignatureMetadata) return;

    await this.pdfService.downloadReportPdf({
      orderCode: this.selectedOrder.orderCode,
      clientName: this.selectedOrder.clientName,
      clientRuc: this.selectedOrder.clientRuc,
      branchName: this.selectedOrder.branchName,
      branchAddress: this.selectedOrder.branchAddress,
      equipmentType: this.selectedOrder.equipmentType,
      equipmentSerial: this.selectedOrder.equipmentSerial,
      diagnosis: this.selectedOrder.diagnosis,
      workPerformed: this.selectedOrder.workPerformed,
      technicalParams: this.technicalParams,
      sparesUsed: this.selectedSpares,
      technicianName: 'Mauro Gutierrez',
      technicianHours: 3.5,
      signatureMetadata: this.lastSignatureMetadata,
    });
  }
}
