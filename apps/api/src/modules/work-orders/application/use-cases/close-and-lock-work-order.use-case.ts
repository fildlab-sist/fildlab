import { Injectable, BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { IntegrityHashService } from '../../../../core/crypto/integrity-hash.service.js';
import { CloseWorkOrderPayloadDto, OrderStatus, WorkOrderSpareStatus } from '@fildlab/shared-dtos';

@Injectable()
export class CloseAndLockWorkOrderUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly hashService: IntegrityHashService,
  ) {}

  async execute(payload: CloseWorkOrderPayloadDto) {
    const {
      orderId,
      diagnosis,
      workPerformed,
      observations,
      technicalParameters,
      usedSpares,
      technicianWorkHours,
      technicianHourlyRate,
      signatureMetadata,
    } = payload;

    // 1. Verificación de existencia y estado de inmutabilidad (RN-04)
    const existingOrder = await this.prisma.workOrder.findUnique({
      where: { id: orderId },
      include: { sparesUsed: true },
    });

    if (!existingOrder) {
      throw new NotFoundException(`La orden de trabajo ${orderId} no existe en el sistema`);
    }

    if (existingOrder.isLocked) {
      throw new ConflictException(
        `Inmutabilidad Legal (RN-04): La orden ${existingOrder.orderCode} ya se encuentra cerrada y bloqueada. No se permiten modificaciones directas. Debe registrarse una Adenda de Corrección.`,
      );
    }

    // 2. Validación obligatoria de Firma Digital (Ley N° 27269 / RN-02 / REQ-09 / REQ-10)
    if (!signatureMetadata) {
      throw new BadRequestException('RN-02: Se requiere la captura de firma digital manuscrita para cerrar la orden');
    }

    const {
      signatureImage,
      latitude,
      longitude,
      accuracyMeters,
      timestampIso,
      technicianId,
      signerDniOrRuc,
      signerFullName,
      signerRole,
      vectorStrokes,
    } = signatureMetadata;

    if (!signatureImage || signatureImage.trim().length === 0) {
      throw new BadRequestException('REQ-10: El trazo de la firma digital en el canvas no puede estar vacío');
    }

    if (latitude == null || longitude == null) {
      throw new BadRequestException('REQ-09: Se requiere captura obligatoria de coordenadas GPS (Ley N° 27269)');
    }

    if (!signerFullName || !signerDniOrRuc) {
      throw new BadRequestException('REQ-10: Nombre completo y DNI/RUC del firmante son campos obligatorios');
    }

    // 3. Delegación del cálculo de integridad criptográfica (SRP)
    const integrityHash = this.hashService.computeHash({
      orderId,
      orderCode: existingOrder.orderCode,
      technicianId,
      signerDniOrRuc,
      latitude,
      longitude,
      timestampIso,
      diagnosis,
      workPerformed,
      signatureSnippet: signatureImage,
    });

    // 4. Transacción ACID: Cierre atómico con pase de repuestos a "COMPROMETIDO_EN_TRANSITO" (RN-03 Fase 2)
    return this.prisma.$transaction(async (tx) => {
      if (usedSpares && usedSpares.length > 0) {
        for (const spare of usedSpares) {
          await tx.workOrderSpare.create({
            data: {
              workOrderId: orderId,
              sparePartId: spare.sparePartId,
              quantity: spare.quantity,
              unitCost: spare.unitCost,
              status: WorkOrderSpareStatus.COMPROMETIDO_EN_TRANSITO,
            },
          });
        }
      }

      const updatedOrder = await tx.workOrder.update({
        where: { id: orderId },
        data: {
          status: OrderStatus.SINCRONIZADA,
          diagnosis,
          workPerformed,
          observations,
          inletTdsPpm: technicalParameters.inletTdsPpm,
          postMembraneTdsPpm: technicalParameters.postMembraneTdsPpm,
          finalProductTdsPpm: technicalParameters.finalProductTdsPpm,
          ph: technicalParameters.ph ?? technicalParameters.outletPh ?? technicalParameters.inletPh,
          conductivityUs: technicalParameters.conductivityUs ?? technicalParameters.outletConductivityUs,
          resistivityMohm: technicalParameters.resistivityMohm,
          networkConsumedLiters: technicalParameters.networkConsumedLiters,
          totalPureWaterLiters: technicalParameters.totalPureWaterLiters,
          recoveryRatePercentage:
            technicalParameters.recoveryRatePercentage ??
            (technicalParameters.networkConsumedLiters && technicalParameters.networkConsumedLiters > 0
              ? (technicalParameters.totalPureWaterLiters / technicalParameters.networkConsumedLiters) * 100
              : null),
          outletTdsPpm: technicalParameters.finalProductTdsPpm ?? technicalParameters.outletTdsPpm,
          inletConductivityUs: technicalParameters.conductivityUs ?? technicalParameters.inletConductivityUs,
          outletConductivityUs: technicalParameters.conductivityUs ?? technicalParameters.outletConductivityUs,
          inletPh: technicalParameters.ph ?? technicalParameters.inletPh,
          outletPh: technicalParameters.ph ?? technicalParameters.outletPh,
          inletPressurePsi: technicalParameters.inletPressurePsi,
          membranePressurePsi: technicalParameters.membranePressurePsi,
          technicianWorkHours,
          technicianHourlyRate,
          signatureImageUrl: signatureImage,
          signatureVectorJson: vectorStrokes ? JSON.stringify(vectorStrokes) : undefined,
          signerFullName,
          signerDniOrRuc,
          signerRole,
          gpsLatitude: latitude,
          gpsLongitude: longitude,
          gpsAccuracyMeters: accuracyMeters,
          signatureTimestamp: new Date(timestampIso),
          integrityHash,
          isLocked: true,
          completedAt: new Date(timestampIso),
        },
        include: { sparesUsed: true },
      });

      return {
        message: 'Orden cerrada y sincronizada exitosamente con firma digital válida (Ley N° 27269)',
        orderCode: updatedOrder.orderCode,
        integrityHash: updatedOrder.integrityHash,
        status: updatedOrder.status,
        isLocked: updatedOrder.isLocked,
      };
    });
  }
}
