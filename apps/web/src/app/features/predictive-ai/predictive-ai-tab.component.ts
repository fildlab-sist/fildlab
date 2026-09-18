import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TechnicalParametersDto,
  validatePhysicalParameters,
} from '@fildlab/shared-dtos';

interface PredictionOutput {
  predictedRulDays: number;
  failureRiskScore: number;
  criticalRiskAlert: boolean;
  confidence: number;
}

@Component({
  selector: 'app-predictive-ai-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './predictive-ai-tab.component.html',
})
export class PredictiveAiTabComponent {
  aiSimulationParams: TechnicalParametersDto = {
    inletTdsPpm: 680,
    postMembraneTdsPpm: 45,
    finalProductTdsPpm: 5.2,
    ph: 6.9,
    conductivityUs: 55,
    resistivityMohm: 8.5,
    networkConsumedLiters: 5000,
    totalPureWaterLiters: 2100,
    inletPh: 7.4,
    outletPh: 6.9,
    inletConductivityUs: 680,
    outletConductivityUs: 55,
    inletPressurePsi: 40,
    membranePressurePsi: 88,
    recoveryRatePercentage: 42,
  };

  aiPredictionResult: PredictionOutput | null = null;
  aiCircuitBreakerAnomalies: string[] = [];

  runAiInference(): void {
    const rangeValidation = validatePhysicalParameters(this.aiSimulationParams);

    if (!rangeValidation.isValid) {
      this.aiCircuitBreakerAnomalies = rangeValidation.anomalies;
      this.aiPredictionResult = null;
      return;
    }

    this.aiCircuitBreakerAnomalies = [];
    const isCritical = (this.aiSimulationParams.conductivityUs ?? this.aiSimulationParams.outletConductivityUs ?? 0) > 50;
    const failureScore = isCritical ? 0.84 : 0.22;
    const rulDays = Math.round((1 - failureScore) * 365);

    this.aiPredictionResult = {
      predictedRulDays: rulDays,
      failureRiskScore: failureScore,
      criticalRiskAlert: isCritical,
      confidence: 0.94,
    };
  }

  simulateAnomalousParameters(): void {
    this.aiSimulationParams.ph = -2.5;
    this.aiSimulationParams.inletPh = -2.5;
    this.aiSimulationParams.conductivityUs = 9999;
    this.aiSimulationParams.inletConductivityUs = 9999;
    this.runAiInference();
  }

  resetAiParameters(): void {
    this.aiSimulationParams.ph = 6.9;
    this.aiSimulationParams.inletPh = 7.2;
    this.aiSimulationParams.conductivityUs = 55;
    this.aiSimulationParams.outletConductivityUs = 55;
    this.aiSimulationParams.inletConductivityUs = 680;
    this.runAiInference();
  }
}
