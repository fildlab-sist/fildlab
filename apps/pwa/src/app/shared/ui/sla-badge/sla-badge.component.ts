import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sla-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      [class]="getBadgeClasses()"
      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all"
    >
      <span [class]="getDotClasses()" class="w-1.5 h-1.5 rounded-full"></span>
      <span>{{ getLabel() }}</span>
    </span>
  `,
})
export class SlaBadgeComponent {
  /** Indica si el tiempo máximo estipulado en el contrato fue superado (REQ-12) */
  @Input() slaBreached: boolean = false;
  /** Minutos de retraso acumulados si superó el SLA */
  @Input() delayMinutes: number = 0;
  /** Minutos restantes antes de vencer el SLA */
  @Input() minutesRemaining?: number;

  getBadgeClasses(): string {
    if (this.slaBreached) {
      return 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
    }
    if (this.minutesRemaining != null && this.minutesRemaining <= 60) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  getDotClasses(): string {
    if (this.slaBreached) return 'bg-rose-500';
    if (this.minutesRemaining != null && this.minutesRemaining <= 60) return 'bg-amber-500';
    return 'bg-emerald-500';
  }

  getLabel(): string {
    if (this.slaBreached) {
      const hours = Math.floor(this.delayMinutes / 60);
      const mins = this.delayMinutes % 60;
      return `SLA Vencido (+${hours}h ${mins}m retraso)`;
    }
    if (this.minutesRemaining != null && this.minutesRemaining <= 60) {
      return `Riesgo SLA (${this.minutesRemaining}m restantes)`;
    }
    return 'SLA Cumplido';
  }
}
