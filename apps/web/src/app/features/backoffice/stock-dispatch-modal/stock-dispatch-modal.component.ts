import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stock-dispatch-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './stock-dispatch-modal.component.html',
})
export class StockDispatchModalComponent {
  @Input() isOpen = false;
  @Input() workOrders: Array<{ id: string; code: string; client: string }> = [];
  @Output() close = new EventEmitter<void>();
  @Output() stockDispatched = new EventEmitter<any>();

  availableSpares = [
    { id: 'sp-01', name: 'Membrana Filmtec BW30-4040', centralStock: 12, unit: 'UND' },
    { id: 'sp-02', name: 'Filtro Sedimentos Spun 5 micras', centralStock: 45, unit: 'UND' },
    { id: 'sp-03', name: 'Filtro Carbón Activado CTO 10"', centralStock: 30, unit: 'UND' },
    { id: 'sp-04', name: 'Resina Catiónica Purolite C100E', centralStock: 80, unit: 'L' },
  ];

  technicians = [
    { id: 'tech-01', name: 'Mauro Gutierrez (Técnico de Campo Líder)' },
    { id: 'tech-02', name: 'Jorge Espejo (Técnico Especialista)' },
  ];

  selectedOrderId = '';
  selectedSpareId = 'sp-01';
  selectedTechId = 'tech-01';
  dispatchQuantity = 2;
  notes = 'Asignación preventiva para orden de hemodiálisis.';

  errorMessage: string | null = null;
  successMessage: string | null = null;

  submitDispatch(): void {
    this.errorMessage = null;

    if (!this.selectedOrderId) {
      this.errorMessage =
        'Es obligatorio vincular la salida física del almacén central a una orden de trabajo válida.';
      return;
    }

    if (!this.dispatchQuantity || this.dispatchQuantity <= 0) {
      this.errorMessage = 'La cantidad a transferir debe ser mayor a 0 unidades.';
      return;
    }

    const spare = this.availableSpares.find((s) => s.id === this.selectedSpareId);
    if (!spare || spare.centralStock < this.dispatchQuantity) {
      this.errorMessage = `Stock central insuficiente. Disponible: ${spare?.centralStock || 0} ${spare?.unit || 'UND'}.`;
      return;
    }

    const order = this.workOrders.find((o) => o.id === this.selectedOrderId);
    const tech = this.technicians.find((t) => t.id === this.selectedTechId);

    // Descontar en local simulado para feedback inmediato
    spare.centralStock -= this.dispatchQuantity;

    const dispatchResult = {
      orderId: this.selectedOrderId,
      orderCode: order?.code || this.selectedOrderId,
      sparePartId: this.selectedSpareId,
      spareName: spare.name,
      technicianId: this.selectedTechId,
      technicianName: tech?.name || this.selectedTechId,
      quantity: this.dispatchQuantity,
      remainingCentralStock: spare.centralStock,
      timestamp: new Date().toISOString(),
    };

    this.stockDispatched.emit(dispatchResult);
    this.successMessage = `${this.dispatchQuantity}x ${spare.name} transferido con éxito al técnico ${tech?.name}.`;

    setTimeout(() => {
      this.closeModal();
    }, 1500);
  }

  closeModal(): void {
    this.errorMessage = null;
    this.successMessage = null;
    this.close.emit();
  }
}
