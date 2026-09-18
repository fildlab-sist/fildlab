import { IsNotEmpty, IsString, IsArray, IsNumber, IsOptional } from 'class-validator';
import type {
  CloseWorkOrderPayloadDto,
  DigitalSignatureMetadataDto,
  TechnicalParametersDto,
  UsedSparePartDto,
} from '@fildlab/shared-dtos';

export class CloseWorkOrderBodyDto implements CloseWorkOrderPayloadDto {
  @IsString()
  @IsNotEmpty()
  orderId!: string;

  @IsString()
  @IsNotEmpty()
  diagnosis!: string;

  @IsString()
  @IsNotEmpty()
  workPerformed!: string;

  @IsString()
  @IsOptional()
  observations?: string;

  @IsNotEmpty()
  technicalParameters!: TechnicalParametersDto;

  @IsArray()
  usedSpares!: UsedSparePartDto[];

  @IsNumber()
  technicianWorkHours!: number;

  @IsNumber()
  technicianHourlyRate!: number;

  @IsNotEmpty()
  signatureMetadata!: DigitalSignatureMetadataDto;
}
