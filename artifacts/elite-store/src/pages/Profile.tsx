import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import { useGetWallet, useGetOrders } from '@workspace/api-client-react';
import { User, Mail, Wallet, Package, Star, Shield, Copy, CheckCircle, LogOut, ChevronRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: wallet } = useGetWallet();
  const { data: ordersData } = useGetOrders({ limit: 100, page: 1 });
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const orders = ordersData?.orders ?? [];
  const completed = orders.filter(o => o.status === 'completed').length;
  const failed = orders.filter(o => o.status === 'failed').length;
  const balance = parseFloat(wallet?.balance?.toString() ?? user?.balance?.toString() ?? '0');

  const copyId = () => {
    navigator.clipboard.writeText(String(user?.id ?? ''));
    setCopied(true);
    toast({ title: 'تم النسخ', description: 'تم نسخ معرّف الحساب' });
    setTimeout(() => setCopied(false), 2000);
  };

  const initials = (user?.username ?? 'U').slice(0, 2).toUpperCase();

  const stats = [
    { label: 'الرصيد الحالي', value: `$${balance.toFixed(2)}`, sub: `${(balance * 13000).toLocaleString()} ل.س`, color: 'success', icon: Wallet },
    { label: 'إجمالي الطلبات', value: String(ordersData?.total ?? 0), sub: `${completed} مكتمل`, color: 'primary', icon: Package },
    { label: 'طلبات مكتملة', value: String(completed), sub: `نسبة النجاح ${ordersData?.total ? Math.round(completed / (ordersData.total || 1) * 100) : 0}%`, color: 'secondary', icon: Star },
    { label: 'طلبات فاشلة', value: String(failed), sub: 'تم استرداد المبلغ', color: 'destructive', icon: Shield },
  ];

  const quickLinks = [
    { href: '/wallet', label: 'المحفظة والرصيد', sub: 'إيداع وسجل المعاملات', icon: Wallet },
    { href: '/orders', label: 'طلباتي', sub: 'متابعة حالة الطلبات', icon: Package },
    { href: '/deposit', label: 'إيداع رصيد', sub: 'شحن المحفظة', icon: Wallet },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-2xl space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-black text-white shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-xl font-bold">{user?.username}</h1>
                  {user?.role === 'admin' && (
                    <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30">Admin</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Mail size={13} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <User size={13} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground font-mono">ID: {user?.id}</p>
                  <button onClick={copyId} className="text-muted-foreground hover:text-primary transition-colors">
                    {copied ? <CheckCircle size={12} className="text-success" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <motion.div initial="initial" animate="animate" className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl p-4">
                <div className={`w-8 h-8 rounded-xl bg-${s.color}/15 flex items-center justify-center mb-3`}>
                  <s.icon size={16} className={`text-${s.color}`} />
                </div>
                <p className="text-muted-foreground text-xs">{s.label}</p>
                <p className="text-xl font-black mt-0.5">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Quick Links */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <h2 className="font-bold text-sm mb-3 text-muted-foreground uppercase tracking-wide">روابط سريعة</h2>
            <div className="space-y-2">
              {quickLinks.map(link => (
                <Link key={link.href} href={link.href} className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl hover:border-primary/40 hover:bg-background transition-all">
                  <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0">
                    <link.icon size={16} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{link.label}</p>
                    <p className="text-xs text-muted-foreground">{link.sub}</p>
                  </div>
                  <ChevronRight size={14} className="text-muted-foreground" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Logout */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl font-semibold text-sm hover:bg-destructive/20 transition-colors"
            >
              <LogOut size={15} />
              تسجيل الخروج
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
