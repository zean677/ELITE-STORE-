import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardLayout } from '@/components/Layout';
import { ScrollText, Shield } from 'lucide-react';

const terms = [
  { title: '1. القبول بالشروط', body: 'باستخدامك لمتجر Elite Store، فإنك توافق على الالتزام بهذه الشروط والأحكام. إذا كنت لا توافق على أي منها، يرجى عدم استخدام خدماتنا.' },
  { title: '2. الخدمات المقدّمة', body: 'يوفر Elite Store منصة لشراء الخدمات الرقمية وشحن الألعاب. نحن وسيط بين المستخدم والمزود، ونضمن أفضل الأسعار وسرعة التنفيذ.' },
  { title: '3. الحسابات والأمان', body: 'أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة مرورك. أي نشاط يتم عبر حسابك يُعدّ مسؤوليتك الكاملة.' },
  { title: '4. سياسة المدفوعات', body: 'جميع المدفوعات نهائية بعد إتمام الطلب بنجاح. في حال فشل التنفيذ يُرجع المبلغ للمحفظة فوراً. لا تُقبل طلبات الاسترداد للطلبات المنفّذة بنجاح.' },
  { title: '5. حظر الاستخدام المسيء', body: 'يُمنع منعاً باتاً: محاولة اختراق الموقع، استخدام بيانات مزيّفة، محاولة الاحتيال، أو إساءة استخدام الخدمة. سيُغلق الحساب فوراً في حال ثبوت أي مخالفة.' },
  { title: '6. تعديل الخدمات والأسعار', body: 'نحتفظ بحق تعديل الأسعار والخدمات في أي وقت دون إشعار مسبق. الأسعار المعروضة عند تقديم الطلب هي الأسعار المعتمدة.' },
  { title: '7. تحديد المسؤولية', body: 'Elite Store غير مسؤول عن أي خسائر غير مباشرة. مسؤوليتنا القصوى محدودة بقيمة الطلب المعني فقط.' },
  { title: '8. تعديل الشروط', body: 'قد نقوم بتحديث هذه الشروط دورياً. الاستمرار في استخدام الخدمة بعد أي تعديل يعني قبولك للشروط المحدّثة.' },
];

const privacy = [
  { title: '1. المعلومات التي نجمعها', body: 'نجمع: الاسم، البريد الإلكتروني، بيانات المعاملات المالية. لا نجمع أي بيانات حساسة مثل كلمات مرور الألعاب أو بيانات البنوك مباشرة.' },
  { title: '2. كيف نستخدم معلوماتك', body: 'نستخدم بياناتك لتقديم الخدمة، معالجة الطلبات، التواصل معك، وتحسين تجربة الاستخدام. لا نبيع بياناتك لأي طرف ثالث.' },
  { title: '3. أمان البيانات', body: 'نستخدم تشفيراً من طرف لطرف لحماية بياناتك. كلمات المرور مشفّرة ولا يستطيع أحد حتى فريقنا الاطلاع عليها.' },
  { title: '4. مشاركة البيانات', body: 'لا نشارك بياناتك مع أطراف ثالثة إلا عند الضرورة القصوى لتنفيذ الخدمة (مثل: إرسال طلبك للمزوّد بالمعرّف المطلوب فقط).' },
  { title: '5. حقوقك', body: 'يحق لك طلب حذف حسابك وبياناتك في أي وقت. تواصل معنا عبر واتساب وسنعالج طلبك خلال 48 ساعة.' },
];

function Section({ title, items }: { title: string; items: typeof terms }) {
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
          className="bg-card border border-border rounded-xl p-4"
        >
          <p className="font-bold text-sm mb-1.5">{item.title}</p>
          <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
        </motion.div>
      ))}
    </div>
  );
}

export default function Terms() {
  const [tab, setTab] = useState<'terms' | 'privacy'>('terms');

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-heading text-2xl font-bold">الشروط والخصوصية</h1>
          <p className="text-muted-foreground text-sm mt-1">آخر تحديث: أبريل 2025</p>
        </motion.div>

        {/* Tab Switcher */}
        <div className="flex gap-2 p-1 bg-card border border-border rounded-xl">
          <button
            onClick={() => setTab('terms')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'terms' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <ScrollText size={15} />
            الشروط والأحكام
          </button>
          <button
            onClick={() => setTab('privacy')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold transition-all ${tab === 'privacy' ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Shield size={15} />
            سياسة الخصوصية
          </button>
        </div>

        {tab === 'terms' ? <Section title="الشروط" items={terms} /> : <Section title="الخصوصية" items={privacy} />}

        <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
          <p className="text-xs text-muted-foreground">للاستفسار عن أي بند، تواصل معنا على واتساب</p>
          <a href="https://wa.me/963992718483" target="_blank" rel="noopener noreferrer" className="text-xs text-primary font-semibold hover:underline mt-1 block">+963 992 718 483</a>
        </div>
      </div>
    </DashboardLayout>
  );
}
