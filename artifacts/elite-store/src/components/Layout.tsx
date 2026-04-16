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
import { useSettings } from '@/hooks/use-settings';

const WHATSAPP_NUMBER = '963992718483';
const GROUP_LINK = 'https://chat.whatsapp.com/DmATlEZYLFgHbWuo4HOVay?mode=gi_t';

function FloatingSupport() {
  const [open, setOpen] = useState(false);
  const { lang } = useLanguage();

  return (
    <div className="fixed bottom-20 left-3 sm:bottom-6 sm:left-5 z-50 flex flex-col items-start gap-2">
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
  const { sypRate } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: notifications } = useGetNotifications({ query: { enabled: !!user } });
  const unreadCount = (notifications || []).filter(n => !n.isRead).length;
  const [location] = useLocation();
  const userBalanceSYP = user ? (parseFloat(user.balance?.toString() ?? '0') * sypRate).toFixed(0) : '0';

  return (
    <div className="min-h-screen bg-background text-foreground" dir={dir}>

      {/* Announcement ticker bar */}
      <div className="w-full overflow-hidden py-1.5" style={{ background: 'linear-gradient(90deg, #6C5CE7, #00CEC9, #6C5CE7)', backgroundSize: '200% 100%' }}>
        <div className="flex items-center">
          <div className="ticker-text flex items-center gap-8 text-white text-xs font-bold px-4">
            {['⚡ خدمة سريعة 24/7', '🔒 دفع آمن ومضمون', '💎 أفضل الأسعار في سوريا', '✅ تسليم فوري بعد التحقق', '🎮 شحن جميع الألعاب', '📱 خدمات سوشيال ميديا', '💳 شحن رصيد سيريتل وشام كاش', '🌟 Elite Store — المتجر الأول'].map((item, i) => (
              <span key={i} className="flex items-center gap-2 whitespace-nowrap">{item} <span className="opacity-50">•</span></span>
            ))}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-border backdrop-blur-xl" style={{ background: 'rgba(15,23,42,0.92)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-all group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', boxShadow: '0 4px 15px rgba(108,92,231,0.4)' }}>
                <span className="text-white font-black text-sm">E</span>
              </div>
              <div>
                <span className="font-black text-base tracking-tight" style={{ background: 'linear-gradient(90deg, #a29bfe, #00CEC9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ELITE STORE</span>
              </div>
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
                    <span className="text-xs font-bold text-green-400">{userBalanceSYP}</span>
                    <span className="text-[10px] text-green-400/80">ل.س</span>
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[90] md:hidden"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '100%' : '-100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} bottom-0 w-72 overflow-y-auto flex flex-col`}
              style={{ background: 'linear-gradient(180deg, #0d1627 0%, #0a1122 100%)', borderLeft: dir === 'rtl' ? 'none' : '1px solid rgba(108,92,231,0.2)', borderRight: dir === 'rtl' ? '1px solid rgba(108,92,231,0.2)' : 'none', boxShadow: dir === 'rtl' ? '-20px 0 60px rgba(0,0,0,0.7)' : '20px 0 60px rgba(0,0,0,0.7)' }}
              onClick={e => e.stopPropagation()}
            >
              {/* ── Header ── */}
              <div className="flex items-center justify-between p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', boxShadow: '0 4px 15px rgba(108,92,231,0.4)' }}>
                    <span className="text-white font-black text-sm">E</span>
                  </div>
                  <span className="font-black text-base" style={{ background: 'linear-gradient(90deg, #a29bfe, #00CEC9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ELITE STORE</span>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors">
                  <X size={16} className="text-muted-foreground" />
                </button>
              </div>

              {/* ── User / Auth ── */}
              {user ? (
                <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: 'rgba(108,92,231,0.12)', border: '1px solid rgba(108,92,231,0.2)' }}>
                    <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                      <span className="text-primary font-black text-base">{user.username[0].toUpperCase()}</span>
                    </div>
                    <div className="min-w-0 flex-1" dir="rtl">
                      <p className="font-bold text-sm truncate">{user.username}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Coins size={11} className="text-green-400" />
                        <span className="text-green-400 text-xs font-bold">{userBalanceSYP} ل.س</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 space-y-2" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} dir="rtl">
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90"
                    style={{ background: 'rgba(108,92,231,0.15)', border: '1px solid rgba(108,92,231,0.3)', color: '#a29bfe' }}>
                    {t('login')}
                  </Link>
                  <Link href="/register" onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)', boxShadow: '0 4px 15px rgba(108,92,231,0.3)' }}>
                    {t('register')}
                  </Link>
                </div>
              )}

              {/* ── Navigation ── */}
              <div className="p-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} dir="rtl">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{lang === 'ar' ? 'التنقل' : 'Navigation'}</p>
                <div className="space-y-0.5">
                  {[
                    { href: '/', label: lang === 'ar' ? 'الرئيسية' : 'Home', icon: '🏠' },
                    { href: '/products', label: lang === 'ar' ? 'جميع المنتجات' : 'All Products', icon: '🛍️' },
                    { href: '/support', label: lang === 'ar' ? 'الدعم الفني' : 'Support', icon: '💬' },
                    { href: '/terms', label: lang === 'ar' ? 'الشروط والأحكام' : 'Terms', icon: '📜' },
                  ].map(item => (
                    <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5 text-muted-foreground hover:text-foreground">
                      <span className="text-base w-6 text-center">{item.icon}</span>
                      {item.label}
                    </Link>
                  ))}
                  {user && <>
                    <Link href="/orders" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5 text-muted-foreground hover:text-foreground">
                      <span className="text-base w-6 text-center">📦</span>{lang === 'ar' ? 'طلباتي' : 'My Orders'}
                    </Link>
                    <Link href="/wallet" onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all hover:bg-white/5 text-muted-foreground hover:text-foreground">
                      <span className="text-base w-6 text-center">💳</span>{lang === 'ar' ? 'المحفظة والإيداع' : 'Wallet'}
                    </Link>
                  </>}
                </div>
              </div>

              {/* ── Categories ── */}
              <div className="p-4 flex-1" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }} dir="rtl">
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3 px-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{lang === 'ar' ? 'الأقسام' : 'Categories'}</p>
                <div className="space-y-2">
                  {[
                    { id: 'mobile_games', nameAr: 'ألعاب الهاتف', icon: '🎮', count: 45, color: '#8b5cf6', bg: 'rgba(139,92,246,0.1)', border: 'rgba(139,92,246,0.25)' },
                    { id: 'pc_games',     nameAr: 'ألعاب الكمبيوتر', icon: '🖥️', count: 23, color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', border: 'rgba(59,130,246,0.25)' },
                    { id: 'services',     nameAr: 'الخدمات الرقمية', icon: '⚡', count: 23, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.25)' },
                    { id: 'general',      nameAr: 'عام ومتنوع',      icon: '🛒', count: 18, color: '#f43f5e', bg: 'rgba(244,63,94,0.1)',  border: 'rgba(244,63,94,0.25)'  },
                    { id: 'gift_cards',   nameAr: 'بطاقات الهدايا',  icon: '🎁', count: 15, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.25)' },
                  ].map(cat => (
                    <Link
                      key={cat.id}
                      href={`/products?category=${cat.id}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 p-3 rounded-2xl transition-all hover:brightness-125 active:scale-[0.98]"
                      style={{ background: cat.bg, border: `1px solid ${cat.border}` }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: `${cat.color}22` }}>
                        {cat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-white">{cat.nameAr}</p>
                        <p className="text-xs mt-0.5" style={{ color: cat.color }}>{cat.count} منتج</p>
                      </div>
                      <ChevronRight size={14} className="rotate-180 shrink-0" style={{ color: cat.color }} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* ── Social + Logout ── */}
              <div className="p-4 space-y-3" dir="rtl">
                <div className="flex gap-2">
                  {[
                    { href: `https://wa.me/${WHATSAPP_NUMBER}`, label: 'واتساب',  color: '#25d366', icon: '💬' },
                    { href: 'https://t.me/elitestore_sy',        label: 'تيليغرام', color: '#2aabee', icon: '✈️' },
                    { href: GROUP_LINK,                           label: 'مجتمع',   color: '#128C7E', icon: '👥' },
                  ].map((s, i) => (
                    <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                      className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all hover:scale-105 active:scale-95"
                      style={{ background: `${s.color}15`, border: `1px solid ${s.color}30`, color: s.color }}>
                      <span className="text-base">{s.icon}</span>
                      {s.label}
                    </a>
                  ))}
                </div>
                {user && (
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 flex items-center justify-center gap-2"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444' }}>
                    <LogOut size={14} />
                    {t('logout')}
                  </button>
                )}
                <p className="text-[10px] text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>© {new Date().getFullYear()} Elite Store — جميع الحقوق محفوظة</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <main className="pb-24 lg:pb-0">{children}</main>

      {/* Footer */}
      <footer className="mt-16 pt-8 pb-4 px-4" style={{ background: 'linear-gradient(0deg, #080d1a, #0F172A)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="max-w-7xl mx-auto">
          {/* Top row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex flex-col items-center sm:items-start gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #6C5CE7, #a29bfe)' }}>
                  <span className="text-white font-black text-sm">E</span>
                </div>
                <span className="font-black text-base" style={{ background: 'linear-gradient(90deg, #a29bfe, #00CEC9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ELITE STORE</span>
              </div>
              <p className="text-xs text-gray-500 text-center sm:text-right max-w-xs" dir="rtl">منصة بيع خدمات رقمية وشحن ألعاب — متوفرون 24/7</p>
            </div>

            <div className="flex items-center gap-3">
              {[
                { href: 'https://wa.me/963992718483', label: '💬 واتساب', color: '#25d366' },
                { href: 'https://t.me/elitestore_sy', label: '✈️ تيليغرام', color: '#2aabee' },
              ].map((s, i) => (
                <a key={i} href={s.href} target="_blank" rel="noopener noreferrer"
                  className="text-xs px-3 py-2 rounded-xl font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{ background: `${s.color}22`, border: `1px solid ${s.color}44`, color: s.color }}>
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-5 text-xs text-gray-500">
            <Link href="/" className="hover:text-gray-300 transition-colors">{lang === 'ar' ? 'الرئيسية' : 'Home'}</Link>
            <Link href="/products" className="hover:text-gray-300 transition-colors">{lang === 'ar' ? 'المنتجات' : 'Products'}</Link>
            <Link href="/support" className="hover:text-gray-300 transition-colors">{lang === 'ar' ? 'الدعم' : 'Support'}</Link>
            <Link href="/terms" className="hover:text-gray-300 transition-colors">{lang === 'ar' ? 'الشروط' : 'Terms'}</Link>
            <Link href="/privacy" className="hover:text-gray-300 transition-colors">{lang === 'ar' ? 'الخصوصية' : 'Privacy'}</Link>
          </div>

          {/* Bottom */}
          <div className="border-t border-white/5 pt-4 text-center">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Elite Store — جميع الحقوق محفوظة</p>
          </div>
        </div>
      </footer>

      <FloatingSupport />
    </div>
  );
}

export function DashboardLayout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const { t, dir, lang } = useLanguage();
  const { sypRate } = useSettings();
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
    { href: '/admin', icon: BarChart2, label: 'الإحصائيات' },
    { href: '/admin/orders', icon: Package, label: 'جميع الطلبات' },
    { href: '/admin/payments', icon: CreditCard, label: 'المدفوعات' },
    { href: '/admin/users', icon: Users, label: 'المستخدمون' },
    { href: '/admin/products', icon: Layers, label: 'المنتجات' },
    { href: '/admin/categories', icon: ChevronRight, label: 'إدارة الفئات' },
    { href: '/admin/settings', icon: Settings, label: 'الإعدادات' },
  ];

  const isAdmin = user?.role === 'admin';

  const balanceSYP = user ? (parseFloat(user.balance?.toString() ?? '0') * sypRate).toFixed(0) : '0';

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

      <FloatingSupport />
    </div>
  );
}
