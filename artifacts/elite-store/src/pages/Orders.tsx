import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useGetOrders } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { useLanguage } from '@/i18n';
import { Package, Search } from 'lucide-react';
import { useSettings } from '@/hooks/use-settings';

const STATUS_TABS = [
  { key: '', labelAr: 'الكل', labelEn: 'All' },
  { key: 'completed', labelAr: 'مقبول', labelEn: 'Accepted' },
  { key: 'pending', labelAr: 'انتظار', labelEn: 'Pending' },
  { key: 'failed', labelAr: 'مرفوض', labelEn: 'Rejected' },
];

export default function Orders() {
  const { lang } = useLanguage();
  const { sypRate: SYP_RATE } = useSettings();
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  const { data, isLoading } = useGetOrders({ page, limit: 100, status: status || undefined });
  const allOrders = data?.orders ?? [];

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

  const totalSYP = filtered.reduce((s, o) => s + parseFloat(o.totalPrice?.toString() ?? '0') * SYP_RATE, 0);

  const getCounts = (key: string) => {
    return allOrders.filter(o => {
      if (!key) return true;
      return o.status === key;
    }).length;
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 max-w-2xl mx-auto" dir="rtl">
          <h1 className="font-heading text-2xl font-bold text-right">
            {lang === 'ar' ? 'طلباتي' : 'My Orders'}
          </h1>

          {/* Date Filters */}
          <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{lang === 'ar' ? 'من' : 'From'}</span>
              <input
                type="date"
                value={fromDate}
                onChange={e => setFromDate(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 text-right"
              />
            </div>
            <div className="w-px h-8 bg-border" />
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground whitespace-nowrap">{lang === 'ar' ? 'إلى' : 'To'}</span>
              <input
                type="date"
                value={toDate}
                onChange={e => setToDate(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50 text-right"
              />
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearch(searchInput); }}
              placeholder={lang === 'ar' ? 'بحث...' : 'Search...'}
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
              return (
                <button
                  key={tab.key}
                  onClick={() => { setStatus(tab.key); setPage(1); }}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all whitespace-nowrap border shrink-0 ${
                    active
                      ? 'bg-primary/15 border-primary/40 text-primary'
                      : 'bg-card border-border text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {lang === 'ar' ? tab.labelAr : tab.labelEn}
                  <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${
                    active ? 'bg-primary text-white' : 'bg-border text-muted-foreground'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold">
              {lang === 'ar' ? 'إجمالي' : 'Total'}: {totalSYP.toFixed(3)} ل.س
            </div>
          </div>

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
                  {lang === 'ar' ? 'لا يوجد طلبات ضمن النطاق الزمني الحالي.' : 'No orders found in the selected period.'}
                </p>
                <Link href="/products" className="inline-block mt-4 px-4 py-2 bg-primary/15 text-primary text-sm font-medium rounded-xl">
                  {lang === 'ar' ? 'تصفح المنتجات' : 'Browse Products'}
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map((order, idx) => (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="flex items-center gap-4 p-4 hover:bg-background transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
                      <Package size={16} className="text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{order.productName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        x{order.qty} · {new Date(order.createdAt).toLocaleDateString('ar-SY')} · #{order.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-primary">
                        {(parseFloat(order.totalPrice?.toString() ?? '0') * SYP_RATE).toFixed(2)} ل.س
                      </span>
                      <StatusBadge status={order.status} size="sm" />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
