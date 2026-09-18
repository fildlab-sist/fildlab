/**
 * Validador Oficial SUNAT Módulo 11 (REQ-01)
 */
export interface RucValidationResult {
    isValid: boolean;
    message?: string;
}
export declare function validateRucSUNAT(ruc: string | null | undefined): RucValidationResult;
//# sourceMappingURL=ruc.validator.d.ts.map