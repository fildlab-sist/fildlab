import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export interface IntegrityPayload {
  orderId: string;
  orderCode: string;
  technicianId: string;
  signerDniOrRuc: string;
  latitude: number;
  longitude: number;
  timestampIso: string;
  diagnosis?: string | null;
  workPerformed?: string | null;
  signatureSnippet: string;
}

@Injectable()
export class IntegrityHashService {
  /**
   * Responsabilidad Única: Computar el hash criptográfico inmutable (SHA-256)
   * del acta de servicio técnico conforme a la Ley N° 27269.
   */
  computeHash(payload: IntegrityPayload): string {
    const serialized = JSON.stringify({
      orderId: payload.orderId,
      orderCode: payload.orderCode,
      technicianId: payload.technicianId,
      signerDniOrRuc: payload.signerDniOrRuc,
      latitude: payload.latitude,
      longitude: payload.longitude,
      timestampIso: payload.timestampIso,
      diagnosis: payload.diagnosis ?? '',
      workPerformed: payload.workPerformed ?? '',
      signatureSnippet: payload.signatureSnippet.substring(0, 100),
    });

    return crypto.createHash('sha256').update(serialized).digest('hex');
  }
}
