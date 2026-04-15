import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/Layout';
import { MessageCircle, Phone, Mail, Clock, ChevronDown, ChevronUp, ExternalLink, Send } from 'lucide-react';

const faqs = [
  { q: 'كم يستغرق تنفيذ الطلب؟', a: 'معظم الطلبات تُنفَّذ فورياً خلال ثوانٍ. في حالات نادرة قد يستغرق حتى 15 دقيقة.' },
  { q: 'كيف أشحن رصيد محفظتي؟', a: 'اذهب إلى المحفظة > إيداع رصيد، واختر طريقة الدفع المناسبة (Syriatel Cash، Sham Cash، USDT...) ثم أرسل الطلب وانتظر موافقة الإدارة.' },
  { q: 'ما هي طرق الدفع المتاحة؟', a: 'نقبل: Syriatel Cash، Sham Cash، USDT BEP-20، Binance Pay، CoinEx، وغيرها. جميع الطرق موضّحة في صفحة الإيداع.' },
  { q: 'ماذا أفعل إذا فشل طلبي؟', a: 'في حال فشل الطلب، يُعاد المبلغ لمحفظتك تلقائياً. يمكنك التواصل معنا عبر واتساب للمتابعة.' },
  { q: 'هل يمكن استرداد المبلغ؟', a: 'نعم، في حال فشل تنفيذ الطلب يُسترد المبلغ فوراً. أما الطلبات المنفّذة بنجاح فلا يمكن استردادها.' },
  { q: 'ما هو البلد الذي تخدمونه؟', a: 'نخدم السوق السورية بشكل رئيسي، لكن يمكن للعملاء من أي مكان الطلب. المدفوعات متاحة دولياً.' },
  { q: 'هل معلوماتي آمنة؟', a: 'نعم تماماً. لا نحتفظ بكلمات مرور الألعاب. نستخدم تشفيراً كاملاً لحماية بيانات الحساب.' },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between p-4 text-right hover:bg-background transition-colors"
      >
        <span className="font-semibold text-sm">{q}</span>
        {open ? <ChevronUp size={16} className="text-primary shrink-0 ml-3" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-3" />}
      </button>
      {open && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
          {a}
        </motion.div>
      )}
    </div>
  );
}

export default function Support() {
  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold">الدعم والمساعدة</h1>
          <p className="text-muted-foreground text-sm mt-1">نحن هنا لمساعدتك. تواصل معنا عبر أي قناة أدناه</p>
        </motion.div>

        {/* Contact Cards */}
        <div className="grid sm:grid-cols-3 gap-4">
          <motion.a
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            href="https://wa.me/963992718483"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 p-5 bg-card border border-border rounded-2xl hover:border-[#25D366]/40 hover:bg-[#25D366]/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#25D366]/15 border border-[#25D366]/20 flex items-center justify-center group-hover:bg-[#25D366]/25 transition-all">
              <MessageCircle size={22} className="text-[#25D366]" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm">واتساب</p>
              <p className="text-xs text-muted-foreground mt-0.5">دعم مباشر</p>
            </div>
            <span className="text-xs text-[#25D366] font-mono">+963 992 718 483</span>
          </motion.a>

          <motion.a
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            href="https://chat.whatsapp.com/DmATlEZYLFgHbWuo4HOVay"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-3 p-5 bg-card border border-border rounded-2xl hover:border-primary/40 hover:bg-primary/5 transition-all group"
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center group-hover:bg-primary/25 transition-all">
              <ExternalLink size={22} className="text-primary" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm">مجموعة واتساب</p>
              <p className="text-xs text-muted-foreground mt-0.5">انضم للمجموعة</p>
            </div>
            <span className="text-xs text-primary">اضغط للانضمام</span>
          </motion.a>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="flex flex-col items-center gap-3 p-5 bg-card border border-border rounded-2xl"
          >
            <div className="w-12 h-12 rounded-2xl bg-secondary/15 border border-secondary/20 flex items-center justify-center">
              <Clock size={22} className="text-secondary" />
            </div>
            <div className="text-center">
              <p className="font-bold text-sm">أوقات الدعم</p>
              <p className="text-xs text-muted-foreground mt-0.5">متاحون يومياً</p>
            </div>
            <span className="text-xs text-secondary">9 ص — 11 م</span>
          </motion.div>
        </div>

        {/* FAQ */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="font-heading font-bold text-lg mb-4">الأسئلة الشائعة</h2>
          <div className="space-y-2">
            {faqs.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} />
            ))}
          </div>
        </motion.div>

        {/* Quick Message */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <div className="p-5 bg-primary/5 border border-primary/20 rounded-2xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <Send size={16} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-sm">هل لم تجد إجابتك؟</p>
              <p className="text-xs text-muted-foreground mt-0.5">تواصل معنا مباشرة وسنرد عليك خلال دقائق</p>
            </div>
            <a
              href="https://wa.me/963992718483?text=مرحباً، أحتاج مساعدة من Elite Store"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
            >
              تواصل
            </a>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
