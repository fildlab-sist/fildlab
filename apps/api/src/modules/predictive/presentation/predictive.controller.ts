import { Controller, Post, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { EvaluateEquipmentHealthUseCase } from '../application/use-cases/evaluate-equipment-health.use-case.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { TechnicalParametersDto } from '@fildlab/shared-dtos';

@Controller('predictive')
@UseGuards(JwtAuthGuard)
export class PredictiveController {
  constructor(private readonly evaluateUseCase: EvaluateEquipmentHealthUseCase) {}

  /**
   * REQ-14, 15, 16: Inferencia ligera de RUL con Circuit Breaker de parámetros físicos
   */
  @Post('evaluate')
  @HttpCode(HttpStatus.OK)
  async evaluateEquipment(
    @Body() body: { equipmentId: string; workOrderId?: string; parameters: TechnicalParametersDto },
  ) {
    return this.evaluateUseCase.execute({
      equipmentId: body.equipmentId,
      workOrderId: body.workOrderId,
      parameters: body.parameters,
    });
  }
}
