import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CalculateContractProfitabilityUseCase } from '../application/use-cases/calculate-contract-profitability.use-case.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../../core/guards/roles.guard.js';
import { Roles } from '../../../core/guards/roles.decorator.js';

@Controller('bi')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BiAnalyticsController {
  constructor(private readonly profitabilityUseCase: CalculateContractProfitabilityUseCase) {}

  /**
   * REQ-11, 12, 13, RN-01: Tablero analítico de margen real y SLA (Solo GERENCIA)
   */
  @Get('profitability')
  @Roles(UserRole.GERENCIA)
  async getProfitability(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.profitabilityUseCase.execute({
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
    });
  }
}
