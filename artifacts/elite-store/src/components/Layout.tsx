import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/i18n';
import { useGetNotifications } from '@workspace/api-client-react';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { CurrencySwitcher } from '@/components/CurrencySwitcher';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, ShoppingBag, Package, Wallet, Bell, User, Settings,
  ChevronDown, Menu, X, Shield, BarChart2, Users, CreditCard,
  LogOut, Layers, ChevronRight, MessageCircle, Users2, Coins
} from 'lucide-react';

const WHATSAPP_NUMBER = '963992718483';
const GROUP_LINK = 'https://chat.whatsapp.com/DmATlEZYLFgHbWuo4HOVay?mode=gi_t';

function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();

  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col items-start gap-2">
      <AnimatePresence>
        {open && (
          <>
            {/* Group Button */}
            <motion.a
              href={GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.8 }}
              transition={{ duration: 0.2, delay: 0.05 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-lg shadow-black/30 hover:scale-105 active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #128C7E, #075E54)' }}
            >
              <Users2 size={16} />
              {lang === 'ar' ? 'غروب الموقع' : 'Community Group'}
            </motion.a>

            {/* Support Button */}
            <motion.a
              href={`https://wa.me/${WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, x: -20, scale: 0.8 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl text-white text-sm font-bold shadow-lg shadow-black/30 hover:scale-105 active:scale-95 transition-transform"
              style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)' }}
            >
              <MessageCircle size={16} />
              {lang === 'ar' ? 'تواصل مع الدعم' : 'Support'}
            </motion.a>
          </>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.93 }}
        className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-black/40 transition-all"
        style={{
          background: open
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #25D366, #128C7E)',
          boxShadow: open ? '0 8px 24px rgba(239,68,68,0.4)' : '0 8px 24px rgba(37,211,102,0.4)',
        }}
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <X size={22} />
            </motion.div>
          ) : (
            <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}>
              <MessageCircle size={22} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}

interface LayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t, dir, lang } = useLanguage();
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
                  {/* Wallet Balance - visible on all sizes */}
                  <Link href="/wallet" className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-green-500/30 bg-green-500/10 hover:bg-green-500/15 transition-colors">
                    <Coins size={12} className="text-green-400 shrink-0" />
                    <span className="text-xs font-bold text-green-400">${parseFloat(user.balance?.toString() ?? '0').toFixed(2)}</span>
                  </Link>
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
                            <Link href="/profile" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors">
                              <User size={14} />{lang === 'ar' ? 'الملف الشخصي' : 'Profile'}
                            </Link>
                            <Link href="/wallet" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors">
                              <Wallet size={14} />{t('wallet')}
                            </Link>
                            <Link href="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors">
                              <Package size={14} />{t('orders')}
                            </Link>
                            <Link href="/support" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-lg hover:bg-background transition-colors">
                              <MessageCircle size={14} />{lang === 'ar' ? 'الدعم' : 'Support'}
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

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white font-black text-xs">E</span>
            </div>
            <span className="text-sm font-bold text-muted-foreground">ELITE STORE</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-muted-foreground">
            <Link href="/support" className="hover:text-foreground transition-colors">{lang === 'ar' ? 'الدعم' : 'Support'}</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">{lang === 'ar' ? 'الشروط' : 'Terms'}</Link>
            <Link href="/privacy" className="hover:text-foreground transition-colors">{lang === 'ar' ? 'الخصوصية' : 'Privacy'}</Link>
            <a href="https://wa.me/963992718483" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">WhatsApp</a>
          </div>
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} Elite Store. All rights reserved.</p>
        </div>
      </footer>

      <FloatingSupport />
    </div>
  );
}

export function DashboardLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t, dir, lang } = useLanguage();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: notifications } = useGetNotifications({ query: { enabled: !!user } });
  const unreadCount = (notifications || []).filter((n: any) => !n.isRead).length;

  const navItems = [
    { href: '/dashboard', icon: Home, label: t('dashboard') },
    { href: '/products', icon: ShoppingBag, label: t('products') },
    { href: '/orders', icon: Package, label: t('orders') },
    { href: '/wallet', icon: Wallet, label: t('wallet') },
    { href: '/deposit', icon: CreditCard, label: t('deposit') },
    { href: '/notifications', icon: Bell, label: t('notifications') },
    { href: '/profile', icon: User, label: lang === 'ar' ? 'الملف الشخصي' : 'Profile' },
    { href: '/support', icon: MessageCircle, label: lang === 'ar' ? 'الدعم' : 'Support' },
  ];

  const adminNavItems = [
    { href: '/admin', icon: BarChart2, label: 'Analytics' },
    { href: '/admin/orders', icon: Package, label: 'All Orders' },
    { href: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { href: '/admin/users', icon: Users, label: 'Users' },
    { href: '/admin/products', icon: Layers, label: 'Products' },
    { href: '/admin/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const isAdmin = user?.role === 'admin';

  const balanceSYP = user ? (parseFloat(user.balance?.toString() ?? '0') * 13000).toFixed(2) : '0.00';

  const mobileBottomNav = [
    { href: '/dashboard', icon: Shield, color: '#22c55e', label: lang === 'ar' ? 'حماية' : 'Security' },
    { href: '/wallet', icon: Wallet, color: '#f59e0b', label: lang === 'ar' ? 'محفظة' : 'Wallet' },
    { href: '/dashboard', icon: Home, color: '#3b82f6', label: lang === 'ar' ? 'الرئيسية' : 'Home', isCenter: true },
    { href: '/orders', icon: CreditCard, color: '#3b82f6', label: lang === 'ar' ? 'طلباتي' : 'Orders' },
    { href: '/products', icon: ShoppingBag, color: '#ef4444', label: lang === 'ar' ? 'المتجر' : 'Store' },
  ];

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
                <p className="text-xs text-secondary font-medium">{balanceSYP} ل.س</p>
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

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen pb-20 lg:pb-0">
        {/* Mobile Header */}
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/97 backdrop-blur-xl lg:hidden" style={{ backdropFilter: 'blur(20px)' }}>
          <div className="flex items-center justify-between h-14 px-3 gap-2" dir="rtl">
            {/* Right side: Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-md shadow-primary/40">
                <span className="text-white font-black text-sm">E</span>
              </div>
              <span className="font-bold text-sm tracking-tight font-heading hidden xs:block">ELITE STORE</span>
            </Link>

            {/* Left side: controls */}
            <div className="flex items-center gap-1.5 mr-auto">
              {/* Balance */}
              {user && (
                <Link href="/deposit"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-primary/30 bg-primary/10 hover:bg-primary/20 transition-colors"
                >
                  <span className="text-primary text-xs font-bold">+</span>
                  <span className="text-xs font-bold text-white">{balanceSYP}</span>
                  <span className="text-[10px] text-primary/80 font-medium">ل.س</span>
                </Link>
              )}

              {/* Bell */}
              <Link href="/notifications" className="relative p-2 rounded-xl hover:bg-card transition-colors">
                <Bell size={18} className="text-muted-foreground" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-destructive text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Badge */}
              {user && (
                <Link href="/profile">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg relative"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, #4f87ff, #1a3fa0)',
                      boxShadow: '0 0 0 2px rgba(59,130,246,0.4), 0 4px 12px rgba(30,58,138,0.5)',
                    }}>
                    <span className="text-white text-xs font-black">{user.username[0].toUpperCase()}</span>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-background"
                      style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }} />
                  </div>
                </Link>
              )}

              {/* Hamburger */}
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-card transition-colors">
                <Menu size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Desktop Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl hidden lg:block">
          <div className="flex items-center justify-between h-14 px-4">
            <div className="flex-1" />
            {user && (
              <div className="flex items-center gap-3">
                <Link href="/deposit" className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-green-500/40 bg-green-500/10 hover:bg-green-500/20 transition-colors">
                  <span className="text-green-400 text-xs font-bold">+</span>
                  <span className="text-xs font-bold text-white">{balanceSYP} ل.س</span>
                </Link>
                <Link href="/notifications" className="relative p-2 rounded-lg hover:bg-card transition-colors">
                  <Bell size={18} className="text-muted-foreground" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unreadCount > 9 ? '9+' : unreadCount}</span>
                  )}
                </Link>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden border-t border-border/50" style={{ background: 'rgba(10,10,20,0.97)', backdropFilter: 'blur(20px)' }}>
        <div className="flex items-end justify-around px-2 pb-2 pt-1">
          {mobileBottomNav.map((item, idx) => {
            const Icon = item.icon;
            const active = location === item.href || (item.href === '/dashboard' && location === '/dashboard');
            if (item.isCenter) {
              return (
                <Link key={idx} href={item.href} className="flex flex-col items-center -mt-5">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-transform active:scale-95"
                    style={{ background: 'linear-gradient(145deg, #1e3a8a, #3b82f6)', boxShadow: '0 -4px 20px rgba(59,130,246,0.5), 0 4px 15px rgba(0,0,0,0.5)' }}>
                    <Icon size={26} color="#fff" />
                  </div>
                  <span className="text-[10px] mt-1 font-medium" style={{ color: '#3b82f6' }}>{item.label}</span>
                </Link>
              );
            }
            return (
              <Link key={idx} href={item.href} className="flex flex-col items-center gap-1 py-1 px-2 rounded-xl transition-all active:scale-95">
                <Icon size={22} color={active ? item.color : '#6b7280'} />
                <span className="text-[10px] font-medium" style={{ color: active ? item.color : '#6b7280' }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <FloatingSupport />
    </div>
  );
}
