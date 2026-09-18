"use strict";
/**
 * Fildlab Perú S.A.C. - Enums del Dominio (SI_FILDLAB-2026)
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.MlAuditErrorType = exports.SpareMovementType = exports.WorkOrderSpareStatus = exports.OrderStatus = exports.ServiceType = exports.EquipmentStatus = exports.EquipmentType = exports.ContractStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["GERENCIA"] = "GERENCIA";
    UserRole["TECNICO"] = "TECNICO";
})(UserRole || (exports.UserRole = UserRole = {}));
var ContractStatus;
(function (ContractStatus) {
    ContractStatus["ACTIVO"] = "ACTIVO";
    ContractStatus["SUSPENDIDO"] = "SUSPENDIDO";
    ContractStatus["VENCIDO"] = "VENCIDO";
    ContractStatus["ANULADO"] = "ANULADO";
})(ContractStatus || (exports.ContractStatus = ContractStatus = {}));
var EquipmentType;
(function (EquipmentType) {
    EquipmentType["OSMOSIS_INVERSA"] = "OSMOSIS_INVERSA";
    EquipmentType["ABLANDADOR"] = "ABLANDADOR";
    EquipmentType["FILTRO_MULTIMEDIA"] = "FILTRO_MULTIMEDIA";
    EquipmentType["DESIONIZADOR"] = "DESIONIZADOR";
    EquipmentType["SISTEMA_UV"] = "SISTEMA_UV";
})(EquipmentType || (exports.EquipmentType = EquipmentType = {}));
var EquipmentStatus;
(function (EquipmentStatus) {
    EquipmentStatus["OPERATIVO"] = "OPERATIVO";
    EquipmentStatus["MANTENIMIENTO_REQUERIDO"] = "MANTENIMIENTO_REQUERIDO";
    EquipmentStatus["CRITICO"] = "CRITICO";
    EquipmentStatus["FUERA_DE_SERVICIO"] = "FUERA_DE_SERVICIO";
})(EquipmentStatus || (exports.EquipmentStatus = EquipmentStatus = {}));
var ServiceType;
(function (ServiceType) {
    ServiceType["PREVENTIVO"] = "PREVENTIVO";
    ServiceType["CORRECTIVO"] = "CORRECTIVO";
    ServiceType["EMERGENCIA"] = "EMERGENCIA";
    ServiceType["INSTALACION"] = "INSTALACION";
})(ServiceType || (exports.ServiceType = ServiceType = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDIENTE"] = "PENDIENTE";
    OrderStatus["EN_PROCESO"] = "EN_PROCESO";
    OrderStatus["CERRADA_CAMPO"] = "CERRADA_CAMPO";
    OrderStatus["SINCRONIZADA"] = "SINCRONIZADA";
    OrderStatus["LIQUIDADA_APROBADA"] = "LIQUIDADA_APROBADA";
    OrderStatus["ANULADA"] = "ANULADA";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var WorkOrderSpareStatus;
(function (WorkOrderSpareStatus) {
    WorkOrderSpareStatus["UTILIZADO_CAMPO"] = "UTILIZADO_CAMPO";
    WorkOrderSpareStatus["COMPROMETIDO_EN_TRANSITO"] = "COMPROMETIDO_EN_TRANSITO";
    WorkOrderSpareStatus["LIQUIDADO_DESCONTADO"] = "LIQUIDADO_DESCONTADO"; // Fase 3: Aprobado por Gerencia
})(WorkOrderSpareStatus || (exports.WorkOrderSpareStatus = WorkOrderSpareStatus = {}));
var SpareMovementType;
(function (SpareMovementType) {
    SpareMovementType["ENTRADA_CENTRAL"] = "ENTRADA_CENTRAL";
    SpareMovementType["ASIGNACION_A_TECNICO"] = "ASIGNACION_A_TECNICO";
    SpareMovementType["DEVOLUCION_A_CENTRAL"] = "DEVOLUCION_A_CENTRAL";
    SpareMovementType["CONSUMO_EN_ORDEN"] = "CONSUMO_EN_ORDEN";
    SpareMovementType["AJUSTE_INVENTARIO"] = "AJUSTE_INVENTARIO";
})(SpareMovementType || (exports.SpareMovementType = SpareMovementType = {}));
var MlAuditErrorType;
(function (MlAuditErrorType) {
    MlAuditErrorType["OUT_OF_PHYSICAL_RANGE"] = "OUT_OF_PHYSICAL_RANGE";
    MlAuditErrorType["INCOMPLETE_FEATURES"] = "INCOMPLETE_FEATURES";
    MlAuditErrorType["MODEL_INFERENCE_EXCEPTION"] = "MODEL_INFERENCE_EXCEPTION";
})(MlAuditErrorType || (exports.MlAuditErrorType = MlAuditErrorType = {}));
//# sourceMappingURL=enums.js.map