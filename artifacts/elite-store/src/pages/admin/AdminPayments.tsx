import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetAdminPayments, useVerifyPayment } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { CreditCard, CheckCircle, XCircle, ExternalLink, Hash, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminPayments() {
  const [status, setStatus] = useState('pending');
  const [page, setPage] = useState(1);
  const [screenshotModal, setScreenshotModal] = useState<string | null>(null);
  const { toast } = useToast();

  const { data, refetch, isLoading } = useGetAdminPayments({ page, limit: 25, status: status || undefined });
  const verifyPayment = useVerifyPayment();
  const payments = data?.payments ?? [];
  const total = data?.total ?? 0;

  const handleAction = async (id: number, action: 'approved' | 'rejected') => {
    try {
      await verifyPayment.mutateAsync({ id, data: { status: action, adminNote: action === 'rejected' ? 'Manual rejection' : 'Manual approval' } });
      toast({ title: `Payment ${action}` });
      refetch();
    } catch {
      toast({ title: 'Error', description: 'Failed to update payment', variant: 'destructive' });
    }
  };

  const statuses = ['', 'pending', 'approved', 'rejected'];

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
                <img src={screenshotModal} alt="Payment Screenshot" className="w-full rounded-2xl border border-border shadow-2xl" />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold">Payments</h1>
              <p className="text-muted-foreground text-sm mt-1">{total} payments</p>
            </div>
            <div className="flex gap-2">
              {statuses.map(s => (
                <button key={s} onClick={() => { setStatus(s); setPage(1); }} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${status === s ? 'bg-primary text-white' : 'bg-card border border-border text-muted-foreground hover:text-foreground'}`}>
                  {s || 'All'}
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
                <p className="text-muted-foreground">No payments found</p>
              </div>
            ) : (
              <AnimatePresence>
                {payments.map(payment => (
                  <motion.div key={payment.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="bg-card border border-border rounded-2xl p-5">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">#{payment.id}</span>
                          <StatusBadge status={payment.status} size="sm" />
                        </div>
                        <p className="text-xs text-muted-foreground">{payment.userEmail}</p>
                        <p className="text-sm font-bold text-primary">{payment.currency} {parseFloat(payment.amount?.toString() ?? '0').toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground capitalize">Method: {payment.method?.replace(/_/g, ' ')}</p>
                        {(payment as any).transactionRef && (
                          <p className="text-xs flex items-center gap-1 text-amber-400">
                            <Hash size={11} />
                            رقم العملية: <span className="font-mono font-bold">{(payment as any).transactionRef}</span>
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">{new Date(payment.createdAt).toLocaleString()}</p>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        {payment.screenshotUrl && payment.screenshotUrl !== 'pending_upload' && (
                          <button
                            type="button"
                            onClick={() => setScreenshotModal(payment.screenshotUrl!)}
                            className="flex items-center gap-1 text-xs text-secondary hover:underline"
                          >
                            <ImageIcon size={12} />
                            عرض الصورة
                          </button>
                        )}
                        {payment.status === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleAction(payment.id, 'approved')} className="flex items-center gap-1.5 px-3 py-1.5 bg-success/15 text-success border border-success/30 text-xs font-semibold rounded-lg hover:bg-success/25 transition-colors">
                              <CheckCircle size={13} />
                              Approve
                            </button>
                            <button onClick={() => handleAction(payment.id, 'rejected')} className="flex items-center gap-1.5 px-3 py-1.5 bg-destructive/15 text-destructive border border-destructive/30 text-xs font-semibold rounded-lg hover:bg-destructive/25 transition-colors">
                              <XCircle size={13} />
                              Reject
                            </button>
                          </div>
                        )}
                        {payment.adminNote && (
                          <p className="text-xs text-muted-foreground italic">Note: {payment.adminNote}</p>
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
