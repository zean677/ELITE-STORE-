import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'ar' | 'en';

interface Translations {
  [key: string]: {
    ar: string;
    en: string;
  };
}

const translations: Translations = {
  home: { ar: 'الرئيسية', en: 'Home' },
  products: { ar: 'المنتجات', en: 'Products' },
  dashboard: { ar: 'لوحة التحكم', en: 'Dashboard' },
  wallet: { ar: 'المحفظة', en: 'Wallet' },
  deposit: { ar: 'إيداع', en: 'Deposit' },
  orders: { ar: 'الطلبات', en: 'Orders' },
  notifications: { ar: 'الإشعارات', en: 'Notifications' },
  admin: { ar: 'الإدارة', en: 'Admin' },
  login: { ar: 'تسجيل الدخول', en: 'Login' },
  register: { ar: 'إنشاء حساب', en: 'Register' },
  logout: { ar: 'تسجيل الخروج', en: 'Logout' },
  search: { ar: 'بحث...', en: 'Search...' },
  buyNow: { ar: 'اشتري الآن', en: 'Buy Now' },
  addToCart: { ar: 'أضف للسلة', en: 'Add to Cart' },
  price: { ar: 'السعر', en: 'Price' },
  quantity: { ar: 'الكمية', en: 'Quantity' },
  playerId: { ar: 'معرف اللاعب', en: 'Player ID' },
  balance: { ar: 'الرصيد', en: 'Balance' },
  email: { ar: 'البريد الإلكتروني', en: 'Email' },
  password: { ar: 'كلمة المرور', en: 'Password' },
  username: { ar: 'اسم المستخدم', en: 'Username' },
  syriatelCash: { ar: 'سيريتل كاش', en: 'Syriatel Cash' },
  shamCash: { ar: 'شام كاش', en: 'Sham Cash' },
  amount: { ar: 'المبلغ', en: 'Amount' },
  submit: { ar: 'إرسال', en: 'Submit' },
  pending: { ar: 'قيد الانتظار', en: 'Pending' },
  processing: { ar: 'جاري المعالجة', en: 'Processing' },
  completed: { ar: 'مكتمل', en: 'Completed' },
  failed: { ar: 'فشل', en: 'Failed' },
  refunded: { ar: 'مسترجع', en: 'Refunded' },
  approved: { ar: 'مقبول', en: 'Approved' },
  rejected: { ar: 'مرفوض', en: 'Rejected' },
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
  dir: 'rtl' | 'ltr';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>('ar');

  useEffect(() => {
    const savedLang = localStorage.getItem('elite_lang') as Language;
    if (savedLang && (savedLang === 'ar' || savedLang === 'en')) {
      setLangState(savedLang);
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('elite_lang', newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][lang];
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir: lang === 'ar' ? 'rtl' : 'ltr' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
