import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/i18n';
import { Loader2, Mail, Lock, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showAdminHint, setShowAdminHint] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginMutation.mutateAsync({ data: { email, password } }) as any;
      login(result.token, result.user);
      navigate(result.user?.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? 'بيانات خاطئة أو حساب غير موجود';
      toast({ title: 'فشل تسجيل الدخول', description: msg, variant: 'destructive' });
    }
  };

  const quickFill = (e: string, p: string) => {
    setEmail(e);
    setPassword(p);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir={dir}>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-black">E</span>
            </div>
            <span className="font-heading font-bold text-xl">ELITE STORE</span>
          </Link>
          <h1 className="font-heading text-2xl font-bold">{t('login')}</h1>
          <p className="text-muted-foreground text-sm mt-2">أهلاً بك مجدداً</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">البريد الإلكتروني أو اسم المستخدم</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com أو اسم المستخدم"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors"
                  autoComplete="current-password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 disabled:opacity-50"
            >
              {loginMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
              {t('login')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">{t('register')}</Link>
            </p>
          </div>

          {/* Quick login hints */}
          <div className="mt-4 space-y-2">
            {/* Demo user */}
            <button
              type="button"
              onClick={() => quickFill('user@elitestore.com', 'user123')}
              className="w-full p-3 bg-background rounded-xl border border-border text-xs text-right hover:border-primary/40 transition-colors"
              dir="rtl"
            >
              <span className="text-muted-foreground">🔑 حساب تجريبي: </span>
              <span className="font-mono text-foreground">user@elitestore.com / user123</span>
            </button>

            {/* Admin toggle */}
            <button
              type="button"
              onClick={() => setShowAdminHint(v => !v)}
              className="w-full p-3 bg-background rounded-xl border border-border text-xs text-right hover:border-primary/40 transition-colors flex items-center justify-between"
              dir="rtl"
            >
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Shield size={12} className="text-primary" />
                دخول لوحة الأدمن
              </span>
              <span className="text-primary text-xs">{showAdminHint ? 'إخفاء ▲' : 'عرض ▼'}</span>
            </button>

            {showAdminHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="overflow-hidden"
              >
                <div
                  className="p-3 rounded-xl border text-xs space-y-2"
                  style={{ background: 'rgba(108,92,231,0.08)', borderColor: 'rgba(108,92,231,0.3)' }}
                  dir="rtl"
                >
                  <p className="text-purple-300 font-bold">🛡️ بيانات حساب الأدمن:</p>
                  <div className="space-y-1 text-gray-300">
                    <p>اسم المستخدم: <span className="font-mono text-white">ZEAN.23</span></p>
                    <p>كلمة المرور: <span className="font-mono text-white">ZEAN333ZEAN#</span></p>
                  </div>
                  <button
                    type="button"
                    onClick={() => quickFill('ZEAN.23', 'ZEAN333ZEAN#')}
                    className="w-full py-1.5 rounded-lg text-xs font-bold text-white transition-all hover:opacity-90 mt-1"
                    style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}
                  >
                    ملء البيانات تلقائياً
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
