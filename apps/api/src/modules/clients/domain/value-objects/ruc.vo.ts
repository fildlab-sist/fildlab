import { BadRequestException } from '@nestjs/common';
import { validateRucSUNAT } from '@fildlab/shared-dtos';

export class RucValueObject {
  private readonly value: string;

  constructor(rawRuc: string) {
    const result = validateRucSUNAT(rawRuc);
    if (!result.isValid) {
      throw new BadRequestException(`Validación RUC fallida (REQ-01): ${result.message}`);
    }
    this.value = rawRuc.trim();
  }

  getValue(): string {
    return this.value;
  }

  toString(): string {
    return this.value;
  }
}
