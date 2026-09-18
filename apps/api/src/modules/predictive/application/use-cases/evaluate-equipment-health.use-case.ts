import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { EquipmentDegradationCalculator } from '../../domain/services/equipment-degradation.calculator.js';
import {
  TechnicalParametersDto,
  validatePhysicalParameters,
  MlAuditErrorType,
  EquipmentStatus,
} from '@fildlab/shared-dtos';

export interface EvaluateHealthDto {
  equipmentId: string;
  workOrderId?: string;
  parameters: TechnicalParametersDto;
}

@Injectable()
export class EvaluateEquipmentHealthUseCase {
  private readonly logger = new Logger(EvaluateEquipmentHealthUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly calculator: EquipmentDegradationCalculator,
  ) {}

  async execute(dto: EvaluateHealthDto) {
    const { equipmentId, workOrderId, parameters } = dto;

    // 1. Verificación de Rangos Físicos (Circuit Breaker REQ-16)
    const rangeCheck = validatePhysicalParameters(parameters);

    if (!rangeCheck.isValid) {
      this.logger.warn(
        `[REQ-16 Circuit Breaker] Parámetros físicos anómalos detectados para equipo ${equipmentId}. Omitiendo cálculo predictivo.`,
      );

      await this.prisma.mlAuditLog.create({
        data: {
          equipmentId,
          workOrderId,
          inputFeatures: parameters as any,
          errorType: MlAuditErrorType.OUT_OF_PHYSICAL_RANGE,
          errorDetails: rangeCheck.anomalies.join(' | '),
        },
      });

      return {
        success: false,
        status: 'OMITTED_ANOMALOUS_PARAMETERS',
        message: 'Cálculo predictivo omitido por parámetros fuera de rango físico. Registrado en auditoría.',
        anomalies: rangeCheck.anomalies,
      };
    }

    // 2. Delegación del cálculo de degradación a servicio especializado (SRP)
    const evaluation = this.calculator.calculateDegradation(parameters);

    // 3. Persistir la predicción en base de datos
    const prediction = await this.prisma.equipmentPrediction.create({
      data: {
        equipmentId,
        workOrderId,
        predictedRulDays: evaluation.predictedRulDays,
        failureRiskScore: evaluation.failureRiskScore,
        criticalRiskAlert: evaluation.isCritical,
        confidenceScore: evaluation.confidenceScore,
      },
    });

    // 4. Actualización reactiva si supera el umbral crítico (REQ-15)
    if (evaluation.isCritical) {
      await this.prisma.equipment.update({
        where: { id: equipmentId },
        data: { status: EquipmentStatus.CRITICO },
      });
      this.logger.error(
        `[REQ-15 ALERTA CRÍTICA] Equipo ${equipmentId} superó el umbral de riesgo de avería (${(evaluation.failureRiskScore * 100).toFixed(1)}%). RUL estimado: ${evaluation.predictedRulDays} días.`,
      );
    }

    return {
      success: true,
      status: 'CALCULATED',
      predictionId: prediction.id,
      predictedRulDays: evaluation.predictedRulDays,
      failureRiskScore: evaluation.failureRiskScore,
      criticalRiskAlert: evaluation.isCritical,
      equipmentId,
    };
  }
}
