import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/Layout';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { useAuth } from '@/hooks/use-auth';
import { useGetWallet, useGetOrders } from '@workspace/api-client-react';
import { User, Mail, Wallet, Package, Star, Shield, Copy, CheckCircle, LogOut, ChevronRight, Save, Lock, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Link } from 'wouter';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';
const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 } };

async function apiPatch(path: string, body: unknown) {
  const token = localStorage.getItem('elite_token');
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || data?.error || 'Request failed');
  return data;
}

async function apiPost(path: string, body: unknown) {
  const token = localStorage.getItem('elite_token');
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new Error(data?.message || data?.error || 'Request failed');
  return data;
}

export default function Profile() {
  const { user, logout } = useAuth();
  const { data: wallet } = useGetWallet();
  const { data: ordersData } = useGetOrders({ limit: 100, page: 1 });
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [profile, setProfile] = useState({ username: user?.username ?? '', email: user?.email ?? '' });
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

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

  const saveProfile = async () => {
    if (!profile.username.trim() || !profile.email.trim()) {
      toast({ title: 'بيانات ناقصة', description: 'الاسم والبريد مطلوبان', variant: 'destructive' });
      return;
    }
    try {
      setSavingProfile(true);
      await apiPatch('/api/auth/profile', profile);
      toast({ title: 'تم الحفظ', description: 'تم تحديث بيانات الحساب. سيتم تحديث الواجهة الآن.' });
      window.location.reload();
    } catch (err: any) {
      toast({ title: 'فشل التحديث', description: err.message, variant: 'destructive' });
    } finally {
      setSavingProfile(false);
    }
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast({ title: 'كلمات السر غير متطابقة', description: 'أعد تأكيد كلمة السر الجديدة', variant: 'destructive' });
      return;
    }
    try {
      setSavingPassword(true);
      await apiPost('/api/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      toast({ title: 'تم تغيير كلمة السر', description: 'استخدم كلمة السر الجديدة في تسجيل الدخول القادم' });
    } catch (err: any) {
      toast({ title: 'فشل تغيير كلمة السر', description: err.message, variant: 'destructive' });
    } finally {
      setSavingPassword(false);
    }
  };

  const initials = (user?.username ?? 'U').slice(0, 2).toUpperCase();

  const stats = [
    { label: 'الرصيد الحالي', value: `$${balance.toFixed(2)}`, sub: `${(balance * 13000).toLocaleString()} ل.س`, color: 'success', icon: Wallet },
    { label: 'إجمالي الطلبات', value: String(ordersData?.total ?? 0), sub: `${completed} مكتمل`, color: 'primary', icon: Package },
    { label: 'طلبات مكتملة', value: String(completed), sub: `نسبة النجاح ${ordersData?.total ? Math.round(completed / (ordersData.total || 1) * 100) : 0}%`, color: 'secondary', icon: Star },
    { label: 'طلبات فاشلة', value: String(failed), sub: 'يتم إرجاع المبلغ تلقائياً', color: 'destructive', icon: Shield },
  ];

  const quickLinks = [
    { href: '/wallet', label: 'المحفظة والرصيد', sub: 'إيداع وسجل المعاملات', icon: Wallet },
    { href: '/orders', label: 'طلباتي', sub: 'متابعة حالة الطلبات', icon: Package },
    { href: '/deposit', label: 'إيداع رصيد', sub: 'شحن المحفظة', icon: Wallet },
  ];

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="max-w-3xl space-y-6" dir="rtl">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-black text-white shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="font-heading text-xl font-bold">{user?.username}</h1>
                  {user?.role === 'admin' && <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full border border-primary/30">Admin</span>}
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

          <motion.div initial="initial" animate="animate" className="grid grid-cols-2 gap-3">
            {stats.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} transition={{ delay: i * 0.05 }} className="bg-card border border-border rounded-2xl p-4">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center mb-3">
                  <s.icon size={16} className="text-primary" />
                </div>
                <p className="text-muted-foreground text-xs">{s.label}</p>
                <p className="text-xl font-black mt-0.5">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.sub}</p>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h2 className="font-heading font-bold flex items-center gap-2"><User size={18} className="text-primary" /> إعدادات الحساب</h2>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">اسم المستخدم</label>
                <input value={profile.username} onChange={e => setProfile(p => ({ ...p, username: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary/50" />
              </div>
              <div>
                <label className="block text-sm text-muted-foreground mb-2">البريد الإلكتروني</label>
                <input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary/50" />
              </div>
              <button onClick={saveProfile} disabled={savingProfile} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-bold disabled:opacity-50">
                {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                حفظ التغييرات
              </button>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5 space-y-4">
              <h2 className="font-heading font-bold flex items-center gap-2"><Lock size={18} className="text-primary" /> تغيير كلمة السر</h2>
              <input type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} placeholder="كلمة السر الحالية" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary/50" />
              <input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} placeholder="كلمة السر الجديدة" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary/50" />
              <input type="password" value={passwords.confirmPassword} onChange={e => setPasswords(p => ({ ...p, confirmPassword: e.target.value }))} placeholder="تأكيد كلمة السر الجديدة" className="w-full px-4 py-3 bg-background border border-border rounded-xl outline-none focus:border-primary/50" />
              <button onClick={changePassword} disabled={savingPassword || !passwords.currentPassword || !passwords.newPassword} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-secondary text-white rounded-xl font-bold disabled:opacity-50">
                {savingPassword ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
                تحديث كلمة السر
              </button>
            </motion.div>
          </div>

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
                  <ChevronRight size={14} className="text-muted-foreground rotate-180" />
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
            <button onClick={logout} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl font-semibold text-sm hover:bg-destructive/20 transition-colors">
              <LogOut size={15} />
              تسجيل الخروج
            </button>
          </motion.div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}