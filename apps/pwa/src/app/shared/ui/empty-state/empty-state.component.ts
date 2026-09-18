import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-2xl border border-slate-200/80 p-8 sm:p-12 text-center max-w-lg mx-auto shadow-sm">
      <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
        <svg class="w-8 h-8 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>

      <!-- Etiqueta Informativa Estricta REQ-13 -->
      <h4 class="text-base font-semibold text-slate-800 mb-1">
        {{ title }}
      </h4>
      <p class="text-xs text-slate-500 max-w-xs mx-auto mb-6 leading-relaxed">
        {{ description }}
      </p>

      <div *ngIf="actionLabel" class="inline-block">
        <button
          type="button"
          (click)="onAction()"
          class="text-xs font-semibold px-4 py-2 bg-fildlab-50 text-fildlab-700 hover:bg-fildlab-100 border border-fildlab-200 rounded-lg transition-colors"
        >
          {{ actionLabel }}
        </button>
      </div>
    </div>
  `,
})
export class EmptyStateComponent {
  /** REQ-13: Mensaje exacto exigido */
  @Input() title: string = 'Sin datos disponibles para el periodo';
  @Input() description: string = 'No se encontraron intervenciones técnicas ni registros de facturación en el rango de fechas seleccionado.';
  @Input() actionLabel?: string;

  onAction(): void {
    // Callback para resetear filtros
  }
}
