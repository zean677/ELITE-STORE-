import React from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { useGetAdminDashboard, useGetAdminOrders } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { Users, Package, CreditCard, TrendingUp, ChevronRight } from 'lucide-react';

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub?: string; color: string }) {
  return (
    <motion.div variants={fadeUp} className="bg-card border border-border rounded-2xl p-5">
      <div className={`w-10 h-10 rounded-xl bg-${color}/15 border border-${color}/20 flex items-center justify-center mb-3`}>
        <Icon size={18} className={`text-${color}`} />
      </div>
      <p className="text-muted-foreground text-xs font-medium">{label}</p>
      <p className="text-2xl font-black mt-1">{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data: stats } = useGetAdminDashboard();
  const { data: recentOrdersData } = useGetAdminOrders({ limit: 10, page: 1 });
  const recentOrders = recentOrdersData?.orders ?? [];

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Overview and management</p>
            </div>
            <span className="px-3 py-1.5 bg-primary/15 text-primary text-xs font-semibold rounded-full border border-primary/20">Admin Panel</span>
          </div>

          <motion.div initial="initial" animate="animate" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard icon={Users} label="Total Users" value={String(stats?.totalUsers ?? 0)} color="primary" />
            <StatCard icon={Package} label="Total Orders" value={String(stats?.totalOrders ?? 0)} sub={`${stats?.pendingOrders ?? 0} pending`} color="secondary" />
            <StatCard icon={CreditCard} label="Pending Payments" value={String(stats?.pendingPayments ?? 0)} color="accent" />
            <StatCard icon={TrendingUp} label="Total Revenue" value={`$${parseFloat(stats?.totalRevenue?.toString() ?? '0').toFixed(2)}`} color="success" />
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold">Recent Orders</h2>
                <Link href="/admin/orders" className="text-primary text-sm flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></Link>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {recentOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">No orders yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 hover:bg-background transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{order.productName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{order.userEmail} · {new Date(order.createdAt).toLocaleDateString()}</p>
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
              <h2 className="font-heading font-bold mb-4">Quick Links</h2>
              <div className="space-y-3">
                {[
                  { href: '/admin/payments', label: 'Review Payments', sub: `${stats?.pendingPayments ?? 0} pending`, icon: CreditCard },
                  { href: '/admin/orders', label: 'Manage Orders', sub: `${stats?.pendingOrders ?? 0} pending`, icon: Package },
                  { href: '/admin/users', label: 'Manage Users', sub: `${stats?.totalUsers ?? 0} total`, icon: Users },
                  { href: '/admin/products', label: 'Manage Products', sub: 'View all products', icon: Package },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className="flex items-center gap-3 w-full bg-card border border-border rounded-xl p-4 hover:border-primary/40 hover:bg-background transition-all">
                      <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center">
                        <Icon size={16} className="text-primary" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-sm font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                      <ChevronRight size={14} className="text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
