import React from 'react';
import { Link, useRoute, useSearch } from 'wouter';
import { motion } from 'framer-motion';
import { useGetOrder } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { AlertCircle, CheckCircle2, Loader2, PackageSearch, RefreshCw, Wallet } from 'lucide-react';

export default function OrderResult() {
  const [successMatch, successParams] = useRoute('/orders/:id/success');
  const [failedMatch, failedParams] = useRoute('/orders/:id/failed');
  const search = useSearch();
  const id = successParams?.id || failedParams?.id || '';
  const isSuccess = Boolean(successMatch);
  const reason = new URLSearchParams(search).get('reason');
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  const { data: order, isLoading } = useGetOrder(id, { query: { enabled: isUuid, refetchInterval: isSuccess ? 5000 : false } });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-10" dir="rtl">
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="bg-card border border-border rounded-3xl p-7 text-center">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 ${isSuccess ? 'bg-success/15 border border-success/25' : 'bg-destructive/15 border border-destructive/25'}`}>
              {isSuccess ? <CheckCircle2 size={42} className="text-success" /> : <AlertCircle size={42} className="text-destructive" />}
            </div>

            <h1 className="font-heading text-2xl font-black mb-2">{isSuccess ? 'تم إنشاء الطلب بنجاح' : 'لم يتم إنشاء الطلب'}</h1>
            <p className="text-muted-foreground text-sm leading-7">
              {isSuccess ? 'تم خصم الرصيد وإرسال الطلب للمزود. سيتم تحديث الحالة تلقائياً هنا وفي صفحة طلباتي.' : (reason || 'حدث خطأ أثناء إنشاء الطلب. إذا تم خصم أي مبلغ سيتم إرجاعه تلقائياً.')}
            </p>

            {isLoading && isUuid ? (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                تحميل تفاصيل الطلب
              </div>
            ) : order ? (
              <div className="mt-6 bg-background border border-border rounded-2xl p-4 text-right space-y-3">
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">رقم الطلب</span>
                  <span className="font-mono text-xs">{order.id}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">المنتج</span>
                  <span className="font-bold text-sm">{order.productName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">الحالة</span>
                  <StatusBadge status={order.status} size="sm" />
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">الإجمالي</span>
                  <span className="font-black text-primary">{order.currency} {Number(order.totalPrice).toFixed(2)}</span>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
              <Link href="/orders" className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary text-white font-bold text-sm">
                <PackageSearch size={16} />
                تتبع الطلب
              </Link>
              <Link href="/wallet" className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-background border border-border font-bold text-sm">
                <Wallet size={16} />
                المحفظة
              </Link>
              <Link href="/products" className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-background border border-border font-bold text-sm">
                <RefreshCw size={16} />
                طلب جديد
              </Link>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}