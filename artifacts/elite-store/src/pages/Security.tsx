import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ShieldOff, LogOut, Clock, Key, User,
  AlertTriangle, CheckCircle2, RefreshCw, Lock, Smartphone,
  Eye, EyeOff, ChevronRight, Wifi, WifiOff
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/i18n';
import { PublicLayout } from '@/components/Layout';

function SecurityRow({
  icon: Icon,
  label,
  value,
  status,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  status: 'ok' | 'warn' | 'bad';
  color: string;
}) {
  const statusColor = status === 'ok' ? '#22c55e' : status === 'warn' ? '#f59e0b' : '#ef4444';
  const StatusIcon = status === 'ok' ? CheckCircle2 : status === 'warn' ? AlertTriangle : ShieldOff;

  return (
    <div
      className="flex items-center gap-3 px-4 py-3.5 rounded-2xl border"
      style={{
        background: 'rgba(255,255,255,0.03)',
        borderColor: 'rgba(255,255,255,0.07)',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${color}18` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold truncate mt-0.5">{value}</p>
      </div>
      <StatusIcon size={16} style={{ color: statusColor }} />
    </div>
  );
}

export default function Security() {
  const { user, logout, token } = useAuth();
  const { lang, dir } = useLanguage();
  const [, navigate] = useLocation();
  const [tokenVisible, setTokenVisible] = useState(false);
  const [sessionAge, setSessionAge] = useState('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loggingOut, setLoggingOut] = useState(false);

  const ar = lang === 'ar';

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const storedAt = localStorage.getItem('elite_login_at');
    if (storedAt) {
      const diff = Math.floor((Date.now() - parseInt(storedAt)) / 1000 / 60);
      if (diff < 60) setSessionAge(ar ? `${diff} دقيقة` : `${diff} min`);
      else if (diff < 1440) setSessionAge(ar ? `${Math.floor(diff / 60)} ساعة` : `${Math.floor(diff / 60)}h`);
      else setSessionAge(ar ? `${Math.floor(diff / 1440)} يوم` : `${Math.floor(diff / 1440)}d`);
    } else {
      setSessionAge(ar ? 'غير معروف' : 'Unknown');
    }
  }, [ar]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await new Promise(r => setTimeout(r, 600));
    logout();
    navigate('/login');
  };

  const tokenPreview = token
    ? tokenVisible
      ? token
      : `${token.slice(0, 8)}${'•'.repeat(20)}${token.slice(-4)}`
    : '—';

  const isAuthenticated = !!user && !!token;

  return (
    <PublicLayout>
      <div className="max-w-lg mx-auto px-4 pt-4 pb-32" dir={dir}>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-xl"
            style={{
              background: isAuthenticated
                ? 'linear-gradient(135deg, #065f46, #059669)'
                : 'linear-gradient(135deg, #7f1d1d, #dc2626)',
              boxShadow: isAuthenticated
                ? '0 8px 32px rgba(5,150,105,0.4)'
                : '0 8px 32px rgba(220,38,38,0.4)',
            }}
          >
            {isAuthenticated
              ? <ShieldCheck size={28} color="#fff" />
              : <ShieldOff size={28} color="#fff" />
            }
          </div>
          <h1 className="text-xl font-black">
            {ar ? 'مركز الأمان' : 'Security Center'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {isAuthenticated
              ? ar ? 'حسابك محمي ونشط' : 'Your account is protected and active'
              : ar ? 'يجب تسجيل الدخول للوصول' : 'Login required to access'}
          </p>
        </motion.div>

        {/* Session Status Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-4 mb-4 flex items-center gap-3"
          style={{
            background: isAuthenticated
              ? 'linear-gradient(135deg, rgba(5,150,105,0.15), rgba(16,185,129,0.08))'
              : 'linear-gradient(135deg, rgba(220,38,38,0.15), rgba(239,68,68,0.08))',
            border: `1px solid ${isAuthenticated ? 'rgba(5,150,105,0.3)' : 'rgba(220,38,38,0.3)'}`,
          }}
        >
          {isAuthenticated
            ? <CheckCircle2 size={20} color="#10b981" />
            : <AlertTriangle size={20} color="#ef4444" />
          }
          <div>
            <p className="text-sm font-bold" style={{ color: isAuthenticated ? '#10b981' : '#ef4444' }}>
              {isAuthenticated
                ? ar ? 'الجلسة نشطة وآمنة' : 'Session Active & Secure'
                : ar ? 'لا توجد جلسة نشطة' : 'No Active Session'}
            </p>
            <p className="text-xs text-muted-foreground">
              {isAuthenticated
                ? ar ? 'تم التحقق من هويتك بنجاح' : 'Identity verified successfully'
                : ar ? 'سجّل دخولك للاستفادة من الخدمات' : 'Sign in to access services'}
            </p>
          </div>
          <div
            className="mr-auto w-2 h-2 rounded-full shrink-0 animate-pulse"
            style={{ background: isAuthenticated ? '#10b981' : '#ef4444' }}
          />
        </motion.div>

        {/* Security Details */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-2 mb-4"
        >
          <SecurityRow
            icon={User}
            label={ar ? 'المستخدم' : 'Account'}
            value={user?.username ?? (ar ? 'غير مسجل' : 'Not logged in')}
            status={user ? 'ok' : 'bad'}
            color="#6C5CE7"
          />
          <SecurityRow
            icon={Key}
            label={ar ? 'التوكن' : 'Auth Token'}
            value={user ? (ar ? 'نشط ومحمي' : 'Active & Secure') : (ar ? 'غير موجود' : 'Not present')}
            status={token ? 'ok' : 'bad'}
            color="#f59e0b"
          />
          <SecurityRow
            icon={Clock}
            label={ar ? 'مدة الجلسة' : 'Session Age'}
            value={isAuthenticated ? sessionAge : '—'}
            status={isAuthenticated ? 'ok' : 'warn'}
            color="#22c55e"
          />
          <SecurityRow
            icon={Lock}
            label={ar ? 'نوع الحساب' : 'Account Role'}
            value={user?.role === 'admin' ? (ar ? 'مشرف' : 'Admin') : user ? (ar ? 'مستخدم' : 'User') : '—'}
            status={user ? 'ok' : 'bad'}
            color="#3b82f6"
          />
          <SecurityRow
            icon={isOnline ? Wifi : WifiOff}
            label={ar ? 'حالة الشبكة' : 'Network'}
            value={isOnline ? (ar ? 'متصل بالإنترنت' : 'Connected') : (ar ? 'غير متصل' : 'Offline')}
            status={isOnline ? 'ok' : 'bad'}
            color={isOnline ? '#22c55e' : '#ef4444'}
          />
          <SecurityRow
            icon={Smartphone}
            label={ar ? 'تخزين الجلسة' : 'Session Storage'}
            value={ar ? 'محلي مشفّر' : 'Local (Encrypted)'}
            status="ok"
            color="#8b5cf6"
          />
        </motion.div>

        {/* Token Inspector */}
        {isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
            className="rounded-2xl p-4 mb-4"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                {ar ? 'مفتاح الجلسة' : 'Session Token'}
              </span>
              <button
                onClick={() => setTokenVisible(v => !v)}
                className="flex items-center gap-1.5 text-xs text-primary hover:underline"
              >
                {tokenVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                {tokenVisible ? (ar ? 'إخفاء' : 'Hide') : (ar ? 'إظهار' : 'Show')}
              </button>
            </div>
            <code
              className="block text-[11px] font-mono break-all leading-relaxed"
              style={{ color: '#a29bfe' }}
            >
              {tokenPreview}
            </code>
          </motion.div>
        )}

        {/* Protected Routes Info */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
          className="rounded-2xl p-4 mb-4"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            {ar ? 'المسارات المحمية' : 'Protected Routes'}
          </p>
          {[
            { path: '/wallet', label: ar ? 'المحفظة' : 'Wallet', protected: true },
            { path: '/orders', label: ar ? 'الطلبات' : 'Orders', protected: true },
            { path: '/profile', label: ar ? 'الملف الشخصي' : 'Profile', protected: true },
            { path: '/deposit', label: ar ? 'الإيداع' : 'Deposit', protected: true },
            { path: '/admin', label: ar ? 'لوحة الإدارة' : 'Admin Panel', protected: true },
          ].map(route => (
            <div key={route.path} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-sm font-mono text-muted-foreground">{route.path}</span>
              <div className="flex items-center gap-1.5">
                <Lock size={11} color={isAuthenticated ? '#22c55e' : '#ef4444'} />
                <span className="text-xs" style={{ color: isAuthenticated ? '#22c55e' : '#ef4444' }}>
                  {isAuthenticated ? (ar ? 'مسموح' : 'Allowed') : (ar ? 'محمي' : 'Blocked')}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="space-y-3"
        >
          {isAuthenticated ? (
            <>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm transition-all active:scale-95"
                style={{
                  background: loggingOut
                    ? 'rgba(239,68,68,0.1)'
                    : 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: loggingOut ? '#ef4444' : '#fff',
                  border: loggingOut ? '1px solid rgba(239,68,68,0.3)' : 'none',
                  boxShadow: loggingOut ? 'none' : '0 4px 20px rgba(239,68,68,0.35)',
                }}
              >
                {loggingOut
                  ? <RefreshCw size={16} className="animate-spin" />
                  : <LogOut size={16} />
                }
                {loggingOut
                  ? (ar ? 'جاري تسجيل الخروج...' : 'Signing out...')
                  : (ar ? 'تسجيل الخروج من الجلسة' : 'Sign Out of Session')}
              </button>
              <p className="text-center text-xs text-muted-foreground">
                {ar
                  ? 'سيتم حذف بيانات الجلسة من الجهاز'
                  : 'Session data will be cleared from device'}
              </p>
            </>
          ) : (
            <Link
              href="/login"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 rounded-2xl font-bold text-sm text-white transition-all active:scale-95"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)',
                boxShadow: '0 4px 20px rgba(108,92,231,0.4)',
              }}
            >
              <ShieldCheck size={16} />
              {ar ? 'تسجيل الدخول للحماية' : 'Sign In to Secure Account'}
              <ChevronRight size={14} />
            </Link>
          )}
        </motion.div>

      </div>
    </PublicLayout>
  );
}
