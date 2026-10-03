import { offlineQueue } from './offlineQueue';
import { saleApi } from '../api/saleApi';
import { useAuthStore } from '../store/authStore';

export class SyncManager {
  private static isSyncing = false;
  private static listeners: Array<(status: { isSyncing: boolean; pendingCount: number }) => void> = [];

  static subscribe(listener: (status: { isSyncing: boolean; pendingCount: number }) => void) {
    this.listeners.push(listener);
    this.notify();
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private static async notify() {
    const pendingCount = await offlineQueue.getPendingCount();
    for (const listener of this.listeners) {
      listener({ isSyncing: this.isSyncing, pendingCount });
    }
  }

  /**
   * Push all pending offline sales to backend
   */
  static async syncPendingSales(): Promise<{ success: boolean; syncedCount: number; message: string }> {
    if (this.isSyncing) {
      return { success: false, syncedCount: 0, message: 'Sync already in progress' };
    }

    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated || !navigator.onLine) {
      return { success: false, syncedCount: 0, message: 'Offline or unauthenticated' };
    }

    try {
      this.isSyncing = true;
      this.notify();

      const pending = await offlineQueue.getPendingSales();
      if (pending.length === 0) {
        return { success: true, syncedCount: 0, message: 'All sales are already synced' };
      }

      // Convert to payload format
      const payload = pending.map((sale) => ({
        clientGeneratedId: sale.clientGeneratedId,
        totalAmount: sale.totalAmount,
        paymentMode: sale.paymentMode,
        items: sale.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPriceAtSale: item.unitPriceAtSale,
          subtotal: item.subtotal,
        })),
      }));

      const response = await saleApi.syncOfflineBatch(payload);

      if (response.success) {
        const syncedIds = pending.map((s) => s.clientGeneratedId);
        await offlineQueue.markSalesSynced(syncedIds);
        return {
          success: true,
          syncedCount: pending.length,
          message: `Successfully synced ${pending.length} offline bill(s)`,
        };
      }

      return {
        success: false,
        syncedCount: 0,
        message: response.message || 'Sync failed on server',
      };
    } catch (err: any) {
      console.error('Error during offline sync:', err);
      return {
        success: false,
        syncedCount: 0,
        message: err.response?.data?.message || err.message || 'Network error during sync',
      };
    } finally {
      this.isSyncing = false;
      this.notify();
    }
  }

  /**
   * Initializes automatic sync listeners on network reconnection
   */
  static initAutoSync() {
    window.addEventListener('online', () => {
      console.log('🌐 Connection restored. Auto-syncing pending offline sales...');
      this.syncPendingSales();
    });

    // Periodic check every 60 seconds if online
    setInterval(() => {
      if (navigator.onLine && !this.isSyncing) {
        this.syncPendingSales();
      }
    }, 60000);
  }
}
