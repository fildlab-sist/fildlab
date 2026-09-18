"use strict";
/**
 * Validador de Rangos Físicos de Agua - REQ-16 (Circuit Breaker)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePhysicalParameters = validatePhysicalParameters;
function validatePhysicalParameters(params) {
    const anomalies = [];
    // 1. pH: escala estricta [0, 14]
    const currentPh = params.ph ?? params.outletPh ?? params.inletPh;
    if (params.ph != null && (params.ph < 0 || params.ph > 14)) {
        anomalies.push(`pH fuera de escala física (${params.ph}). Rango permitido: [0.0 - 14.0]`);
    }
    if (params.inletPh != null && (params.inletPh < 0 || params.inletPh > 14)) {
        anomalies.push(`pH de entrada fuera de escala (${params.inletPh}). Rango: [0.0 - 14.0]`);
    }
    if (params.outletPh != null && (params.outletPh < 0 || params.outletPh > 14)) {
        anomalies.push(`pH de salida fuera de escala (${params.outletPh}). Rango: [0.0 - 14.0]`);
    }
    // 2. Conductividad (µS/cm): [0, 5000]
    if (params.conductivityUs != null && (params.conductivityUs < 0 || params.conductivityUs > 5000)) {
        anomalies.push(`Conductividad eléctrica fuera de rango físico (${params.conductivityUs} µS/cm).`);
    }
    if (params.inletConductivityUs != null && (params.inletConductivityUs < 0 || params.inletConductivityUs > 5000)) {
        anomalies.push(`Conductividad de entrada fuera de rango (${params.inletConductivityUs} µS/cm).`);
    }
    if (params.outletConductivityUs != null && (params.outletConductivityUs < 0 || params.outletConductivityUs > 5000)) {
        anomalies.push(`Conductividad de salida fuera de rango (${params.outletConductivityUs} µS/cm).`);
    }
    // 3. Resistividad (MΩ·cm): [0, 25] (El agua teóricamente pura alcanza 18.2 MΩ·cm a 25°C)
    if (params.resistivityMohm != null && (params.resistivityMohm < 0 || params.resistivityMohm > 25)) {
        anomalies.push(`Resistividad fuera de rango (${params.resistivityMohm} MΩ·cm). Máximo teórico: 18.2 MΩ·cm.`);
    }
    // 4. Sólidos Disueltos Totales (TDS en ppm): [0, 5000]
    if (params.inletTdsPpm != null && (params.inletTdsPpm < 0 || params.inletTdsPpm > 5000)) {
        anomalies.push(`Sólidos disueltos de entrada fuera de rango (${params.inletTdsPpm} ppm).`);
    }
    if (params.postMembraneTdsPpm != null && (params.postMembraneTdsPpm < 0 || params.postMembraneTdsPpm > 3000)) {
        anomalies.push(`Sólidos disueltos post membrana anómalos (${params.postMembraneTdsPpm} ppm).`);
    }
    if (params.finalProductTdsPpm != null && (params.finalProductTdsPpm < 0 || params.finalProductTdsPpm > 3000)) {
        anomalies.push(`Sólidos disueltos de producto final anómalos (${params.finalProductTdsPpm} ppm).`);
    }
    // 5. Volumetría y Balance de Masa
    if (params.networkConsumedLiters != null && params.networkConsumedLiters < 0) {
        anomalies.push(`Los litros consumidos de la red no pueden ser negativos.`);
    }
    if (params.totalPureWaterLiters != null && params.totalPureWaterLiters < 0) {
        anomalies.push(`Los litros totales de agua pura no pueden ser negativos.`);
    }
    if (params.networkConsumedLiters != null &&
        params.totalPureWaterLiters != null &&
        params.networkConsumedLiters > 0 &&
        params.totalPureWaterLiters > params.networkConsumedLiters) {
        anomalies.push(`Inconsistencia volumétrica: el agua pura producida (${params.totalPureWaterLiters} L) no puede superar el agua consumida de la red (${params.networkConsumedLiters} L).`);
    }
    // 6. Presiones hidráulicas retrocompatibles
    if (params.inletPressurePsi != null && (params.inletPressurePsi < 0 || params.inletPressurePsi > 300)) {
        anomalies.push(`Presión de entrada fuera de rango hidráulico (${params.inletPressurePsi} PSI).`);
    }
    if (params.membranePressurePsi != null && (params.membranePressurePsi < 0 || params.membranePressurePsi > 300)) {
        anomalies.push(`Presión de membrana fuera de rango hidráulico (${params.membranePressurePsi} PSI).`);
    }
    return {
        isValid: anomalies.length === 0,
        anomalies,
    };
}
//# sourceMappingURL=physical-range.validator.js.map