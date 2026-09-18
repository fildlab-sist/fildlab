import { IsNotEmpty, IsString, IsNumber, IsOptional, Min } from 'class-validator';
import type { AssignStockToTechnicianDto } from '@fildlab/shared-dtos';

export class AssignStockBodyDto implements AssignStockToTechnicianDto {
  @IsString()
  @IsNotEmpty({ message: 'REQ-04: Es obligatorio vincular la salida física a una orden de trabajo válida.' })
  workOrderId!: string;

  @IsString()
  @IsNotEmpty({ message: 'REQ-04: El técnico asignado es obligatorio.' })
  technicianId!: string;

  @IsString()
  @IsNotEmpty({ message: 'REQ-04: El repuesto a transferir es obligatorio.' })
  sparePartId!: string;

  @IsNumber()
  @Min(1, { message: 'REQ-04: La cantidad a transferir debe ser al menos 1 unidad.' })
  quantity!: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
