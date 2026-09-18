import { Controller, Post, Get, Param, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { AssignStockBodyDto } from './dtos/assign-stock.dto.js';
import { LiquidateOrderInventoryUseCase } from '../application/use-cases/liquidate-order-inventory.use-case.js';
import { AssignStockToTechnicianUseCase } from '../application/use-cases/assign-stock-to-technician.use-case.js';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../../core/guards/roles.guard.js';
import { Roles } from '../../../core/guards/roles.decorator.js';
import { CurrentUser } from '../../auth/current-user.decorator.js';

@Controller('inventory')
@UseGuards(JwtAuthGuard, RolesGuard)
export class InventoryController {
  constructor(
    private readonly liquidateUseCase: LiquidateOrderInventoryUseCase,
    private readonly assignStockUseCase: AssignStockToTechnicianUseCase,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * RN-01, RN-03 Fase 3: Liquidación contable definitiva de orden (Solo GERENCIA)
   */
  @Post('orders/:id/liquidate')
  @Roles(UserRole.GERENCIA)
  @HttpCode(HttpStatus.OK)
  async liquidateOrder(
    @Param('id') orderId: string,
    @Body() body: { notes?: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.liquidateUseCase.execute({
      workOrderId: orderId,
      gerenciaUserId: user.id,
      liquidationNotes: body.notes,
    });
  }

  /**
   * REQ-04 y RN-01: Asignación de repuestos desde almacén central a móvil técnico (Solo GERENCIA)
   */
  @Post('assign-to-technician')
  @Roles(UserRole.GERENCIA)
  @HttpCode(HttpStatus.OK)
  async assignToTechnician(
    @Body() dto: AssignStockBodyDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.assignStockUseCase.execute(dto, user.id);
  }

  /**
   * REQ-04: Consulta de stock en almacén central y alertas de stock mínimo
   */
  @Get('stock')
  async getCentralStock() {
    return this.prisma.sparePart.findMany({
      where: { isActive: true },
      orderBy: { centralStock: 'asc' },
    });
  }
}

