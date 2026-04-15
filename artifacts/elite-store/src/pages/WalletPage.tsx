import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGetWallet, useGetWalletHistory } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/i18n';
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCw, PlusCircle, ShoppingBag, TrendingDown, TrendingUp } from 'lucide-react';

const typeConfig: Record<string, { icon: any; color: string; sign: string }> = {
  deposit: { icon: ArrowDownLeft, color: 'text-green-400', sign: '+' },
  purchase: { icon: ArrowUpRight, color: 'text-red-400', sign: '-' },
  refund: { icon: RefreshCw, color: 'text-blue-400', sign: '+' },
};

const tabOptions = ['الكل', 'طلبات', 'مسترجع الطلبات'];

export default function WalletPage() {
  const { lang } = useLanguage();
  const { data: wallet } = useGetWallet();
  const { data: history } = useGetWalletHistory({ page: 1, limit: 100 });
  const [tab, setTab] = useState(0);
  const [fromDate, setFromDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [toDate, setToDate] = useState(() => new Date().toISOString().slice(0, 10));

  const transactions = history?.transactions ?? [];

  const totalPurchases = transactions
    .filter(tx => tx.type === 'purchase')
    .reduce((s, tx) => s + Math.abs(parseFloat(tx.amount?.toString() ?? '0')), 0);

  const totalDeposits = transactions
    .filter(tx => tx.type === 'deposit')
    .reduce((s, tx) => s + parseFloat(tx.amount?.toString() ?? '0'), 0);

  const currentBalance = parseFloat(wallet?.balance?.toString() ?? '0');
  const debitBalance = 0;

  const SYP_RATE = 13000;

  const stats = [
    {
      label: lang === 'ar' ? 'اجمالي مشتريات' : 'Total Purchases',
      value: (totalPurchases * SYP_RATE).toFixed(2),
      bg: '#ef4444',
      icon: ShoppingBag,
    },
    {
      label: lang === 'ar' ? 'رصيدك الحالي' : 'Current Balance',
      value: (currentBalance * SYP_RATE).toFixed(2),
      bg: '#22c55e',
      icon: Wallet,
    },
    {
      label: lang === 'ar' ? 'رصيد مدين' : 'Debit Balance',
      value: (debitBalance * SYP_RATE).toFixed(2),
      bg: '#3b82f6',
      icon: TrendingDown,
    },
    {
      label: lang === 'ar' ? 'الوارد' : 'Total Incoming',
      value: (totalDeposits * SYP_RATE).toFixed(2),
      bg: '#a855f7',
      icon: TrendingUp,
    },
  ];

  const filteredTx = transactions.filter(tx => {
    if (tab === 1 && tx.type !== 'purchase') return false;
    if (tab === 2 && tx.type !== 'refund') return false;
    if (fromDate) {
      const txDate = new Date(tx.createdAt).toISOString().slice(0, 10);
      if (txDate < fromDate) return false;
    }
    if (toDate) {
      const txDate = new Date(tx.createdAt).toISOString().slice(0, 10);
      if (txDate > toDate) return false;
    }
    return true;
  });

  const totalFiltered = filteredTx.reduce((s, tx) => {
    const cfg = typeConfig[tx.type];
    if (!cfg) return s;
    const amt = parseFloat(tx.amount?.toString() ?? '0');
    return s + (tx.type === 'purchase' ? -Math.abs(amt) : Math.abs(amt));
  }, 0);

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-5 max-w-2xl mx-auto" dir="rtl">
          <div className="flex items-center justify-between">
            <h1 className="font-heading text-2xl font-bold">{lang === 'ar' ? 'المحفظة' : 'Wallet'}</h1>
            <Link href="/deposit" className="flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
              <PlusCircle size={16} />
              {lang === 'ar' ? 'شحن رصيد' : 'Top Up'}
            </Link>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 gap-3">
            {stats.map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl p-4 flex flex-col gap-2"
                  style={{ background: stat.bg }}
                >
                  <div className="flex items-center gap-2">
                    <Icon size={16} className="text-white/80" />
                    <span className="text-white/80 text-xs font-medium">{stat.label}</span>
                  </div>
                  <p className="text-white font-black text-xl leading-none">{stat.value}</p>
                  <p className="text-white/70 text-xs">ل.س</p>
                </motion.div>
              );
            })}
          </div>

          {/* Date Filters */}
          <div className="flex items-center gap-3 bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'من' : 'From'}</span>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50" />
            </div>
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs text-muted-foreground">{lang === 'ar' ? 'إلى' : 'To'}</span>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="flex-1 bg-background border border-border rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-primary/50" />
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            {tabOptions.map((tab_label, i) => (
              <button
                key={i}
                onClick={() => setTab(i)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${tab === i ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-card border-border text-muted-foreground'}`}
              >
                <span className={`w-5 h-5 rounded-full text-xs flex items-center justify-center font-bold ${tab === i ? 'bg-primary text-white' : 'bg-border text-muted-foreground'}`}>
                  {i === 0 ? filteredTx.length : transactions.filter(tx => i === 1 ? tx.type === 'purchase' : tx.type === 'refund').length}
                </span>
                {tab_label}
              </button>
            ))}
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="px-4 py-2 bg-card border border-border rounded-xl text-sm font-bold">
              {lang === 'ar' ? 'اجمالي' : 'Total'}: {(Math.abs(totalFiltered) * SYP_RATE).toFixed(3)} ل.س
            </div>
          </div>

          {/* Transaction List */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {filteredTx.length === 0 ? (
              <div className="py-12 text-center">
                <Wallet size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">{lang === 'ar' ? 'لا توجد عمليات خلال هذه الفترة.' : 'No transactions found.'}</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredTx.map(tx => {
                  const cfg = typeConfig[tx.type] ?? { icon: RefreshCw, color: 'text-muted-foreground', sign: '' };
                  const Icon = cfg.icon;
                  return (
                    <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-4 hover:bg-background transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center">
                          <Icon size={16} className={cfg.color} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString('ar-SY')}</p>
                        </div>
                      </div>
                      <span className={`text-sm font-bold ${cfg.color}`}>
                        {cfg.sign}{(Math.abs(parseFloat(tx.amount?.toString() ?? '0')) * SYP_RATE).toFixed(2)} ل.س
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
