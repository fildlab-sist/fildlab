/**
 * DTOs e Interfaces de Dominio (SI_FILDLAB-2026)
 */

import { TechnicalParametersDto } from './physical-range.validator.js';

export interface DigitalSignatureMetadataDto {
  signatureImage: string;
  vectorStrokes?: Array<{ x: number; y: number; time: number }>;
  latitude: number;
  longitude: number;
  accuracyMeters: number;
  timestampIso: string;
  technicianId: string;
  signerDniOrRuc: string;
  signerFullName: string;
  signerRole: string;
}

export interface UsedSparePartDto {
  sparePartId: string;
  quantity: number;
  unitCost: number;
}

export interface CloseWorkOrderPayloadDto {
  orderId: string;
  diagnosis: string;
  workPerformed: string;
  observations?: string;
  technicalParameters: TechnicalParametersDto;
  usedSpares: UsedSparePartDto[];
  technicianWorkHours: number;
  technicianHourlyRate: number;
  signatureMetadata: DigitalSignatureMetadataDto;
}

export interface ProfitabilityMarginDto {
  contractId: string;
  contractNumber: string;
  clientBusinessName: string;
  monthlyRevenue: number;
  totalSparesCost: number;
  totalTechnicianLaborCost: number;
  netMargin: number;
  marginPercentage: number;
}

export interface CreateClientDto {
  ruc: string;
  businessName: string;
  tradeName?: string;
  phone?: string;
  email?: string;
  fiscalAddress?: string;
  primaryBranchName?: string;
  primaryBranchAddress?: string;
}

export interface CreateContractDto {
  clientId: string;
  contractNumber: string;
  startDate: string;
  endDate: string;
  monthlyRevenue: number;
  emergencyResponseHours: number;
  penaltyPerHourSoles: number;
  description?: string;
}

export interface AssignStockToTechnicianDto {
  workOrderId: string;
  technicianId: string;
  sparePartId: string;
  quantity: number;
  notes?: string;
}

