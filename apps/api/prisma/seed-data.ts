import { UserRole, ContractStatus, EquipmentType, EquipmentStatus } from '@prisma/client';

export const SEED_USERS = [
  {
    email: 'elva.acevedo@fildlab.pe',
    fullName: 'Elva Acevedo Vargas',
    phone: '+51 944 123 456',
    role: UserRole.GERENCIA,
  },
  {
    email: 'mauro.gutierrez@fildlab.pe',
    fullName: 'Mauro Gutierrez',
    phone: '+51 948 654 321',
    role: UserRole.TECNICO,
  },
  {
    email: 'jorge.espejo@fildlab.pe',
    fullName: 'Jorge Espejo',
    phone: '+51 949 789 123',
    role: UserRole.TECNICO,
  },
];

export const SEED_CLIENTS = [
  {
    ruc: '20123456786', // Validado Módulo 11 SUNAT
    businessName: 'Clínica Sánchez Ferrer S.A.C.',
    commercialName: 'Clínica Sánchez Ferrer',
    legalRepresentative: 'Dr. Roberto Sánchez Ferrer',
    contactEmail: 'administracion@clinicasanchezferrer.pe',
    contactPhone: '+51 44 285555',
    fiscalAddress: 'Av. América Oeste 450, Urb. El Golf, Trujillo, Perú',
    branchName: 'Sede Principal - Unidad de Hemodiálisis y UCI',
    branchAddress: 'Av. América Oeste 450, Trujillo',
    latitude: -8.125642,
    longitude: -79.034512,
  },
  {
    ruc: '20538219453', // Validado Módulo 11 SUNAT
    businessName: 'Hospital Belén de Trujillo',
    commercialName: 'Hospital Belén',
    legalRepresentative: 'Dra. Carmen Morales Cruz',
    contactEmail: 'biomedica@hospitalbelen.gob.pe',
    contactPhone: '+51 44 245281',
    fiscalAddress: 'Calle Bolívar 350, Centro Histórico, Trujillo, Perú',
    branchName: 'Pabellón de Nefrología y Laboratorio Central',
    branchAddress: 'Calle Bolívar 350, Trujillo',
    latitude: -8.113210,
    longitude: -79.028450,
  },
];

export const SEED_SPARES = [
  {
    sku: 'MEM-BW30-4040',
    name: 'Membrana de Ósmosis Inversa Filmtec 4040',
    description: 'Membrana poliamida para agua salobre con rechazo nominal del 99.5%',
    unitMeasure: 'UND',
    unitCost: 850.00,
    salePrice: 1200.00,
    centralStock: 18,
    minimumStock: 4,
  },
  {
    sku: 'RES-C100E',
    name: 'Resina Catiónica Purolite C100E (Saco 25L)',
    description: 'Resina de intercambio iónico grado alimentario para ablandamiento de agua',
    unitMeasure: 'SACO',
    unitCost: 280.00,
    salePrice: 380.00,
    centralStock: 25,
    minimumStock: 5,
  },
  {
    sku: 'FILT-SPUN-5M',
    name: 'Filtro Polipropileno Spun 5 Micras 10"',
    description: 'Cartucho de sedimentos para pre-tratamiento en ósmosis',
    unitMeasure: 'UND',
    unitCost: 35.00,
    salePrice: 65.00,
    centralStock: 60,
    minimumStock: 12,
  },
  {
    sku: 'FILT-CARB-CTO',
    name: 'Filtro Carbón Activado Block CTO 10"',
    description: 'Cartucho de decloración para protección de membranas osmóticas',
    unitMeasure: 'UND',
    unitCost: 45.00,
    salePrice: 85.00,
    centralStock: 40,
    minimumStock: 10,
  },
];
