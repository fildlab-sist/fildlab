import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SelectedSpareItem {
  sparePartId: string;
  name: string;
  quantity: number;
  unitCost: number;
}

export interface CatalogSpareItem {
  id: string;
  name: string;
  unitCost: number;
  stockVan: number;
}

@Component({
  selector: 'app-spare-parts-picker',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './spare-parts-picker.component.html',
})
export class SparePartsPickerComponent {
  @Input() selectedSpares: SelectedSpareItem[] = [];
  @Output() sparesChange = new EventEmitter<SelectedSpareItem[]>();

  isAdding = false;
  selectedCatalogId = '';

  catalog: CatalogSpareItem[] = [
    { id: 'sp-01', name: 'Membrana Filmtec BW30-4040', unitCost: 850, stockVan: 4 },
    { id: 'sp-02', name: 'Filtro Sedimentos Spun 5µm', unitCost: 35, stockVan: 12 },
    { id: 'sp-03', name: 'Saco Sal en Pellets USP 25kg', unitCost: 65, stockVan: 8 },
    { id: 'sp-04', name: 'Kit Sellos Clack WS1', unitCost: 190, stockVan: 3 },
    { id: 'sp-05', name: 'Cartucho Filtro PES 0.2µm', unitCost: 320, stockVan: 5 },
    { id: 'sp-06', name: 'Filtro Carbón Block CBC 10"', unitCost: 48, stockVan: 10 },
    { id: 'sp-07', name: 'Lámpara UV Germicida 55W', unitCost: 210, stockVan: 2 },
    { id: 'sp-08', name: 'Manómetro Glicerina 0-100 PSI', unitCost: 75, stockVan: 6 },
    { id: 'sp-09', name: 'Resina Catiónica Purolite (L)', unitCost: 28, stockVan: 50 },
    { id: 'sp-10', name: 'Válvula Solenoide 1/2"', unitCost: 140, stockVan: 4 },
  ];

  get availableCatalog(): CatalogSpareItem[] {
    const usedIds = new Set(this.selectedSpares.map((s) => s.sparePartId));
    return this.catalog.filter((c) => !usedIds.has(c.id));
  }

  get totalCost(): number {
    return this.selectedSpares.reduce((sum, s) => sum + s.quantity * s.unitCost, 0);
  }

  get totalItems(): number {
    return this.selectedSpares.reduce((sum, s) => sum + s.quantity, 0);
  }

  toggleAddMode(): void {
    this.isAdding = !this.isAdding;
    this.selectedCatalogId = this.availableCatalog[0]?.id || '';
  }

  addSelectedPart(): void {
    if (!this.selectedCatalogId) return;
    const part = this.catalog.find((c) => c.id === this.selectedCatalogId);
    if (!part) return;

    this.selectedSpares.push({
      sparePartId: part.id,
      name: part.name,
      quantity: 1,
      unitCost: part.unitCost,
    });
    this.isAdding = false;
    this.selectedCatalogId = '';
    this.sparesChange.emit(this.selectedSpares);
  }

  incrementQuantity(index: number): void {
    const item = this.selectedSpares[index];
    const cat = this.catalog.find((c) => c.id === item.sparePartId);
    const maxStock = cat ? cat.stockVan : 99;
    if (item.quantity < maxStock) {
      item.quantity++;
      this.sparesChange.emit(this.selectedSpares);
    }
  }

  decrementQuantity(index: number): void {
    if (this.selectedSpares[index].quantity > 1) {
      this.selectedSpares[index].quantity--;
      this.sparesChange.emit(this.selectedSpares);
    }
  }

  removeSpare(index: number): void {
    this.selectedSpares.splice(index, 1);
    this.sparesChange.emit(this.selectedSpares);
  }
}
