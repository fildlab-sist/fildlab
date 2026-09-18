import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err: any) {
      console.warn('⚠️ [PrismaService] No se pudo conectar a la base de datos remota (modo offline/demo):', err.message);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
