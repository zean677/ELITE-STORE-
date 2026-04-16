import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAdminPayments, useVerifyPayment } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { CreditCard, CheckCircle, XCircle, Hash, Image as ImageIcon, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminPayments() {
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const { toast } = useToast();

  const { data, refetch, isLoading } = useGetAdminPayments(
    { status: status || undefined } as any,
    { query: { refetchOnMount: 'always', refetchInterval: 15000, staleTime: 0 } } as any,
  );
  const verifyPayment = useVerifyPayment();

  const payments = (Array.isArray(data) ? data : []) as any[];
  const total = payments.length;

  const handleAction = async (id: number, action: 'approved' | 'rejected') => {
    try {
      await verifyPayment.mutateAsync({
        id: String(id) as any,
        data: {
          action: action === 'approved' ? 'approve' : 'reject',
          adminNote: action === 'rejected' ? 'تم الرفض من الأدمن' : 'تمت الموافقة من الأدمن',
        },
      });
      toast({
        title: action === 'approved' ? '✅ تمت الموافقة' : '❌ تم الرفض',
        description: action === 'approved'
          ? 'تمت الموافقة على الدفعة وأُضيف الرصيد للمستخدم'
          : 'تم رفض الدفعة',
      });
      refetch();
    } catch (err: any) {
      const msg = err?.data?.message ?? err?.message ?? 'فشلت العملية';
      toast({ title: 'خطأ', description: msg, variant: 'destructive' });
    }
  };

  const statuses = [
    { value: '', label: 'الكل' },
    { value: 'pending', label: 'معلّق' },
    { value: 'approved', label: 'موافق عليه' },
    { value: 'rejected', label: 'مرفوض' },
  ];

  const methodNames: Record<string, string> = {
    syriatel_cash_auto: 'سيريتل كاش أوتو',
    syriatel_cash_manual: 'سيريتل كاش يدوي',
    sham_cash_auto: 'شام كاش أوتو',
    sham_cash_dollar: 'شام كاش دولار',
    sham_cash_syp: 'شام كاش سوري',
    usdt_bep20_auto: 'USDT BEP-20',
    usdt_manual: 'USDT يدوي',
    binance_id: 'Binance ID',
    coinex: 'CoinEx',
  };

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        {/* Screenshot Modal */}
        <AnimatePresence>
          {screenshotModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setScreenshotModal(null)}
              className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative max-w-lg w-full"
                onClick={e => e.stopPropagation()}
              >
                <button onClick={() => setScreenshotModal(null)} className="absolute -top-10 right-0 text-white/70 hover:text-white text-sm flex items-center gap-1">
                  <XCircle size={16} /> إغلاق
                </button>
                <img src={screenshotModal} alt="صورة إثبات الدفع" className="w-full rounded-2xl border border-border shadow-2xl" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6" dir="rtl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">طلبات الشحن</h1>
              <p className="text-muted-foreground text-sm mt-1">{total} طلب</p>
            </div>
            <div className="flex gap-2 flex-wrap">
              {statuses.map(s => (
                <button
                  key={s.value}
                  onClick={() => { setStatus(s.value); setPage(1); }}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${status === s.value ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="bg-card border border-border rounded-2xl py-12 text-center">
                <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : payments.length === 0 ? (
              <div className="bg-card border border-border rounded-2xl py-16 text-center">
                <CreditCard size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground">لا توجد طلبات</p>
              </div>
            ) : (
              <AnimatePresence>
                {payments.map((payment: any) => (
                  <motion.div
                    key={payment.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-card border border-border rounded-2xl p-5"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">#{payment.id}</span>
                          <StatusBadge status={payment.status} size="sm" />
                        </div>

                        {/* User info */}
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <User size={12} />
                          <span>{payment.username || payment.userEmail || `User #${payment.userId}`}</span>
                          {payment.userEmail && payment.username && (
                            <span className="text-muted-foreground/60">({payment.userEmail})</span>
                          )}
                        </div>

                        {/* Amount */}
                        <p className="text-base font-bold text-primary">
                          {payment.currency} {parseFloat(payment.amount?.toString() ?? '0').toLocaleString()}
                        </p>

                        {/* Method */}
                        <p className="text-xs text-muted-foreground">
                          {methodNames[payment.method] ?? payment.method?.replace(/_/g, ' ')}
                        </p>

                        {/* Transaction ref */}
                        {payment.transactionRef && (
                          <div className="flex items-center gap-1.5 text-xs bg-amber-400/10 border border-amber-400/30 rounded-lg px-2.5 py-1.5 w-fit">
                            <Hash size={11} className="text-amber-400" />
                            <span className="text-amber-300 font-mono font-bold select-all">{payment.transactionRef}</span>
                          </div>
                        )}

                        <p className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleString('ar-SY')}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {/* Screenshot button */}
                        {payment.screenshotUrl && payment.screenshotUrl !== 'pending_upload' && (
                          <button
                            type="button"
                            onClick={() => setScreenshotModal(payment.screenshotUrl)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-secondary/15 text-secondary border border-secondary/30 text-xs font-semibold rounded-lg hover:bg-secondary/25 transition-colors"
                          >
                            <ImageIcon size={12} />
                            عرض الصورة
                          </button>
                        )}

                        {/* Approve / Reject */}
                        {payment.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleAction(payment.id, 'approved')}
                              disabled={verifyPayment.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-success/15 text-success border border-success/30 text-xs font-semibold rounded-lg hover:bg-success/25 transition-colors disabled:opacity-50"
                            >
                              <CheckCircle size={13} />
                              قبول
                            </button>
                            <button
                              onClick={() => handleAction(payment.id, 'rejected')}
                              disabled={verifyPayment.isPending}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/15 text-destructive border border-destructive/30 text-xs font-semibold rounded-lg hover:bg-destructive/25 transition-colors disabled:opacity-50"
                            >
                              <XCircle size={13} />
                              رفض
                            </button>
                          </div>
                        )}

                        {payment.adminNote && (
                          <p className="text-xs text-muted-foreground italic">{payment.adminNote}</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {total > 25 && (
            <div className="flex justify-center gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">السابق</button>
              <span className="px-4 py-2 text-sm text-muted-foreground">صفحة {page}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page * 25 >= total} className="px-4 py-2 bg-card border border-border rounded-xl text-sm disabled:opacity-40">التالي</button>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
