import React, { useState } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useGetAdminDashboard, useGetAdminOrders } from '@workspace/api-client-react';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { StatusBadge } from '@/components/StatusBadge';
import { Users, Package, CreditCard, TrendingUp, ChevronRight, RefreshCw, Layers } from 'lucide-react';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-primary">${parseFloat(payload[0]?.value ?? 0).toFixed(2)}</p>
      <p className="text-xs text-muted-foreground">{payload[1]?.value ?? 0} طلب</p>
    </div>
  );
};

export default function AdminDashboard() {
  const { data: stats } = useGetAdminDashboard();
  const { data: recentOrdersData } = useGetAdminOrders({ limit: 10, page: 1 });
  const recentOrders = recentOrdersData?.orders ?? [];

  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [chartData, setChartData] = React.useState<any[]>([]);
  const [loadingChart, setLoadingChart] = React.useState(false);

  const fetchChart = React.useCallback(async (p: string) => {
    setLoadingChart(true);
    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${BASE}/api/admin/revenue-chart?period=${p}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setChartData(data.map((d: any) => ({
          date: new Date(d.date).toLocaleDateString('ar-SY', { month: 'short', day: 'numeric' }),
          revenue: d.revenue,
          orders: d.orders,
        })));
      }
    } finally {
      setLoadingChart(false);
    }
  }, []);

  React.useEffect(() => { fetchChart(period); }, [period, fetchChart]);

  return (
    <ProtectedRoute adminOnly>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl font-bold">لوحة الإدارة</h1>
              <p className="text-muted-foreground text-sm mt-1">نظرة عامة وإدارة المتجر</p>
            </div>
            <span className="px-3 py-1.5 bg-primary/15 text-primary text-xs font-semibold rounded-full border border-primary/20">Admin Panel</span>
          </div>

          {/* Stats */}
          <motion.div initial="initial" animate="animate" className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            <StatCard icon={Users} label="إجمالي المستخدمين" value={String(stats?.totalUsers ?? 0)} color="primary" />
            <StatCard icon={Package} label="إجمالي الطلبات" value={String(stats?.totalOrders ?? 0)} sub={`${stats?.pendingOrders ?? 0} قيد المعالجة`} color="secondary" />
            <StatCard icon={Layers} label="المنتجات النشطة" value={String((stats as any)?.totalProducts ?? 0)} color="accent" />
            <StatCard icon={CreditCard} label="مدفوعات معلّقة" value={String(stats?.pendingPayments ?? 0)} color="accent" />
            <StatCard icon={TrendingUp} label="إجمالي الإيرادات" value={`$${parseFloat(stats?.totalRevenue?.toString() ?? '0').toFixed(2)}`} sub={`اليوم: $${parseFloat(stats?.revenueToday?.toString() ?? '0').toFixed(2)}`} color="success" />
          </motion.div>

          {/* Revenue Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-heading font-bold">مخطط الإيرادات</h2>
                <p className="text-xs text-muted-foreground mt-0.5">الإيرادات من الطلبات المكتملة</p>
              </div>
              <div className="flex gap-1.5 items-center">
                {loadingChart && <RefreshCw size={12} className="animate-spin text-muted-foreground" />}
                {(['7d', '30d', '90d'] as const).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${period === p ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {p === '7d' ? '7 أيام' : p === '30d' ? '30 يوم' : '90 يوم'}
                  </button>
                ))}
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">لا توجد بيانات بعد — قم بإضافة طلبات لترى المخطط</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#6C5CE7" strokeWidth={2} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold">آخر الطلبات</h2>
                <Link href="/admin/orders" className="text-primary text-sm flex items-center gap-1 hover:underline">عرض الكل <ChevronRight size={14} /></Link>
              </div>
              <div className="bg-card border border-border rounded-2xl overflow-hidden">
                {recentOrders.length === 0 ? (
                  <div className="py-12 text-center">
                    <Package size={32} className="mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground text-sm">لا توجد طلبات بعد</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {recentOrders.map(order => (
                      <div key={order.id} className="flex items-center justify-between p-4 hover:bg-background transition-colors">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">{order.productName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{order.userEmail} · {new Date(order.createdAt).toLocaleDateString('ar-SY')}</p>
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

            {/* Quick Links + Top Products */}
            <div className="space-y-4">
              <h2 className="font-heading font-bold">روابط سريعة</h2>
              <div className="space-y-2">
                {[
                  { href: '/admin/payments', label: 'مراجعة المدفوعات', sub: `${stats?.pendingPayments ?? 0} معلّق`, icon: CreditCard },
                  { href: '/admin/orders', label: 'إدارة الطلبات', sub: `${stats?.pendingOrders ?? 0} قيد المعالجة`, icon: Package },
                  { href: '/admin/users', label: 'إدارة المستخدمين', sub: `${stats?.totalUsers ?? 0} مجموع`, icon: Users },
                  { href: '/admin/products', label: 'إدارة المنتجات', sub: 'عرض وتعديل', icon: Package },
                  { href: '/admin/settings', label: 'الإعدادات', sub: 'مفاتيح API والإعلانات', icon: CreditCard },
                ].map(item => {
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href} className="flex items-center gap-3 w-full bg-card border border-border rounded-xl p-3.5 hover:border-primary/40 hover:bg-background transition-all">
                      <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                        <Icon size={14} className="text-primary" />
                      </div>
                      <div className="text-left min-w-0 flex-1">
                        <p className="text-xs font-semibold">{item.label}</p>
                        <p className="text-xs text-muted-foreground">{item.sub}</p>
                      </div>
                      <ChevronRight size={12} className="text-muted-foreground" />
                    </Link>
                  );
                })}
              </div>

              {/* Top Products */}
              {(stats?.topProducts?.length ?? 0) > 0 && (
                <div>
                  <h2 className="font-heading font-bold mt-5 mb-3">أكثر المنتجات مبيعاً</h2>
                  <div className="space-y-2">
                    {(stats?.topProducts ?? []).slice(0, 5).map((p: any, i: number) => (
                      <div key={p.productId} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
                        <span className="text-xs font-black text-primary w-5 shrink-0">#{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold truncate">{p.productName}</p>
                          <p className="text-xs text-muted-foreground">{p.orderCount} طلب · ${parseFloat(p.revenue).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
