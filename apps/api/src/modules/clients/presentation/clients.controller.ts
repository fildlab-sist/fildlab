import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { RolesGuard } from '../../../core/guards/roles.guard.js';
import { Roles } from '../../../core/guards/roles.decorator.js';
import { UserRole } from '@fildlab/shared-dtos';
import { RegisterClientUseCase } from '../application/use-cases/register-client.use-case.js';
import { CreateContractUseCase } from '../application/use-cases/create-contract.use-case.js';
import { ListClientsUseCase } from '../application/use-cases/list-clients.use-case.js';
import { CreateClientBodyDto, CreateContractBodyDto } from './dtos/client.dtos.js';

@Controller('clients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClientsController {
  constructor(
    private readonly registerClientUseCase: RegisterClientUseCase,
    private readonly createContractUseCase: CreateContractUseCase,
    private readonly listClientsUseCase: ListClientsUseCase,
  ) {}

  /**
   * REQ-01 y RN-01: Registro de cliente corporativo (Solo GERENCIA).
   */
  @Post()
  @Roles(UserRole.GERENCIA)
  async registerClient(@Body() dto: CreateClientBodyDto) {
    return this.registerClientUseCase.execute(dto);
  }

  /**
   * REQ-01: Consulta de clientes corporativos y sus contratos vigentes.
   */
  @Get()
  async listClients() {
    return this.listClientsUseCase.execute();
  }

  /**
   * REQ-02, REQ-03 y RN-01: Asociación de contrato de tratamiento de agua y SLA (Solo GERENCIA).
   */
  @Post(':id/contracts')
  @Roles(UserRole.GERENCIA)
  async createContract(
    @Param('id') clientId: string,
    @Body() dto: CreateContractBodyDto,
    @Request() req: any,
  ) {
    const fullDto = {
      ...dto,
      clientId,
    };
    const userId = req.user?.sub || 'user-gerencia-default';
    return this.createContractUseCase.execute(fullDto, userId);
  }
}
