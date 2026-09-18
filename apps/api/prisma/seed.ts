import { PrismaClient, ContractStatus, EquipmentType, EquipmentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { SEED_USERS, SEED_CLIENTS, SEED_SPARES } from './seed-data.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando siembra de datos para Fildlab Perú S.A.C. (SI_FILDLAB-2026)...');

  const defaultPasswordHash = await bcrypt.hash('Fildlab2026!', 10);

  // 1. Usuarios con Roles RBAC (RN-01)
  const createdUsers: Record<string, any> = {};
  for (const user of SEED_USERS) {
    const record = await prisma.user.upsert({
      where: { email: user.email },
      update: { role: user.role, fullName: user.fullName },
      create: {
        email: user.email,
        passwordHash: defaultPasswordHash,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
      },
    });
    createdUsers[user.email] = record;
    console.log(`✓ Usuario: ${record.fullName} [${record.role}]`);
  }

  // 2. Clientes Corporativos, Sedes y Contratos (REQ-01, REQ-02, REQ-03)
  const gerenciaUser = createdUsers['elva.acevedo@fildlab.pe'];

  for (let i = 0; i < SEED_CLIENTS.length; i++) {
    const c = SEED_CLIENTS[i];
    const client = await prisma.client.upsert({
      where: { ruc: c.ruc },
      update: { businessName: c.businessName },
      create: {
        ruc: c.ruc,
        businessName: c.businessName,
        commercialName: c.commercialName,
        legalRepresentative: c.legalRepresentative,
        contactEmail: c.contactEmail,
        contactPhone: c.contactPhone,
        fiscalAddress: c.fiscalAddress,
      },
    });

    const branch = await prisma.branch.create({
      data: {
        clientId: client.id,
        name: c.branchName,
        address: c.branchAddress,
        latitude: c.latitude,
        longitude: c.longitude,
      },
    });

    // Contrato con SLA estricto para clínicas
    const contractNumber = `CTR-2026-${(i + 1).toString().padStart(3, '0')}`;
    const monthlyFee = i === 0 ? 3800.00 : 2400.00;

    const contract = await prisma.contract.upsert({
      where: { contractNumber },
      update: { monthlyFee },
      create: {
        contractNumber,
        clientId: client.id,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        monthlyFee,
        status: ContractStatus.ACTIVO,
        createdById: gerenciaUser.id,
      },
    });

    await prisma.slaPolicy.upsert({
      where: { contractId: contract.id },
      update: {},
      create: {
        contractId: contract.id,
        emergencyMaxHours: 4, // 4 horas para clínicas críticas
        correctiveMaxHours: 24,
        preventiveMaxDays: 30,
        penaltyPerHourDelay: 50.00,
      },
    });

    // Equipo de Purificación de Agua
    await prisma.equipment.upsert({
      where: { serialNumber: `EQUIP-2026-00${i + 1}` },
      update: {},
      create: {
        serialNumber: `EQUIP-2026-00${i + 1}`,
        branchId: branch.id,
        contractId: contract.id,
        equipmentType: i === 0 ? EquipmentType.OSMOSIS_INVERSA : EquipmentType.ABLANDADOR,
        brand: 'Fildlab Aquapure Tech',
        model: i === 0 ? 'RO-4040-TWIN' : 'SOFT-C100-PRO',
        membraneType: i === 0 ? 'DOW Filmtec BW30-4040' : undefined,
        resinLiters: i === 1 ? 100.00 : undefined,
        installationDate: new Date('2025-06-15'),
        status: EquipmentStatus.OPERATIVO,
      },
    });

    console.log(`✓ Cliente: ${client.businessName} (RUC: ${client.ruc}) con Contrato ${contractNumber}`);
  }

  // 3. Catálogo de Repuestos y Stock de Almacén (REQ-04)
  const tecnicoUser = createdUsers['mauro.gutierrez@fildlab.pe'];

  for (const sp of SEED_SPARES) {
    const spare = await prisma.sparePart.upsert({
      where: { sku: sp.sku },
      update: { centralStock: sp.centralStock, unitCost: sp.unitCost },
      create: sp,
    });

    // Asignación inicial de stock móvil al técnico líder (REQ-05 / RN-03)
    await prisma.technicianStock.upsert({
      where: {
        technicianId_sparePartId: {
          technicianId: tecnicoUser.id,
          sparePartId: spare.id,
        },
      },
      update: {},
      create: {
        technicianId: tecnicoUser.id,
        sparePartId: spare.id,
        localQuantity: 3, // 3 unidades en el almacén móvil del técnico
      },
    });
  }

  console.log('✓ Catálogo de repuestos y stock móvil del técnico inicializados.');
  console.log('✨ Siembra de datos completada exitosamente.');
}

main()
  .catch((e) => {
    console.error('Error durante la siembra de datos:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
