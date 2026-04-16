import { useEffect, useRef, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';

const POLL_INTERVAL_MS = 3500;
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

interface PollingOrder {
  id: string;
  status: string;
}

/**
 * Polls backend for orders in "processing" state.
 * Stops polling each order individually once it transitions
 * to "completed" or "failed".
 * Refetches wallet balance automatically on status change.
 */
export function useOrderPolling(orders: PollingOrder[]) {
  const queryClient = useQueryClient();
  const intervalsRef = useRef<Map<string, ReturnType<typeof setInterval>>>(new Map());
  const prevStatusRef = useRef<Map<string, string>>(new Map());

  const pollOrder = useCallback(async (orderId: string) => {
    try {
      const token = localStorage.getItem('elite_token');
      if (!token) return;

      const res = await fetch(`${BASE}/api/orders/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) return;

      const data = await res.json();
      const newStatus: string = data.status ?? '';
      const prevStatus = prevStatusRef.current.get(orderId);

      if (prevStatus !== newStatus) {
        prevStatusRef.current.set(orderId, newStatus);

        // Invalidate the specific order query
        queryClient.invalidateQueries({ queryKey: [`/api/orders/${orderId}`] });
        // Invalidate the orders list
        queryClient.invalidateQueries({ queryKey: ['/api/orders'] });

        // If order finished processing, also refresh wallet
        if (newStatus === 'completed' || newStatus === 'failed') {
          queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
          queryClient.invalidateQueries({ queryKey: ['/api/me'] });
          queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });

          // Stop polling this order
          const interval = intervalsRef.current.get(orderId);
          if (interval) {
            clearInterval(interval);
            intervalsRef.current.delete(orderId);
          }
        }
      }
    } catch {
      // Network errors are non-fatal for polling
    }
  }, [queryClient]);

  useEffect(() => {
    const processingOrders = orders.filter(o => o.status === 'processing');

    // Start polling new processing orders
    for (const order of processingOrders) {
      if (!intervalsRef.current.has(order.id)) {
        prevStatusRef.current.set(order.id, order.status);
        const interval = setInterval(() => pollOrder(order.id), POLL_INTERVAL_MS);
        intervalsRef.current.set(order.id, interval);
        // Poll immediately on first mount
        pollOrder(order.id);
      }
    }

    // Clean up intervals for orders no longer processing
    const processingIds = new Set(processingOrders.map(o => o.id));
    for (const [id, interval] of intervalsRef.current.entries()) {
      if (!processingIds.has(id)) {
        clearInterval(interval);
        intervalsRef.current.delete(id);
      }
    }

    return () => {
      // Cleanup all on unmount
      for (const interval of intervalsRef.current.values()) {
        clearInterval(interval);
      }
      intervalsRef.current.clear();
    };
  }, [orders, pollOrder]);

  return {
    pollingCount: intervalsRef.current.size,
  };
}
