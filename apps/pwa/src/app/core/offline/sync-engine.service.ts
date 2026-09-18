import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { FildlabDexieDb, SyncQueueItem } from './dexie-db.service.js';
import { environment } from '../../../environments/environment.js';

export interface SyncResult {
  totalProcessed: number;
  syncedSuccess: number;
  failedCount: number;
  timestamp: string;
}

@Injectable({
  providedIn: 'root',
})
export class SyncEngineService {
  isSyncing = signal<boolean>(false);
  lastSyncResult = signal<SyncResult | null>(null);
  pendingCount = signal<number>(0);

  constructor(
    private readonly dexieDb: FildlabDexieDb,
    private readonly http: HttpClient,
  ) {
    this.initNetworkListener();
    this.refreshPendingCount();
  }

  private initNetworkListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.processPendingSyncQueue();
      });
    }
  }

  async refreshPendingCount(): Promise<number> {
    try {
      const items = await this.dexieDb.getPendingSyncItems();
      this.pendingCount.set(items.length);
      return items.length;
    } catch {
      this.pendingCount.set(0);
      return 0;
    }
  }

  /**
   * REQ-06 y REQ-08: Sincronización automática e idempotente de órdenes cerradas
   * al detectar red, pasando repuestos a "Comprometido/En Tránsito" e inmutabilizando localmente.
   */
  async processPendingSyncQueue(): Promise<SyncResult> {
    if (this.isSyncing() || (typeof navigator !== 'undefined' && !navigator.onLine)) {
      return { totalProcessed: 0, syncedSuccess: 0, failedCount: 0, timestamp: new Date().toISOString() };
    }

    this.isSyncing.set(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      const pendingItems: SyncQueueItem[] = await this.dexieDb.getPendingSyncItems();

      for (const item of pendingItems) {
        try {
          // Despacho hacia el endpoint seguro de cierre legal (Ley N° 27269)
          await firstValueFrom(
            this.http.post(`${environment.apiUrl}/work-orders/close-and-lock`, item.payload),
          );

          // Confirmación de éxito: remover de la cola y bloquear localmente en IndexedDB
          if (item.id != null) {
            await this.dexieDb.markAsSuccessfullySynced(item.id, item.orderId);
            successCount++;
          }
        } catch (error) {
          failedCount++;
          // Se mantiene en la cola de IndexedDB para el próximo ciclo (resiliencia ante cold starts)
          console.warn(`[SyncEngine] Reintento programado para orden ${item.orderId}:`, error);
        }
      }

      const result: SyncResult = {
        totalProcessed: pendingItems.length,
        syncedSuccess: successCount,
        failedCount,
        timestamp: new Date().toISOString(),
      };

      this.lastSyncResult.set(result);
      await this.refreshPendingCount();
      return result;
    } finally {
      this.isSyncing.set(false);
    }
  }
}
