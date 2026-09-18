import { Module } from '@nestjs/common';
import { BiAnalyticsController } from './presentation/bi-analytics.controller.js';
import { CalculateContractProfitabilityUseCase } from './application/use-cases/calculate-contract-profitability.use-case.js';
import { ContractProfitabilityCalculator } from './domain/services/contract-profitability.calculator.js';
import { PrismaService } from '../../core/database/prisma.service.js';

@Module({
  controllers: [BiAnalyticsController],
  providers: [
    CalculateContractProfitabilityUseCase,
    ContractProfitabilityCalculator,
    PrismaService,
  ],
  exports: [CalculateContractProfitabilityUseCase],
})
export class BiAnalyticsModule {}
