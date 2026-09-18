import { TechnicalParametersDto } from '@fildlab/shared-dtos';

export interface AssignedOrder {
  id: string;
  orderCode: string;
  clientName: string;
  clientRuc: string;
  branchName: string;
  branchAddress: string;
  equipmentType: string;
  equipmentSerial: string;
  serviceType: string;
  diagnosis: string;
  workPerformed: string;
  params: TechnicalParametersDto;
  spares: Array<{ sparePartId: string; name: string; quantity: number; unitCost: number }>;
}

export const ASSIGNED_ORDERS_MOCK: AssignedOrder[] = [
  {
    id: 'ord-trujillo-001',
    orderCode: 'OT-2026-0042',
    clientName: 'Clínica Sánchez Ferrer',
    clientRuc: '20123456786',
    branchName: 'Sede Central - Unidad de Hemodiálisis',
    branchAddress: 'Av. América Oeste 450, Trujillo',
    equipmentType: 'Ósmosis Inversa Doble Paso (BW30-4040)',
    equipmentSerial: 'EQUIP-2026-001',
    serviceType: 'Mantenimiento Preventivo',
    diagnosis: 'Membrana de ósmosis saturada con incrustación salina. Reemplazo preventivo ejecutado.',
    workPerformed: 'Desmontaje de portamembrana, sanitización con ácido peracético y recambio de prefiltros.',
    params: {
      inletTdsPpm: 580,
      postMembraneTdsPpm: 18,
      finalProductTdsPpm: 3.5,
      ph: 6.85,
      conductivityUs: 7.2,
      resistivityMohm: 13.8,
      networkConsumedLiters: 4500,
      totalPureWaterLiters: 3375,
    },
    spares: [],
  },
  {
    id: 'ord-trujillo-002',
    orderCode: 'OT-2026-0043',
    clientName: 'Hospital Belén de Trujillo',
    clientRuc: '20131370211',
    branchName: 'Pabellón Quirúrgico - Central Esterilización',
    branchAddress: 'Jr. Bolívar 350, Centro Histórico, Trujillo',
    equipmentType: 'Ablandador Industrial Dúplex (Clack WS1)',
    equipmentSerial: 'EQUIP-2026-015',
    serviceType: 'Inspección de Calidad',
    diagnosis: 'Válvula de salmuera descalibrada y resina con pérdida de intercambio.',
    workPerformed: 'Regeneración forzada de resina catiónica, limpieza Clack y prueba de dureza.',
    params: {
      inletTdsPpm: 490,
      postMembraneTdsPpm: 22,
      finalProductTdsPpm: 4.8,
      ph: 7.10,
      conductivityUs: 9.8,
      resistivityMohm: 10.2,
      networkConsumedLiters: 6200,
      totalPureWaterLiters: 4650,
    },
    spares: [],
  },
  {
    id: 'ord-trujillo-003',
    orderCode: 'OT-2026-0044',
    clientName: 'Laboratorios del Norte S.A.C.',
    clientRuc: '20548912301',
    branchName: 'Planta de Inyectables - Sala Limpia',
    branchAddress: 'Panamericana Norte Km 558, Moche',
    equipmentType: 'Purificación Ultrafiltración + EDI',
    equipmentSerial: 'EQUIP-2026-029',
    serviceType: 'Mantenimiento Correctivo',
    diagnosis: 'Módulo EDI con resistencia elevada por conductividad de entrada.',
    workPerformed: 'Ajuste de corriente DC en rectificador EDI y sanitización térmica.',
    params: {
      inletTdsPpm: 320,
      postMembraneTdsPpm: 8,
      finalProductTdsPpm: 0.8,
      ph: 7.02,
      conductivityUs: 1.6,
      resistivityMohm: 18.2,
      networkConsumedLiters: 2800,
      totalPureWaterLiters: 2380,
    },
    spares: [],
  },
];
