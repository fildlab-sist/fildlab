import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { validateRucSUNAT, RucValidationResult } from '@fildlab/shared-dtos';

@Component({
  selector: 'app-contract-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contract-modal.component.html',
})
export class ContractModalComponent {
  @Input() isOpen = false;
  @Input() clients: Array<{ id: string; ruc: string; businessName: string }> = [];
  @Output() close = new EventEmitter<void>();
  @Output() contractSaved = new EventEmitter<any>();
  @Output() clientSaved = new EventEmitter<any>();

  activeTab: 'contract' | 'client' = 'contract';

  // Formulario Contrato (REQ-02, REQ-03)
  contractClientId = '';
  contractNumber = 'CTR-2026-003';
  contractStartDate = '';
  contractEndDate = '';
  contractMonthlyFee = 3200;
  contractSlaHours = 4;
  contractPenaltyPerHour = 45;
  contractDescription = 'Mantenimiento preventivo mensual de sistema de ósmosis y desinfección.';

  // Formulario Cliente (REQ-01)
  clientRuc = '';
  clientBusinessName = '';
  clientFiscalAddress = '';
  clientBranch = 'Sede Principal Hemodiálisis';
  clientPhone = '044-204060';
  clientEmail = 'administracion@clinica.pe';
  rucValidation: RucValidationResult = { isValid: false, message: 'Ingrese un RUC de 11 dígitos' };

  errorMessage: string | null = null;
  successMessage: string | null = null;

  onRucInput(val: string): void {
    this.clientRuc = val;
    this.rucValidation = validateRucSUNAT(val);
  }

  validateContractForm(): boolean {
    this.errorMessage = null;

    if (!this.contractClientId) {
      this.errorMessage = 'Debe seleccionar obligatoriamente un cliente corporativo.';
      return false;
    }
    if (!this.contractNumber.trim()) {
      this.errorMessage = 'El código o número de contrato es obligatorio.';
      return false;
    }
    if (!this.contractStartDate || !this.contractEndDate) {
      this.errorMessage = 'Debe especificar tanto la fecha de inicio como la de término del contrato.';
      return false;
    }

    const start = new Date(this.contractStartDate);
    const end = new Date(this.contractEndDate);
    if (end.getTime() <= start.getTime()) {
      this.errorMessage = `La fecha de término (${this.contractEndDate}) no puede ser anterior o igual a la de inicio (${this.contractStartDate}).`;
      return false;
    }

    if (!this.contractMonthlyFee || this.contractMonthlyFee <= 0) {
      this.errorMessage = 'La cuota mensual pactada debe ser mayor a S/. 0.00.';
      return false;
    }
    if (!this.contractSlaHours || this.contractSlaHours <= 0) {
      this.errorMessage = 'El tiempo máximo de respuesta ante emergencias SLA debe ser mayor a 0 horas.';
      return false;
    }

    return true;
  }

  submitContract(): void {
    if (!this.validateContractForm()) return;

    const newContract = {
      clientId: this.contractClientId,
      contractNumber: this.contractNumber,
      startDate: this.contractStartDate,
      endDate: this.contractEndDate,
      monthlyFee: this.contractMonthlyFee,
      emergencyMaxHours: this.contractSlaHours,
      penaltyPerHourDelay: this.contractPenaltyPerHour,
      description: this.contractDescription,
    };

    this.contractSaved.emit(newContract);
    this.successMessage = `Contrato ${this.contractNumber} emitido exitosamente con SLA de ${this.contractSlaHours}h.`;
    setTimeout(() => this.closeModal(), 1200);
  }

  submitClient(): void {
    if (!this.rucValidation.isValid) {
      this.errorMessage = this.rucValidation.message || 'El RUC ingresado no es válido ante SUNAT.';
      return;
    }
    if (!this.clientBusinessName.trim()) {
      this.errorMessage = 'La razón social del cliente corporativo es obligatoria.';
      return;
    }

    const newClient = {
      id: `cli-${Date.now()}`,
      ruc: this.clientRuc,
      businessName: this.clientBusinessName.trim(),
      fiscalAddress: this.clientFiscalAddress,
      primaryBranch: this.clientBranch,
    };

    this.clientSaved.emit(newClient);
    this.successMessage = `Cliente ${newClient.businessName} registrado con RUC validado ${newClient.ruc}.`;
    this.contractClientId = newClient.id;
    setTimeout(() => {
      this.activeTab = 'contract';
      this.successMessage = null;
      this.errorMessage = null;
    }, 1200);
  }

  closeModal(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.close.emit();
  }
}
