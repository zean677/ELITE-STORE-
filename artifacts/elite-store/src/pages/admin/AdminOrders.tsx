import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useGetAdminOrders, useRetryOrder } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { Package, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const STATUS_LABELS: Record<string, string> = {
  '': 'جميع الطلبات',
  pending: 'قيد الانتظار',
  processing: 'جاري التنفيذ',
  completed: 'مكتمل',
  failed: 'فشل',
  refunded: 'مُسترد',
};

export default function AdminOrders() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const { data, isLoading, refetch } = useGetAdminOrders({ page, limit: 25, status: status || undefined });
  const retryOrder = useRetryOrder();
  const orders = data?.orders ?? [];
  const total = data?.total ?? 0;

  const handleRetry = async (id: string) => {
    try {
      await retryOrder.mutateAsync({ id });
      toast({ title: '⚡ تم إعادة المحاولة' });
      refetch();
    } catch {
      toast({ title: 'خطأ', description: 'فشل في إعادة المحاولة', variant: 'destructive' });
    }
  };

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-6" dir="rtl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">جميع الطلبات</h1>
              <p className="text-muted-foreground text-sm mt-1">{total} طلب إجمالاً</p>
            </div>
            <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
              className="px-3 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" dir="rtl">
              {Object.entries(STATUS_LABELS).map(([val, label]) => (
                <option key={val} value={val}>{label}</option>
              ))}
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
                <p className="text-muted-foreground">لا توجد طلبات</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-background/50">
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">رقم الطلب</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">المنتج</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">المستخدم</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">المبلغ</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">التاريخ</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">الحالة</th>
                      <th className="text-right text-xs text-muted-foreground font-medium px-4 py-3">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map(order => (
                      <motion.tr key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-background transition-colors">
                        <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{order.id.slice(0, 8)}</td>
                        <td className="px-4 py-3 text-sm font-medium max-w-40 truncate">{order.productName}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{order.userEmail}</td>
                        <td className="px-4 py-3 text-sm font-bold text-primary">${parseFloat(order.totalPrice?.toString() ?? '0').toFixed(2)}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString('ar-SY')}</td>
                        <td className="px-4 py-3"><StatusBadge status={order.status} size="sm" /></td>
                        <td className="px-4 py-3">
                          {order.status === 'failed' && (
                            <button onClick={() => handleRetry(order.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                              <RefreshCw size={11} /> إعادة
                            </button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {total > 25 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">السابق</button>
              <span className="px-4 py-2 text-sm text-muted-foreground">صفحة {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 25 >= total}
                className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">التالي</button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
