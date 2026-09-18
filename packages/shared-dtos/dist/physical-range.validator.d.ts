/**
 * Validador de Rangos Físicos de Agua - REQ-16 (Circuit Breaker)
 */
export interface TechnicalParametersDto {
    inletTdsPpm: number;
    postMembraneTdsPpm: number;
    finalProductTdsPpm: number;
    ph: number;
    conductivityUs: number;
    resistivityMohm: number;
    networkConsumedLiters: number;
    totalPureWaterLiters: number;
    inletPh?: number | null;
    outletPh?: number | null;
    inletConductivityUs?: number | null;
    outletConductivityUs?: number | null;
    outletTdsPpm?: number | null;
    inletPressurePsi?: number | null;
    membranePressurePsi?: number | null;
    recoveryRatePercentage?: number | null;
}
export interface PhysicalRangeValidationResult {
    isValid: boolean;
    anomalies: string[];
}
export declare function validatePhysicalParameters(params: Partial<TechnicalParametersDto>): PhysicalRangeValidationResult;
//# sourceMappingURL=physical-range.validator.d.ts.map