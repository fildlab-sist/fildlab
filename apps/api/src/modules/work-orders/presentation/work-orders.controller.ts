import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CloseAndLockWorkOrderUseCase } from '../application/use-cases/close-and-lock-work-order.use-case.js';
import { CreateOrderAddendumUseCase } from '../application/use-cases/create-order-addendum.use-case.js';
import { PrismaService } from '../../../core/database/prisma.service.js';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../../core/guards/roles.guard.js';
import { Roles } from '../../../core/guards/roles.decorator.js';
import { CurrentUser } from '../../auth/current-user.decorator.js';
import { CloseWorkOrderBodyDto } from './dtos/close-work-order.dto.js';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrdersController {
  constructor(
    private readonly closeOrderUseCase: CloseAndLockWorkOrderUseCase,
    private readonly addendumUseCase: CreateOrderAddendumUseCase,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * REQ-08, REQ-09, RN-02: Cierre legal con firma digital y bloqueo inmutable
   */
  @Post('close-and-lock')
  @HttpCode(HttpStatus.OK)
  async closeOrder(@Body() payload: CloseWorkOrderBodyDto) {
    return this.closeOrderUseCase.execute(payload);
  }

  /**
   * RN-01, RN-04: Emisión de Adenda / Nota de Corrección (Solo GERENCIA)
   */
  @Post(':id/addendum')
  @Roles(UserRole.GERENCIA)
  @HttpCode(HttpStatus.CREATED)
  async createAddendum(
    @Param('id') orderId: string,
    @Body() body: { reason: string; correctionDetails: string },
    @CurrentUser() user: { id: string },
  ) {
    return this.addendumUseCase.execute({
      workOrderId: orderId,
      createdById: user.id,
      reason: body.reason,
      correctionDetails: body.correctionDetails,
    });
  }

  /**
   * Consulta de órdenes de trabajo con filtrado por rol (RN-01)
   */
  @Get()
  async listOrders(@CurrentUser() user: { id: string; role: UserRole }) {
    const whereClause: any = {};
    if (user.role === UserRole.TECNICO) {
      whereClause.assignedTechnicianId = user.id;
    }

    return this.prisma.workOrder.findMany({
      where: whereClause,
      include: {
        client: { select: { businessName: true, ruc: true } },
        equipment: { select: { serialNumber: true, brand: true, model: true } },
        sparesUsed: true,
        addendums: true,
      },
      orderBy: { scheduledDate: 'desc' },
    });
  }
}
