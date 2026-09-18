import { Injectable } from '@nestjs/common';
import { TechnicalParametersDto } from '@fildlab/shared-dtos';

export interface DegradationEvaluationResult {
  failureRiskScore: number;
  predictedRulDays: number;
  isCritical: boolean;
  confidenceScore: number;
}

@Injectable()
export class EquipmentDegradationCalculator {
  private readonly CRITICAL_THRESHOLD = 0.75;

  /**
   * Responsabilidad Única: Cálculo matemático de índices de degradación
   * de membranas osmóticas y estimación de Vida Útil Remanente (RUL).
   */
  calculateDegradation(params: TechnicalParametersDto): DegradationEvaluationResult {
    let failureRiskScore = 0.15; // Riesgo base por desgaste natural

    // 1. Pérdida de rechazo de sales (conductividad permeado elevada)
    if (params.outletConductivityUs && params.outletConductivityUs > 50) {
      failureRiskScore += 0.35;
    }

    // 2. Ensuciamiento severo / incrustación hidráulica (fouling)
    if (params.membranePressurePsi && params.membranePressurePsi > 80) {
      failureRiskScore += 0.30;
    }

    // 3. Pérdida de productividad en permeado
    if (params.recoveryRatePercentage && params.recoveryRatePercentage < 40) {
      failureRiskScore += 0.15;
    }

    // Normalizar entre 5% y 98%
    failureRiskScore = Math.min(Math.max(failureRiskScore, 0.05), 0.98);

    // Estimación de RUL en días
    const predictedRulDays = Math.round((1 - failureRiskScore) * 365);
    const isCritical = failureRiskScore >= this.CRITICAL_THRESHOLD;

    return {
      failureRiskScore,
      predictedRulDays,
      isCritical,
      confidenceScore: 0.92,
    };
  }
}
