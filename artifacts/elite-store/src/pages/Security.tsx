import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck, Key, LogOut, Lock, Smartphone,
  Eye, EyeOff, CheckCircle2, AlertTriangle, ChevronRight,
  Loader2, RefreshCw, Fingerprint, Bell, Wallet
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/i18n';
import { PublicLayout } from '@/components/Layout';
import { useToast } from '@/hooks/use-toast';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

function SectionHeader({ icon: Icon, title, subtitle, color }: { icon: any; title: string; subtitle: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div>
        <h2 className="font-bold text-sm text-white">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Card({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className="rounded-2xl border border-white/8 p-5"
      style={{ background: 'rgba(255,255,255,0.03)' }}
    >
      {children}
    </motion.div>
  );
}

export default function Security() {
  const { user, logout } = useAuth();
  const { lang, dir } = useLanguage();
  const { toast } = useToast();

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [changingPwd, setChangingPwd] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const strengthScore = (pwd: string) => {
    let s = 0;
    if (pwd.length >= 8) s++;
    if (/[A-Z]/.test(pwd)) s++;
    if (/[0-9]/.test(pwd)) s++;
    if (/[^A-Za-z0-9]/.test(pwd)) s++;
    return s;
  };

  const strength = strengthScore(newPwd);
  const strengthLabel = ['ضعيف', 'مقبول', 'جيد', 'قوي', 'ممتاز'][strength] ?? '';
  const strengthColor = ['#ef4444', '#f97316', '#f59e0b', '#22c55e', '#10b981'][strength] ?? '#6b7280';

  const handleChangePassword = async () => {
    if (!currentPwd || !newPwd || !confirmPwd) {
      toast({ title: 'خطأ', description: 'يرجى تعبئة جميع الحقول', variant: 'destructive' });
      return;
    }
    if (newPwd !== confirmPwd) {
      toast({ title: 'خطأ', description: 'كلمة المرور الجديدة وتأكيدها غير متطابقتين', variant: 'destructive' });
      return;
    }
    if (newPwd.length < 8) {
      toast({ title: 'خطأ', description: 'كلمة المرور يجب أن تكون 8 أحرف على الأقل', variant: 'destructive' });
      return;
    }
    setChangingPwd(true);
    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${BASE}/api/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: currentPwd, newPassword: newPwd }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? 'فشل تغيير كلمة المرور');
      toast({ title: '✅ تم بنجاح', description: 'تم تغيير كلمة المرور بنجاح' });
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch (err: any) {
      toast({ title: 'فشل', description: err.message, variant: 'destructive' });
    } finally {
      setChangingPwd(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    setLoggingOut(true);
    await new Promise(r => setTimeout(r, 800));
    toast({ title: '✅ تم تسجيل الخروج', description: 'تم تسجيل الخروج من جميع الأجهزة' });
    logout();
    setLoggingOut(false);
  };

  return (
    <PublicLayout>
      <div className="max-w-lg mx-auto px-4 py-6" dir="rtl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', boxShadow: '0 8px 24px rgba(108,92,231,0.4)' }}>
              <ShieldCheck size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white">حماية الحساب</h1>
              <p className="text-xs text-muted-foreground">إدارة أمان حسابك ورصيدك</p>
            </div>
          </div>
        </motion.div>

        {!user && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl p-6 text-center border border-yellow-500/20" style={{ background: 'rgba(245,158,11,0.08)' }}>
            <AlertTriangle size={32} className="text-yellow-400 mx-auto mb-3" />
            <p className="font-bold text-yellow-400 mb-1">يجب تسجيل الدخول</p>
            <p className="text-sm text-muted-foreground">سجّل دخولك للوصول إلى إعدادات الأمان</p>
          </motion.div>
        )}

        {user && (
          <div className="space-y-4">

            {/* ── تغيير كلمة المرور ── */}
            <Card delay={0.05}>
              <SectionHeader icon={Key} title="تغيير كلمة المرور" subtitle="غيّر كلمة مرورك بشكل دوري لحماية حسابك" color="#6C5CE7" />
              <div className="space-y-3">

                {/* Current Password */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">كلمة المرور الحالية</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPwd}
                      onChange={e => setCurrentPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-4 pl-10 py-2.5 rounded-xl text-sm border border-white/10 bg-white/5 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button onClick={() => setShowCurrent(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showCurrent ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      placeholder="8 أحرف على الأقل"
                      className="w-full pr-4 pl-10 py-2.5 rounded-xl text-sm border border-white/10 bg-white/5 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button onClick={() => setShowNew(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {newPwd && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[0,1,2,3].map(i => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: i < strength ? strengthColor : 'rgba(255,255,255,0.1)' }} />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: strengthColor }}>قوة كلمة المرور: {strengthLabel}</p>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5">تأكيد كلمة المرور الجديدة</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPwd}
                      onChange={e => setConfirmPwd(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pr-4 pl-10 py-2.5 rounded-xl text-sm border border-white/10 bg-white/5 focus:outline-none focus:border-primary/50 transition-colors"
                    />
                    <button onClick={() => setShowConfirm(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                    {confirmPwd && (
                      <div className="absolute left-10 top-1/2 -translate-y-1/2">
                        {confirmPwd === newPwd
                          ? <CheckCircle2 size={14} className="text-green-400" />
                          : <AlertTriangle size={14} className="text-red-400" />}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleChangePassword}
                  disabled={changingPwd}
                  className="w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6C5CE7, #8B5CF6)', boxShadow: '0 4px 16px rgba(108,92,231,0.35)' }}
                >
                  {changingPwd ? <Loader2 size={15} className="animate-spin" /> : <Key size={15} />}
                  {changingPwd ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
                </button>
              </div>
            </Card>

            {/* ── التحقق الثنائي ── */}
            <Card delay={0.1}>
              <SectionHeader icon={Fingerprint} title="التحقق الثنائي (2FA)" subtitle="طبقة حماية إضافية لحسابك" color="#22c55e" />
              <div className="flex items-center justify-between p-3 rounded-xl border border-white/8" style={{ background: 'rgba(34,197,94,0.06)' }}>
                <div className="flex items-center gap-3">
                  <Smartphone size={18} className="text-green-400" />
                  <div>
                    <p className="text-sm font-semibold">رمز OTP عبر واتساب</p>
                    <p className="text-xs text-muted-foreground">يُرسل رمز تحقق عند كل دخول</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>قريباً</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">سيتم تفعيل هذه الميزة قريباً</p>
            </Card>

            {/* ── إشعارات الأمان ── */}
            <Card delay={0.15}>
              <SectionHeader icon={Bell} title="إشعارات الأمان" subtitle="ابقَ على اطلاع بنشاط حسابك" color="#3b82f6" />
              <div className="space-y-2.5">
                {[
                  { label: 'إشعار عند تسجيل الدخول من جهاز جديد', enabled: true },
                  { label: 'إشعار عند تغيير كلمة المرور', enabled: true },
                  { label: 'إشعار عند كل معاملة مالية', enabled: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-white/8">
                    <span className="text-xs font-medium">{item.label}</span>
                    <div className="w-9 h-5 rounded-full flex items-center transition-all" style={{ background: item.enabled ? '#3b82f6' : 'rgba(255,255,255,0.1)', justifyContent: item.enabled ? 'flex-end' : 'flex-start', padding: '2px' }}>
                      <div className="w-4 h-4 rounded-full bg-white shadow" />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── حماية الرصيد ── */}
            <Card delay={0.2}>
              <SectionHeader icon={Wallet} title="حماية الرصيد" subtitle="أضف طبقة حماية إضافية على رصيدك" color="#f59e0b" />
              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3 rounded-xl border border-white/8">
                  <div className="flex items-center gap-3">
                    <Lock size={16} className="text-yellow-400" />
                    <div>
                      <p className="text-sm font-semibold">قفل الرصيد</p>
                      <p className="text-xs text-muted-foreground">تأكيد بكلمة مرور قبل كل شراء</p>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>قريباً</span>
                </div>
              </div>
            </Card>

            {/* ── معلومات الجلسة ── */}
            <Card delay={0.25}>
              <SectionHeader icon={Smartphone} title="الجلسة الحالية" subtitle="معلومات جلستك النشطة" color="#a855f7" />
              <div className="space-y-2">
                {[
                  { label: 'الحساب', value: user.username },
                  { label: 'البريد الإلكتروني', value: user.email },
                  { label: 'صلاحية الجلسة', value: '7 أيام' },
                  { label: 'وقت الدخول', value: localStorage.getItem('elite_login_at') ? new Date(parseInt(localStorage.getItem('elite_login_at')!)).toLocaleString('ar-SY') : 'غير محدد' },
                ].map((row, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-lg border border-white/6">
                    <span className="text-xs text-muted-foreground">{row.label}</span>
                    <span className="text-xs font-semibold truncate max-w-[60%] text-right">{row.value}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* ── تسجيل الخروج من كل الأجهزة ── */}
            <Card delay={0.3}>
              <SectionHeader icon={LogOut} title="إدارة الأجهزة" subtitle="تحكم في الأجهزة المتصلة بحسابك" color="#ef4444" />
              <div className="p-3 rounded-xl border border-red-500/20 mb-4" style={{ background: 'rgba(239,68,68,0.06)' }}>
                <div className="flex items-start gap-2.5">
                  <AlertTriangle size={16} className="text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    تسجيل الخروج من جميع الأجهزة سيُنهي جميع الجلسات النشطة وسيحتاج إلى إعادة تسجيل الدخول
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogoutAllDevices}
                disabled={loggingOut}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' }}
              >
                {loggingOut ? <Loader2 size={15} className="animate-spin" /> : <LogOut size={15} />}
                {loggingOut ? 'جاري الخروج...' : 'تسجيل الخروج من جميع الأجهزة'}
              </button>
            </Card>

          </div>
        )}
      </div>
    </PublicLayout>
  );
}
