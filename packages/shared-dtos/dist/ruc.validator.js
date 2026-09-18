"use strict";
/**
 * Validador Oficial SUNAT Módulo 11 (REQ-01)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRucSUNAT = validateRucSUNAT;
function validateRucSUNAT(ruc) {
    if (!ruc) {
        return { isValid: false, message: 'El RUC es un campo obligatorio' };
    }
    const cleanRuc = ruc.trim();
    if (!/^\d{11}$/.test(cleanRuc)) {
        return { isValid: false, message: 'El RUC debe contener exactamente 11 dígitos numéricos' };
    }
    // Prefijos válidos en SUNAT: 10, 15, 16, 17, 20
    const prefix = cleanRuc.substring(0, 2);
    const validPrefixes = ['10', '15', '16', '17', '20'];
    if (!validPrefixes.includes(prefix)) {
        return { isValid: false, message: `Prefijo de RUC '${prefix}' inválido para personas naturales o jurídicas en SUNAT` };
    }
    const factors = [5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < 10; i++) {
        sum += parseInt(cleanRuc.charAt(i), 10) * factors[i];
    }
    const remainder = sum % 11;
    let checkDigit = 11 - remainder;
    if (checkDigit === 10)
        checkDigit = 0;
    else if (checkDigit === 11)
        checkDigit = 1;
    const actualCheckDigit = parseInt(cleanRuc.charAt(10), 10);
    if (checkDigit !== actualCheckDigit) {
        return { isValid: false, message: 'Dígito verificador de RUC no coincide con el cálculo del Módulo 11 de SUNAT' };
    }
    return { isValid: true };
}
//# sourceMappingURL=ruc.validator.js.map