import { Module } from '@nestjs/common';
import { WorkOrdersController } from './presentation/work-orders.controller.js';
import { CloseAndLockWorkOrderUseCase } from './application/use-cases/close-and-lock-work-order.use-case.js';
import { CreateOrderAddendumUseCase } from './application/use-cases/create-order-addendum.use-case.js';
import { IntegrityHashService } from '../../core/crypto/integrity-hash.service.js';
import { PrismaService } from '../../core/database/prisma.service.js';

@Module({
  controllers: [WorkOrdersController],
  providers: [
    CloseAndLockWorkOrderUseCase,
    CreateOrderAddendumUseCase,
    IntegrityHashService,
    PrismaService,
  ],
  exports: [CloseAndLockWorkOrderUseCase, CreateOrderAddendumUseCase],
})
export class WorkOrdersModule {}
