import { describe, it, expect } from 'vitest';
import { validateRucSUNAT, validatePhysicalParameters } from '@fildlab/shared-dtos';

describe('SI_FILDLAB-2026: Verificación de Reglas de Negocio del Dominio', () => {
  describe('REQ-01: Validación de RUC 11 dígitos (Módulo 11 SUNAT)', () => {
    it('debe validar exitosamente el RUC oficial de Fildlab Perú S.A.C. (20612493821)', () => {
      const result = validateRucSUNAT('20612493821');
      expect(result.isValid).toBe(true);
      expect(result.message).toBeUndefined();
    });

    it('debe rechazar un RUC con longitud diferente a 11 dígitos', () => {
      const result = validateRucSUNAT('2061249382');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('11 dígitos');
    });

    it('debe rechazar un RUC con prefijo no reconocido por SUNAT', () => {
      const result = validateRucSUNAT('30612493821');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Prefijo de RUC');
    });

    it('debe rechazar un RUC con dígito verificador adulterado', () => {
      // 20612493821 es válido, 20612493829 tiene dígito incorrecto
      const result = validateRucSUNAT('20612493829');
      expect(result.isValid).toBe(false);
      expect(result.message).toContain('Dígito verificador');
    });
  });

  describe('REQ-16: Circuit Breaker de Parámetros Físico-Químicos', () => {
    it('debe aceptar parámetros técnicos dentro de rangos físicos reales', () => {
      const result = validatePhysicalParameters({
        inletPh: 7.2,
        outletPh: 6.8,
        inletConductivityUs: 650,
        outletConductivityUs: 15,
        inletTdsPpm: 320,
        outletTdsPpm: 8,
        inletPressurePsi: 45,
        membranePressurePsi: 65,
        recoveryRatePercentage: 75,
      });

      expect(result.isValid).toBe(true);
      expect(result.anomalies.length).toBe(0);
    });

    it('debe detectar anomalías si el pH es negativo o superior a 14', () => {
      const result = validatePhysicalParameters({
        inletPh: -1.5,
        outletPh: 15.2,
      });

      expect(result.isValid).toBe(false);
      expect(result.anomalies.some((a) => a.includes('pH de entrada'))).toBe(true);
      expect(result.anomalies.some((a) => a.includes('pH de salida'))).toBe(true);
    });

    it('debe detectar presiones o conductividades imposibles sin arrojar excepciones fatales', () => {
      const result = validatePhysicalParameters({
        membranePressurePsi: 450, // Límite físico 300 PSI
        inletConductivityUs: 9999, // Límite físico 5000 µS/cm
      });

      expect(result.isValid).toBe(false);
      expect(result.anomalies.length).toBe(2);
    });
  });

  describe('REQ-02 y REQ-03: Validación de Contratos SLA y Mensajes Descriptivos', () => {
    // Mock ligero de PrismaService para aislamiento unitario
    const mockPrisma: any = {
      client: { findUnique: () => Promise.resolve({ id: 'cli-01', businessName: 'Clínica Test' }) },
      contract: { findUnique: () => Promise.resolve(null), create: (args: any) => Promise.resolve({ id: 'c-1', ...args.data }) },
    };

    it('REQ-03: debe rechazar con mensaje descriptivo si la fecha de término es anterior o igual a la de inicio', async () => {
      const { CreateContractUseCase } = await import('../src/modules/clients/application/use-cases/create-contract.use-case.js');
      const useCase = new CreateContractUseCase(mockPrisma);

      await expect(
        useCase.execute(
          {
            clientId: 'cli-01',
            contractNumber: 'CTR-2026-TEST',
            startDate: '2026-12-31',
            endDate: '2026-01-01', // Fecha inválida (término < inicio)
            monthlyRevenue: 2500,
            emergencyResponseHours: 4,
            penaltyPerHourSoles: 50,
          },
          'user-gerencia',
        ),
      ).rejects.toThrowError(/REQ-03: La fecha de término.*no puede ser anterior o igual/);
    });

    it('REQ-03: debe rechazar con mensaje descriptivo si faltan campos obligatorios', async () => {
      const { CreateContractUseCase } = await import('../src/modules/clients/application/use-cases/create-contract.use-case.js');
      const useCase = new CreateContractUseCase(mockPrisma);

      await expect(
        useCase.execute(
          {
            clientId: '',
            contractNumber: 'CTR-2026-TEST',
            startDate: '2026-01-01',
            endDate: '2026-12-31',
            monthlyRevenue: 0, // Cuota inválida
            emergencyResponseHours: 4,
            penaltyPerHourSoles: 50,
          },
          'user-gerencia',
        ),
      ).rejects.toThrowError(/REQ-03: Debe seleccionar obligatoriamente un cliente corporativo/);
    });
  });

  describe('REQ-04: Asignación de Stock vinculada a Orden de Trabajo Válida', () => {
    it('REQ-04: debe rechazar el despacho si la orden de trabajo no existe', async () => {
      const mockPrismaNoOrder: any = {
        workOrder: { findUnique: () => Promise.resolve(null) }, // Orden no encontrada
      };
      const { AssignStockToTechnicianUseCase } = await import(
        '../src/modules/inventory/application/use-cases/assign-stock-to-technician.use-case.js'
      );
      const useCase = new AssignStockToTechnicianUseCase(mockPrismaNoOrder);

      await expect(
        useCase.execute(
          {
            workOrderId: 'orden-inexistente-999',
            technicianId: 'tech-01',
            sparePartId: 'sp-01',
            quantity: 2,
          },
          'user-gerencia',
        ),
      ).rejects.toThrowError(/REQ-04: No se encontró una orden de trabajo válida/);
    });

    it('REQ-04: debe rechazar cantidades menores o iguales a cero', async () => {
      const mockPrisma: any = {};
      const { AssignStockToTechnicianUseCase } = await import(
        '../src/modules/inventory/application/use-cases/assign-stock-to-technician.use-case.js'
      );
      const useCase = new AssignStockToTechnicianUseCase(mockPrisma);

      await expect(
        useCase.execute(
          {
            workOrderId: 'ot-001',
            technicianId: 'tech-01',
            sparePartId: 'sp-01',
            quantity: 0,
          },
          'user-gerencia',
        ),
      ).rejects.toThrowError(/REQ-04: La cantidad de repuestos a trasladar debe ser mayor a 0/);
    });
  });
});
