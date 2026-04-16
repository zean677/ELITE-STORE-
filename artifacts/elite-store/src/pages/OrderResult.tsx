import React, { useEffect, useRef } from 'react';
import { Link, useRoute, useSearch } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetOrder } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { useToast } from '@/hooks/use-toast';
import {
  AlertCircle, CheckCircle2, Loader2, PackageSearch,
  RefreshCw, Wallet, Clock, XCircle
} from 'lucide-react';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function LivePulse() {
  return (
    <span className="relative flex h-2.5 w-2.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500" />
    </span>
  );
}

export default function OrderResult() {
  const [successMatch, successParams] = useRoute('/orders/:id/success');
  const [failedMatch, failedParams] = useRoute('/orders/:id/failed');
  const searchStr = useSearch();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const id = successParams?.id || failedParams?.id || '';
  const isSuccessRoute = Boolean(successMatch);
  const reason = new URLSearchParams(searchStr).get('reason');
  const isUuid = UUID_RE.test(id);

  // Tracks whether we've already reacted to a terminal state
  const resolvedRef = useRef(false);

  // Poll while order is processing — stop once terminal
  const { data: order, isLoading } = useGetOrder(id, {
    query: {
      enabled: isUuid,
      refetchInterval: (query) => {
        const status = (query.state.data as any)?.status;
        if (status === 'completed' || status === 'failed') return false;
        return 3500;
      },
    },
  });

  // React to status transitions
  useEffect(() => {
    if (!order || resolvedRef.current) return;
    const status = order.status;

    if (status === 'completed') {
      resolvedRef.current = true;
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: '✅ تم تنفيذ الطلب بنجاح',
        description: order.productName ?? '',
      });
    } else if (status === 'failed') {
      resolvedRef.current = true;
      queryClient.invalidateQueries({ queryKey: ['/api/wallet'] });
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      queryClient.invalidateQueries({ queryKey: ['/api/notifications'] });
      toast({
        title: '❌ فشل الطلب — تم إرجاع الرصيد',
        description: order.productName ?? '',
        variant: 'destructive',
      });
    }
  }, [order?.status, order?.productName, queryClient, toast]);

  const isProcessing = order?.status === 'processing' || order?.status === 'pending';
  const isOrderCompleted = order?.status === 'completed';
  const isOrderFailed = order?.status === 'failed';

  // Visual state based on live order status (overrides URL hint)
  const showSuccess = isOrderCompleted || (isSuccessRoute && !isOrderFailed);
  const showFailed = isOrderFailed || (!isSuccessRoute && !isOrderCompleted);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-xl mx-auto py-8 px-4" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="bg-card border border-border rounded-3xl p-7 text-center"
          >

            {/* Status Icon */}
            <AnimatePresence mode="wait">
              {isProcessing || (!order && isLoading) ? (
                <motion.div
                  key="processing"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.8, opacity: 0 }}
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5 relative"
                  style={{
                    background: 'rgba(245,158,11,0.15)',
                    border: '2px solid rgba(245,158,11,0.3)',
                  }}
                >
                  <Clock size={36} className="text-amber-400" />
                  <span className="absolute inset-0 rounded-full animate-ping border-2 border-amber-400/20" />
                </motion.div>
              ) : showSuccess ? (
                <motion.div
                  key="success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/25 flex items-center justify-center mx-auto mb-5"
                >
                  <CheckCircle2 size={42} className="text-green-400" />
                </motion.div>
              ) : (
                <motion.div
                  key="failed"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 260, damping: 18 }}
                  className="w-20 h-20 rounded-full bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-5"
                >
                  <XCircle size={42} className="text-red-400" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Title */}
            <h1 className="font-heading text-2xl font-black mb-2">
              {isProcessing || (!order && isLoading)
                ? 'جاري معالجة الطلب...'
                : showSuccess
                ? 'تم تنفيذ الطلب بنجاح ✅'
                : 'لم يتم تنفيذ الطلب ❌'}
            </h1>

            {/* Description */}
            <p className="text-muted-foreground text-sm leading-7">
              {isProcessing || (!order && isLoading)
                ? 'يتم إرسال الطلب للمزود الآن. الحالة تتحدث تلقائياً — لا حاجة لتحديث الصفحة.'
                : showSuccess
                ? 'تم تنفيذ طلبك بنجاح وخصم المبلغ من محفظتك.'
                : reason || 'فشل تنفيذ الطلب. إذا تم خصم أي مبلغ، تم إرجاعه تلقائياً إلى محفظتك.'}
            </p>

            {/* Live processing indicator */}
            <AnimatePresence>
              {isProcessing && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center justify-center gap-2 mt-4 text-amber-400"
                >
                  <LivePulse />
                  <span className="text-xs font-semibold">متابعة مباشرة...</span>
                  <Loader2 size={13} className="animate-spin" />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Order Details */}
            {isLoading && isUuid && !order ? (
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                تحميل تفاصيل الطلب...
              </div>
            ) : order ? (
              <motion.div
                layout
                className="mt-6 bg-background border border-border rounded-2xl p-4 text-right space-y-3"
              >
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">رقم الطلب</span>
                  <span className="font-mono text-xs text-muted-foreground">{order.id}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">المنتج</span>
                  <span className="font-bold text-sm">{order.productName}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">الكمية</span>
                  <span className="font-semibold text-sm">x{order.qty}</span>
                </div>
                <div className="flex justify-between gap-4 items-center">
                  <span className="text-muted-foreground text-sm">الحالة</span>
                  <div className="flex items-center gap-2">
                    {isProcessing && <LivePulse />}
                    <StatusBadge status={order.status} size="sm" />
                  </div>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground text-sm">الإجمالي</span>
                  <span className="font-black text-primary">
                    {order.currency} {Number(order.totalPrice).toFixed(2)}
                  </span>
                </div>
              </motion.div>
            ) : null}

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7">
              <Link
                href="/orders"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-primary text-white font-bold text-sm transition-all active:scale-95"
                style={{ boxShadow: '0 4px 16px rgba(108,92,231,0.35)' }}
              >
                <PackageSearch size={16} />
                تتبع الطلب
              </Link>
              <Link
                href="/wallet"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-background border border-border font-bold text-sm transition-all active:scale-95 hover:bg-card"
              >
                <Wallet size={16} />
                المحفظة
              </Link>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-background border border-border font-bold text-sm transition-all active:scale-95 hover:bg-card"
              >
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
