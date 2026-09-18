import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TechnicalParametersDto } from '@fildlab/shared-dtos';

@Component({
  selector: 'app-water-parameters-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './water-parameters-form.component.html',
})
export class WaterParametersFormComponent {
  @Input() params!: TechnicalParametersDto;
  @Output() paramsChange = new EventEmitter<TechnicalParametersDto>();

  get recoveryPercentage(): number {
    if (!this.params) return 0;
    const { totalPureWaterLiters, networkConsumedLiters } = this.params;
    return networkConsumedLiters > 0
      ? Number(((totalPureWaterLiters / networkConsumedLiters) * 100).toFixed(1))
      : 0;
  }

  get saltRejectionPercentage(): number {
    if (!this.params) return 0;
    const { inletTdsPpm, finalProductTdsPpm } = this.params;
    return inletTdsPpm > 0
      ? Number((((inletTdsPpm - finalProductTdsPpm) / inletTdsPpm) * 100).toFixed(1))
      : 0;
  }

  onParamChange(): void {
    this.paramsChange.emit(this.params);
  }
}
