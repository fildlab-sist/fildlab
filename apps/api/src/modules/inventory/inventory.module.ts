import { Module } from '@nestjs/common';
import { InventoryController } from './presentation/inventory.controller.js';
import { LiquidateOrderInventoryUseCase } from './application/use-cases/liquidate-order-inventory.use-case.js';
import { AssignStockToTechnicianUseCase } from './application/use-cases/assign-stock-to-technician.use-case.js';
import { PrismaService } from '../../core/database/prisma.service.js';

@Module({
  controllers: [InventoryController],
  providers: [LiquidateOrderInventoryUseCase, AssignStockToTechnicianUseCase, PrismaService],
  exports: [LiquidateOrderInventoryUseCase, AssignStockToTechnicianUseCase],
})
export class InventoryModule {}
