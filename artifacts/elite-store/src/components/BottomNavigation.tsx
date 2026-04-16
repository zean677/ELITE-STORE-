import { useLocation, Link } from 'wouter';
import { Home, Wallet, Package, User, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/i18n';
import { useAuth } from '@/hooks/use-auth';


const ADMIN_ROUTES = ['/admin'];
const HIDE_ROUTES = ['/login', '/register'];

export function BottomNavigation() {
  const [location] = useLocation();
  const { lang } = useLanguage();
  const { user } = useAuth();

  const isAdmin = ADMIN_ROUTES.some(r => location.startsWith(r));
  const isHidden = HIDE_ROUTES.includes(location);

  if (isAdmin || isHidden) return null;

  const navItems = [
    {
      href: '/',
      icon: Home,
      label: lang === 'ar' ? 'الرئيسية' : 'Home',
      color: '#6C5CE7',
      match: (l: string) => l === '/',
    },
    {
      href: user ? '/wallet' : '/login',
      icon: Wallet,
      label: lang === 'ar' ? 'المحفظة' : 'Wallet',
      color: '#f59e0b',
      match: (l: string) => l === '/wallet' || l === '/deposit',
    },
    {
      href: user ? '/orders' : '/login',
      icon: Package,
      label: lang === 'ar' ? 'طلباتي' : 'Orders',
      color: '#22c55e',
      match: (l: string) => l.startsWith('/orders'),
    },
    {
      href: user ? '/profile' : '/login',
      icon: User,
      label: lang === 'ar' ? 'حسابي' : 'Profile',
      color: '#f97316',
      match: (l: string) => l === '/profile' || l === '/dashboard',
    },
    {
      href: '/security',
      icon: ShieldCheck,
      label: lang === 'ar' ? 'الحماية' : 'Security',
      color: '#ef4444',
      match: (l: string) => l === '/security',
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden border-t border-white/5"
      style={{
        background: 'rgba(8, 10, 22, 0.97)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        boxShadow: '0 -1px 0 rgba(255,255,255,0.06), 0 -8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <div
        className="flex items-end justify-around px-1 pt-2"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.match(location);
          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex flex-col items-center gap-1 py-1 px-2 rounded-2xl transition-all duration-200 active:scale-90 select-none min-w-0"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200"
                style={{
                  background: active ? `${item.color}22` : 'transparent',
                  boxShadow: active ? `0 0 12px ${item.color}44` : 'none',
                }}
              >
                <Icon
                  size={20}
                  style={{ color: active ? item.color : '#6b7280' }}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span
                className="text-[9px] font-semibold tracking-wide transition-all duration-200 truncate max-w-full"
                style={{ color: active ? item.color : '#6b7280' }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
