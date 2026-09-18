import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { RucValueObject } from '../../domain/value-objects/ruc.vo.js';
import { CreateClientDto } from '@fildlab/shared-dtos';

@Injectable()
export class RegisterClientUseCase {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * REQ-01: Registro de cliente corporativo validando RUC de 11 dígitos SUNAT.
   */
  async execute(dto: CreateClientDto) {
    // 1. Validación de Dominio (Módulo 11 SUNAT)
    const validRuc = new RucValueObject(dto.ruc).getValue();

    // 2. Verificar no duplicidad
    const existing = await this.prisma.client.findUnique({
      where: { ruc: validRuc },
    });

    if (existing) {
      throw new ConflictException(
        `REQ-01: Ya existe un cliente corporativo registrado con el RUC ${validRuc} (${existing.businessName}).`,
      );
    }

    // 3. Persistir cliente y su sede principal
    const branchName = dto.primaryBranchName || 'Sede Principal';
    const branchAddress = dto.primaryBranchAddress || dto.fiscalAddress || 'Dirección no especificada';

    const client = await this.prisma.client.create({
      data: {
        ruc: validRuc,
        businessName: dto.businessName.trim(),
        commercialName: dto.tradeName?.trim() || dto.businessName.trim(),
        contactPhone: dto.phone || '044-000000',
        contactEmail: dto.email || 'contacto@cliente.pe',
        fiscalAddress: dto.fiscalAddress || branchAddress,
        branches: {
          create: {
            name: branchName,
            address: branchAddress,
          },
        },
      },
      include: {
        branches: true,
      },
    });

    return {
      id: client.id,
      ruc: client.ruc,
      businessName: client.businessName,
      commercialName: client.commercialName,
      contactEmail: client.contactEmail,
      contactPhone: client.contactPhone,
      fiscalAddress: client.fiscalAddress,
      branches: client.branches.map((b) => ({
        id: b.id,
        name: b.name,
        address: b.address,
      })),
      createdAt: client.createdAt,
    };
  }
}
