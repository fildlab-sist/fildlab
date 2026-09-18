import { IsNotEmpty, IsString, IsNumber, IsOptional } from 'class-validator';
import type { CreateClientDto, CreateContractDto } from '@fildlab/shared-dtos';

export class CreateClientBodyDto implements CreateClientDto {
  @IsString()
  @IsNotEmpty({ message: 'REQ-01: El RUC de 11 dígitos es obligatorio.' })
  ruc!: string;

  @IsString()
  @IsNotEmpty({ message: 'REQ-01: La razón social del cliente es obligatoria.' })
  businessName!: string;

  @IsString()
  @IsOptional()
  tradeName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  fiscalAddress?: string;

  @IsString()
  @IsOptional()
  primaryBranchName?: string;

  @IsString()
  @IsOptional()
  primaryBranchAddress?: string;
}

export class CreateContractBodyDto implements Omit<CreateContractDto, 'clientId'> {
  @IsString()
  @IsNotEmpty({ message: 'REQ-03: El número o código de contrato es obligatorio.' })
  contractNumber!: string;

  @IsString()
  @IsNotEmpty({ message: 'REQ-03: Debe especificar la fecha de inicio del contrato.' })
  startDate!: string;

  @IsString()
  @IsNotEmpty({ message: 'REQ-03: Debe especificar la fecha de término del contrato.' })
  endDate!: string;

  @IsNumber()
  @IsNotEmpty({ message: 'REQ-03: La cuota mensual es obligatoria.' })
  monthlyRevenue!: number;

  @IsNumber()
  @IsNotEmpty({ message: 'REQ-03: El tiempo máximo de respuesta para emergencias SLA es obligatorio.' })
  emergencyResponseHours!: number;

  @IsNumber()
  @IsOptional()
  penaltyPerHourSoles!: number;

  @IsString()
  @IsOptional()
  description?: string;
}
