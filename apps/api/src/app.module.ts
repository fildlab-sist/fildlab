import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './core/database/prisma.service.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { WorkOrdersModule } from './modules/work-orders/work-orders.module.js';
import { InventoryModule } from './modules/inventory/inventory.module.js';
import { BiAnalyticsModule } from './modules/bi-analytics/bi-analytics.module.js';
import { PredictiveModule } from './modules/predictive/predictive.module.js';
import { ClientsModule } from './modules/clients/clients.module.js';
import { HealthController } from './modules/health/health.controller.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    ClientsModule,
    WorkOrdersModule,
    InventoryModule,
    BiAnalyticsModule,
    PredictiveModule,
  ],
  controllers: [HealthController],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
