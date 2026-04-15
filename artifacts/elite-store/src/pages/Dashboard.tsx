import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGetWallet, useGetOrders, useGetNotifications } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/i18n';
import { Wallet, Package, Bell, ShoppingBag, ChevronRight, TrendingUp } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  return (
    <motion.div variants={fadeUp} className={`bg-card border border-border rounded-2xl p-5 relative overflow-hidden group hover:border-${color}/40 transition-all`}>
      <div className={`absolute inset-0 bg-gradient-to-br from-${color}/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
      <div className={`w-10 h-10 rounded-xl bg-${color}/15 border border-${color}/20 flex items-center justify-center mb-3`}>
        <Icon size={18} className={`text-${color}`} />
      </div>
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
    </motion.div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { data: wallet } = useGetWallet();
  const { data: ordersData } = useGetOrders({ limit: 5, page: 1 });
  const { data: notifications } = useGetNotifications();

  const recentOrders = ordersData?.orders ?? [];
  const unreadNotifications = (notifications ?? []).filter(n => !n.isRead).length;

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-heading text-2xl font-bold">
              Hello, {user?.username}
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Welcome back to your dashboard</p>
          </motion.div>

          <motion.div initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Wallet} label={t('balance')} value={`$${parseFloat(wallet?.balance?.toString() ?? user?.balance?.toString() ?? '0').toFixed(2)}`} color="primary" />
            <StatCard icon={Package} label="Total Orders" value={String(ordersData?.total ?? 0)} color="secondary" />
            <StatCard icon={Bell} label="Notifications" value={String(unreadNotifications)} color="accent" />
            <StatCard icon={TrendingUp} label="Completed" value={String(recentOrders.filter(o => o.status === 'completed').length)} color="success" />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold">Recent Orders</h2>
                <Link href="/orders" className="text-primary text-sm flex items-center gap-1 hover:underline">
                  View All <ChevronRight size={14} />
                </Link>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {recentOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">No orders yet</p>
                    <Link href="/products" className="inline-block mt-4 px-4 py-2 bg-primary/15 text-primary text-sm font-medium rounded-xl hover:bg-primary/25 transition-colors">
                      Browse Products
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 hover:bg-background transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{order.productName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">x{order.qty} · {new Date(order.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-sm font-bold text-primary">${parseFloat(order.totalPrice?.toString() ?? '0').toFixed(2)}</span>
                          <StatusBadge status={order.status} size="sm" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <h2 className="font-heading font-bold mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Link href="/products" className="flex items-center gap-3 w-full bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:bg-background transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
                    <ShoppingBag size={16} className="text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Buy Products</p>
                    <p className="text-xs text-muted-foreground">Browse the store</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-muted-foreground" />
                </Link>
                <Link href="/deposit" className="flex items-center gap-3 w-full bg-card border border-border rounded-xl p-4 hover:border-secondary/40 hover:bg-background transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-secondary/15 flex items-center justify-center group-hover:bg-secondary/25 transition-colors">
                    <Wallet size={16} className="text-secondary" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">Deposit Funds</p>
                    <p className="text-xs text-muted-foreground">Top up your wallet</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-muted-foreground" />
                </Link>
                <Link href="/orders" className="flex items-center gap-3 w-full bg-card border border-border rounded-xl p-4 hover:border-accent/40 hover:bg-background transition-all group">
                  <div className="w-9 h-9 rounded-lg bg-accent/15 flex items-center justify-center group-hover:bg-accent/25 transition-colors">
                    <Package size={16} className="text-accent" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-semibold">My Orders</p>
                    <p className="text-xs text-muted-foreground">View order history</p>
                  </div>
                  <ChevronRight size={14} className="ml-auto text-muted-foreground" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
