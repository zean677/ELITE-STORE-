import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGetOrders } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { useLanguage } from '@/i18n';
import { Package, ChevronRight } from 'lucide-react';

export default function Orders() {
  const { t } = useLanguage();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useGetOrders({ page, limit: 20, status: status || undefined });
  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;

  const statusOptions = ['', 'pending', 'processing', 'completed', 'failed', 'refunded'];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">{t('orders')}</h1>
              <p className="text-muted-foreground text-sm mt-1">{total} total orders</p>
            </div>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors">
              {statusOptions.map(s => (
                <option key={s} value={s}>{s ? t(s) : 'All Status'}</option>
              ))}
            </select>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                    <div className="w-10 h-10 bg-muted rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-1/3" />
                      <div className="h-3 bg-muted rounded w-1/4" />
                    </div>
                    <div className="h-6 w-16 bg-muted rounded-full" />
                  </div>
                ))}
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center">
                <Package size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No orders found</p>
                <Link href="/products" className="inline-block mt-4 px-4 py-2 bg-primary/15 text-primary text-sm font-medium rounded-xl">
                  Browse Products
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {orders.map(order => (
                  <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-4 p-4 hover:bg-background transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{order.productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        x{order.qty} · {new Date(order.createdAt).toLocaleDateString()} · #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-sm font-bold text-primary">${parseFloat(order.totalPrice?.toString() ?? '0').toFixed(2)}</span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {total > 20 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40 hover:border-primary/40 transition-colors">Prev</button>
              <span className="px-4 py-2 text-sm text-muted-foreground">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 20 >= total} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40 hover:border-primary/40 transition-colors">Next</button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
