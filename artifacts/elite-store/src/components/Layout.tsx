import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/i18n';
import { useCurrency } from '@/hooks/use-currency';
import { useGetNotifications } from '@workspace/api-client-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CurrencySwitcher } from '@/components/CurrencySwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, ShoppingBag, Package, Wallet, Bell, User, Settings,
  ChevronDown, Menu, X, Shield, BarChart2, Users, CreditCard,
  LogOut, Layers, ChevronRight
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t, dir } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: notifications } = useGetNotifications({ query: { enabled: !!user } });
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow">
                <span className="text-white font-black text-sm">E</span>
              </div>
              <span className="font-bold text-lg tracking-tight font-heading">ELITE STORE</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className={`text-sm font-medium transition-colors ${location === '/' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{t('home')}</Link>
              <Link href="/products" className={`text-sm font-medium transition-colors ${location.startsWith('/products') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{t('products')}</Link>
            </nav>

            <div className="flex items-center gap-3">
              <LanguageSwitcher />
              <CurrencySwitcher />

              {user ? (
                <>
                  <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-card transition-colors">
                    <Bell size={18} className="text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                    )}
                  </Link>
                  <div className="relative">
                    <button onClick={() => setUserMenuOpen(!userMenuOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-card transition-colors">
                      <div className="w-7 h-7 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
                        <span className="text-primary text-xs font-bold">{user.username[0].toUpperCase()}</span>
                      </div>
                      <span className="hidden sm:block text-sm font-medium">{user.username}</span>
                      <ChevronDown size={14} className="text-muted-foreground" />
                    </button>
                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div initial={{ opacity: 0, y: -8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: 0.95 }} transition={{ duration: 0.15 }} className={`absolute ${dir === 'rtl' ? 'left-0' : 'right-0'} top-full mt-2 w-52 bg-card border border-border rounded-xl shadow-xl overflow-hidden z-50`}>
                          <div className="p-3 border-b border-border">
                            <p className="text-sm font-semibold">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                          <div className="p-2">
                            <Link href="/dashboard" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors">
                              <Home size={14} />{t('dashboard')}
                            </Link>
                            <Link href="/wallet" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors">
                              <Wallet size={14} />{t('wallet')}
                            </Link>
                            <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors">
                              <Package size={14} />{t('orders')}
                            </Link>
                            {user.role === 'admin' && (
                              <Link href="/admin" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors text-primary">
                                <Shield size={14} />{t('admin')}
                              </Link>
                            )}
                            <button onClick={() => { logout(); setUserMenuOpen(false); }} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-destructive/10 text-destructive transition-colors mt-1">
                              <LogOut size={14} />{t('logout')}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="text-sm font-medium px-3 py-1.5 rounded-lg text-muted-foreground hover:text-foreground transition-colors">{t('login')}</Link>
                  <Link href="/register" className="text-sm font-medium px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30">{t('register')}</Link>
                </div>
              )}

              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-lg hover:bg-card transition-colors">
                {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
            </div>
          </div>
        </div>
      </header>
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="md:hidden border-b border-border bg-card overflow-hidden">
            <div className="px-4 py-3 space-y-1">
              <Link href="/" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-background">{t('home')}</Link>
              <Link href="/products" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-2 text-sm rounded-lg hover:bg-background">{t('products')}</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <main>{children}</main>
    </div>
  );
}

export function DashboardLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t, dir } = useLanguage();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { href: '/dashboard', icon: Home, label: t('dashboard') },
    { href: '/products', icon: ShoppingBag, label: t('products') },
    { href: '/orders', icon: Package, label: t('orders') },
    { href: '/wallet', icon: Wallet, label: t('wallet') },
    { href: '/deposit', icon: CreditCard, label: t('deposit') },
    { href: '/notifications', icon: Bell, label: t('notifications') },
  ];

  const adminNavItems = [
    { href: '/admin', icon: BarChart2, label: 'Analytics' },
    { href: '/admin/orders', icon: Package, label: 'All Orders' },
    { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/products', icon: Layers, label: 'Products' },
  ];

  const isAdmin = user?.role === 'admin';

  return (
    <div className="min-h-screen bg-background text-foreground flex" dir={dir}>
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
        )}
      </AnimatePresence>

      <aside className={`fixed inset-y-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-64 bg-card border-${dir === 'rtl' ? 'l' : 'r'} border-border z-50 flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : dir === 'rtl' ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-5 border-b border-border">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <span className="text-white font-black text-sm">E</span>
            </div>
            <span className="font-bold text-lg tracking-tight font-heading">ELITE STORE</span>
          </Link>
        </div>

        {user && (
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                <span className="text-primary text-sm font-bold">{user.username[0].toUpperCase()}</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{user.username}</p>
                <p className="text-xs text-secondary font-medium">${parseFloat(user.balance?.toString() ?? '0').toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary/15 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}>
                <Icon size={16} />
                {item.label}
                {active && <ChevronRight size={14} className={`${dir === 'rtl' ? 'mr-auto rotate-180' : 'ml-auto'} text-primary`} />}
              </Link>
            );
          })}

          {isAdmin && (
            <>
              <div className="pt-3 pb-1 px-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Admin</span>
              </div>
              {adminNavItems.map(item => {
                const Icon = item.icon;
                const active = location === item.href;
                return (
                  <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-primary/15 text-primary border border-primary/20' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}>
                    <Icon size={16} />
                    {item.label}
                  </Link>
                );
              })}
            </>
          )}
        </nav>

        <div className="p-3 border-t border-border space-y-1">
          <div className="flex items-center gap-2 px-3 py-2">
            <LanguageSwitcher />
            <CurrencySwitcher />
          </div>
          <button onClick={logout} className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all">
            <LogOut size={16} />
            {t('logout')}
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between h-14 px-4">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-card transition-colors">
              <Menu size={18} />
            </button>
            <div className="flex-1" />
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
