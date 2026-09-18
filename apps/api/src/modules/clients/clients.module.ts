import { Module } from '@nestjs/common';
import { ClientsController } from './presentation/clients.controller.js';
import { RegisterClientUseCase } from './application/use-cases/register-client.use-case.js';
import { CreateContractUseCase } from './application/use-cases/create-contract.use-case.js';
import { ListClientsUseCase } from './application/use-cases/list-clients.use-case.js';

@Module({
  controllers: [ClientsController],
  providers: [
    RegisterClientUseCase,
    CreateContractUseCase,
    ListClientsUseCase,
  ],
  exports: [
    RegisterClientUseCase,
    CreateContractUseCase,
    ListClientsUseCase,
  ],
})
export class ClientsModule {}
