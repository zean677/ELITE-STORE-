import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGetWallet, useGetWalletHistory } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useLanguage } from '@/i18n';
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCw, PlusCircle } from 'lucide-react';

const typeConfig: Record<string, { icon: any; color: string; sign: string }> = {
  deposit: { icon: ArrowDownLeft, color: 'text-success', sign: '+' },
  purchase: { icon: ArrowUpRight, color: 'text-destructive', sign: '-' },
  refund: { icon: RefreshCw, color: 'text-secondary', sign: '+' },
};

export default function WalletPage() {
  const { t } = useLanguage();
  const { data: wallet } = useGetWallet();
  const { data: history } = useGetWalletHistory({ page: 1, limit: 30 });

  const transactions = history?.transactions ?? [];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="font-heading text-2xl font-bold">{t('wallet')}</h1>
            <p className="text-muted-foreground text-sm mt-1">Your wallet balance and transaction history</p>
          </div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-primary/20 via-card to-secondary/10 border border-primary/20 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2">
                <Wallet size={18} className="text-primary" />
                <span className="text-muted-foreground text-sm font-medium">{t('balance')}</span>
              </div>
              <p className="text-4xl font-black">${parseFloat(wallet?.balance?.toString() ?? '0').toFixed(2)}</p>
              <p className="text-muted-foreground text-sm mt-2">USD Balance</p>
              <Link href="/deposit" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">
                <PlusCircle size={16} />
                {t('deposit')}
              </Link>
            </div>
          </motion.div>

          <div>
            <h2 className="font-heading font-bold mb-4">Transaction History</h2>
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {transactions.length === 0 ? (
                <div className="py-12 text-center">
                  <Wallet size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-muted-foreground text-sm">No transactions yet</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {transactions.map(tx => {
                    const cfg = typeConfig[tx.type] ?? { icon: RefreshCw, color: 'text-muted-foreground', sign: '' };
                    const Icon = cfg.icon;
                    return (
                      <motion.div key={tx.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-4 hover:bg-background transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-xl bg-card border border-border flex items-center justify-center`}>
                            <Icon size={16} className={cfg.color} />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{tx.description}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-bold ${cfg.color}`}>
                          {cfg.sign}${Math.abs(parseFloat(tx.amount?.toString() ?? '0')).toFixed(2)}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
