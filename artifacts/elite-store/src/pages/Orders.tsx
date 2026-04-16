import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetOrders } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { useLanguage } from '@/i18n';
import { Package, Search, RefreshCw, Wifi, CheckCircle2, XCircle } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';
import { useOrderPolling } from '@/hooks/use-order-polling';
import { useToast } from '@/hooks/use-toast';

const STATUS_TABS = [
  { key: '', labelAr: 'الكل', labelEn: 'All' },
  { key: 'completed', labelAr: 'مكتمل', labelEn: 'Completed' },
  { key: 'processing', labelAr: 'جاري', labelEn: 'Processing' },
  { key: 'pending', labelAr: 'انتظار', labelEn: 'Pending' },
  { key: 'failed', labelAr: 'فشل', labelEn: 'Failed' },
];

function LiveDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
    </span>
  );
}

export default function Orders() {
  const { lang } = useLanguage();
  const { sypRate: SYP_RATE } = useSettings();
  const { toast } = useToast();
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  const { data, isLoading, refetch, isFetching } = useGetOrders({
    page: 1,
    limit: 100,
    status: status || undefined,
  });

  const allOrders = data?.orders ?? [];

  // Real-time polling for processing orders
  useOrderPolling(allOrders.map(o => ({ id: o.id, status: o.status })));

  // Detect status transitions and toast notifications
  const prevStatusesRef = useRef<Record<string, string>>({});
  useEffect(() => {
    for (const order of allOrders) {
      const prev = prevStatusesRef.current[order.id];
      if (prev && prev !== order.status) {
        if (order.status === 'completed') {
          toast({
            title: lang === 'ar' ? '✅ تم تنفيذ الطلب' : '✅ Order Completed',
            description: order.productName ?? '',
          });
        } else if (order.status === 'failed') {
          toast({
            title: lang === 'ar' ? '❌ فشل الطلب — تم إرجاع الرصيد' : '❌ Order Failed — Balance Refunded',
            description: order.productName ?? '',
            variant: 'destructive',
          });
        }
      }
      prevStatusesRef.current[order.id] = order.status;
    }
  }, [allOrders, lang, toast]);

  const filtered = allOrders.filter(order => {
    if (search) {
      const s = search.toLowerCase();
      if (
        !order.productName?.toLowerCase().includes(s) &&
        !order.id?.toLowerCase().includes(s)
      ) return false;
    }
    if (fromDate) {
      const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
      if (orderDate < fromDate) return false;
    }
    if (toDate) {
      const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
      if (orderDate > toDate) return false;
    }
    return true;
  });

  const totalSYP = filtered.reduce(
    (s, o) => s + parseFloat(o.totalPrice?.toString() ?? '0') * SYP_RATE,
    0,
  );

  const processingCount = allOrders.filter(o => o.status === 'processing').length;
  const getCounts = (key: string) =>
    allOrders.filter(o => (!key ? true : o.status === key)).length;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 max-w-2xl mx-auto" dir="rtl">

          {/* Header */}
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold">
              {lang === 'ar' ? 'طلباتي' : 'My Orders'}
            </h1>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-border hover:bg-card transition-all active:scale-95"
            >
              <RefreshCw size={12} className={isFetching ? 'animate-spin' : ''} />
              {lang === 'ar' ? 'تحديث' : 'Refresh'}
            </button>
          </div>

          {/* Live Tracker Banner */}
          <AnimatePresence>
            {processingCount > 0 && (
              <motion.div
                key="live-banner"
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                className="flex items-center gap-3 px-4 py-3 rounded-2xl border"
                style={{
                  background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(234,179,8,0.06))',
                  borderColor: 'rgba(245,158,11,0.3)',
                }}
              >
                <LiveDot />
                <Wifi size={14} className="text-amber-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-amber-400">
                    {lang === 'ar'
                      ? `${processingCount} طلب قيد التنفيذ — متابعة تلقائية`
                      : `${processingCount} order${processingCount > 1 ? 's' : ''} processing — live tracking`}
                  </p>
                  <p className="text-[10px] text-amber-400/70 mt-0.5">
                    {lang === 'ar'
                      ? 'الحالة والرصيد يتحدثان تلقائياً دون تحديث الصفحة'
                      : 'Status & wallet update automatically without refresh'}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Date Filters */}
          <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {lang === 'ar' ? 'من' : 'From'}
              </span>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 text-right"
              />
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {lang === 'ar' ? 'إلى' : 'To'}
              </span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 text-right"
              />
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput); }}
              placeholder={lang === 'ar' ? 'بحث بالمنتج أو رقم الطلب...' : 'Search by product or order ID...'}
              className="flex-1 bg-card border border-border rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors text-right"
            />
            <button
              onClick={() => setSearch(searchInput)}
              className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 shrink-0"
              style={{ background: 'var(--primary)' }}
            >
              <Search size={18} className="text-white" />
            </button>
          </div>

          {/* Status Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_TABS.map(tab => {
              const count = getCounts(tab.key);
              const active = status === tab.key;
              const isProcessingTab = tab.key === 'processing';
              return (
                <button
                  key={tab.key}
                  onClick={() => setStatus(tab.key)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border shrink-0 ${
                    active
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'bg-card border-border text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {isProcessingTab && count > 0 && <LiveDot />}
                  {lang === 'ar' ? tab.labelAr : tab.labelEn}
                  <span
                    className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                      active ? 'bg-primary text-white' : 'bg-border text-muted-foreground'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Total */}
          {filtered.length > 0 && (
            <div className="flex justify-end">
              <div className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold">
                {lang === 'ar' ? 'الإجمالي' : 'Total'}: {(totalSYP / SYP_RATE).toFixed(2)} $ · {totalSYP.toFixed(0)} ل.س
              </div>
            </div>
          )}

          {/* Orders List */}
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
            ) : filtered.length === 0 ? (
              <div className="py-16 text-center">
                <Package size={40} className="mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-muted-foreground text-sm">
                  {lang === 'ar'
                    ? 'لا يوجد طلبات ضمن النطاق الحالي.'
                    : 'No orders found in the selected period.'}
                </p>
                <Link
                  href="/"
                  className="inline-block mt-4 px-4 py-2 bg-primary/15 text-primary text-sm font-medium rounded-xl"
                >
                  {lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                <AnimatePresence initial={false}>
                  {filtered.map((order, idx) => {
                    const isProcessing = order.status === 'processing';
                    const isCompleted = order.status === 'completed';
                    const isFailed = order.status === 'failed';

                    return (
                      <motion.div
                        key={order.id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        className={`flex items-center gap-4 p-4 transition-colors ${
                          isProcessing ? 'bg-amber-500/5' : 'hover:bg-background'
                        }`}
                      >
                        {/* Status Icon */}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 relative"
                          style={{
                            background: isProcessing
                              ? 'rgba(245,158,11,0.15)'
                              : isCompleted
                              ? 'rgba(34,197,94,0.15)'
                              : isFailed
                              ? 'rgba(239,68,68,0.15)'
                              : 'rgba(108,92,231,0.15)',
                          }}
                        >
                          {isProcessing ? (
                            <RefreshCw size={16} className="animate-spin text-amber-400" />
                          ) : isCompleted ? (
                            <CheckCircle2 size={16} className="text-green-400" />
                          ) : isFailed ? (
                            <XCircle size={16} className="text-red-400" />
                          ) : (
                            <Package size={16} className="text-primary" />
                          )}
                          {isProcessing && (
                            <span className="absolute inset-0 rounded-xl animate-ping border border-amber-400/30" />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-medium truncate">{order.productName}</p>
                            {isProcessing && <LiveDot />}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            x{order.qty} · {new Date(order.createdAt).toLocaleDateString('ar-SY')} ·{' '}
                            <span className="font-mono">#{order.id.slice(0, 8)}</span>
                          </p>
                          {isProcessing && (
                            <p className="text-[10px] text-amber-400 mt-0.5 font-medium">
                              {lang === 'ar' ? 'جاري التنفيذ...' : 'Processing...'}
                            </p>
                          )}
                        </div>

                        {/* Price + Status */}
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-sm font-bold text-primary">
                            {(parseFloat(order.totalPrice?.toString() ?? '0') * SYP_RATE).toFixed(0)} ل.س
                          </span>
                          <StatusBadge status={order.status} size="sm" />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
