import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetAdminOrders, useRetryOrder } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading } = useGetAdminOrders({ page, limit: 25, status: status || undefined });
  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;

  const statuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">All Orders</h1>
              <p className="text-muted-foreground text-sm mt-1">{total} orders</p>
            </div>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors">
              <option value="">All Status</option>
              {statuses.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {isLoading ? (
              <div className="py-12 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : orders.length === 0 ? (
              <div className="py-16 text-center">
                <Package size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">No orders found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Order ID</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Product</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">User</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Total</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Date</th>
                      <th className="text-left text-xs text-muted-foreground font-medium px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map(order => (
                      <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-background transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-sm font-medium max-w-40 truncate">{order.productName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{order.userEmail}</td>
                        <td className="px-4 py-3 text-sm font-bold text-primary">${parseFloat(order.totalPrice?.toString() ?? '0').toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} size="sm" /></td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {total > 25 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">Prev</button>
              <span className="px-4 py-2 text-sm text-muted-foreground">Page {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 25 >= total} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">Next</button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
