import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { CloseWorkOrderPayloadDto, OrderStatus } from '@fildlab/shared-dtos';

export interface LocalTechnicianStock {
  id: string; // sparePartId
  sku: string;
  name: string;
  unitMeasure: string;
  localQuantity: number;
  unitCost: number;
}

export interface LocalWorkOrder {
  id: string; // UUID de la orden
  orderCode: string;
  clientName: string;
  branchName: string;
  equipmentSerial: string;
  equipmentType: string;
  status: OrderStatus;
  scheduledDate: string;
  isClosedLocally: boolean;
  isSynced: boolean;
  closurePayload?: CloseWorkOrderPayloadDto;
  updatedAt: string;
}

export interface SyncQueueItem {
  id?: number;
  orderId: string;
  payload: CloseWorkOrderPayloadDto;
  attempts: number;
  lastAttemptAt?: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root',
})
export class FildlabDexieDb extends Dexie {
  technicianStock!: Table<LocalTechnicianStock, string>;
  offlineOrders!: Table<LocalWorkOrder, string>;
  syncQueue!: Table<SyncQueueItem, number>;

  constructor() {
    super('FildlabOfflineDB_v1');

    this.version(1).stores({
      technicianStock: 'id, sku, name',
      offlineOrders: 'id, orderCode, status, isClosedLocally, isSynced',
      syncQueue: '++id, orderId, createdAt',
    });
  }

  /**
   * REQ-05 / RN-03 Fase 1: Descuento inmediato de repuestos en el almacenamiento local
   * del técnico en el dispositivo (IndexedDB), sin requerir internet.
   */
  async recordFieldInterventionLocally(orderId: string, closurePayload: CloseWorkOrderPayloadDto): Promise<void> {
    await this.transaction('rw', this.technicianStock, this.offlineOrders, this.syncQueue, async () => {
      // 1. Descontar cada repuesto utilizado del stock móvil local
      for (const item of closurePayload.usedSpares) {
        const localStock = await this.technicianStock.get(item.sparePartId);
        if (localStock) {
          const updatedQty = Math.max(0, localStock.localQuantity - item.quantity);
          await this.technicianStock.update(item.sparePartId, { localQuantity: updatedQty });
        }
      }

      // 2. Actualizar el estado de la orden a CERRADA_CAMPO en IndexedDB
      const order = await this.offlineOrders.get(orderId);
      if (order) {
        await this.offlineOrders.update(orderId, {
          status: OrderStatus.CERRADA_CAMPO,
          isClosedLocally: true,
          isSynced: false,
          closurePayload,
          updatedAt: new Date().toISOString(),
        });
      }

      // 3. Agregar a la cola de sincronización para despacho cuando se recupere red (REQ-06 / REQ-08)
      await this.syncQueue.add({
        orderId,
        payload: closurePayload,
        attempts: 0,
        createdAt: new Date().toISOString(),
      });
    });
  }

  /**
   * Obtiene las órdenes pendientes de sincronización
   */
  async getPendingSyncItems(): Promise<SyncQueueItem[]> {
    return this.syncQueue.toArray();
  }

  /**
   * Elimina un ítem de la cola tras una sincronización exitosa confirmada por el Backend
   */
  async markAsSuccessfullySynced(queueId: number, orderId: string): Promise<void> {
    await this.transaction('rw', this.offlineOrders, this.syncQueue, async () => {
      await this.syncQueue.delete(queueId);
      await this.offlineOrders.update(orderId, {
        isSynced: true,
        status: OrderStatus.SINCRONIZADA,
      });
    });
  }
}
