import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import { useLogin } from '@workspace/api-client-react';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/i18n';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { t, dir } = useLanguage();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await loginMutation.mutateAsync({ email, password }) as any;
      login(data.token, data.user);
      navigate('/dashboard');
    } catch (err: any) {
      const msg = err?.data?.message ?? 'Invalid credentials';
      toast({ title: 'Login failed', description: msg, variant: 'destructive' });
    }
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
          <p className="text-muted-foreground text-sm mt-2">Welcome back</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2">{t('email')}</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('password')}</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full pl-9 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:border-primary/50 transition-colors" />
              </div>
            </div>

            <button type="submit" disabled={loginMutation.isPending} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/30 disabled:opacity-50">
              {loginMutation.isPending ? <Loader2 size={18} className="animate-spin" /> : null}
              {t('login')}
            </button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              No account?{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">{t('register')}</Link>
            </p>
          </div>

          <div className="mt-4 p-3 bg-background rounded-xl border border-border text-xs text-muted-foreground space-y-1">
            <p className="font-medium text-foreground text-xs">Demo credentials:</p>
            <p>Admin: admin@elitestore.com / admin123</p>
            <p>User: user@elitestore.com / user123</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
