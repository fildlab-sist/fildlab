import { Module } from '@nestjs/common';
import { PredictiveController } from './presentation/predictive.controller.js';
import { EvaluateEquipmentHealthUseCase } from './application/use-cases/evaluate-equipment-health.use-case.js';
import { EquipmentDegradationCalculator } from './domain/services/equipment-degradation.calculator.js';
import { PrismaService } from '../../core/database/prisma.service.js';

@Module({
  controllers: [PredictiveController],
  providers: [
    EvaluateEquipmentHealthUseCase,
    EquipmentDegradationCalculator,
    PrismaService,
  ],
  exports: [EvaluateEquipmentHealthUseCase],
})
export class PredictiveModule {}
