import React, { useState, useEffect } from 'react';
import { X, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

const typeStyles: Record<string, { bg: string; border: string; text: string }> = {
  info:    { bg: 'bg-primary/10',     border: 'border-primary/30',     text: 'text-primary' },
  success: { bg: 'bg-success/10',     border: 'border-success/30',     text: 'text-success' },
  warning: { bg: 'bg-yellow-500/10',  border: 'border-yellow-500/30',  text: 'text-yellow-400' },
  error:   { bg: 'bg-destructive/10', border: 'border-destructive/30', text: 'text-destructive' },
};

export function AnnouncementBanner() {
  const [data, setData] = useState<{ announcement: string; announcement_active: string; announcement_type: string } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch(`${BASE}/api/settings`)
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => {});
  }, []);

  if (!data || data.announcement_active !== 'true' || !data.announcement || dismissed) return null;

  const style = typeStyles[data.announcement_type ?? 'info'] ?? typeStyles.info;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: 'auto', opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className={`w-full border-b ${style.bg} ${style.border} overflow-hidden`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center gap-3">
          <Megaphone size={14} className={`${style.text} shrink-0`} />
          <p className={`text-xs flex-1 text-center font-medium ${style.text}`}>{data.announcement}</p>
          <button onClick={() => setDismissed(true)} className={`${style.text} opacity-60 hover:opacity-100 transition-opacity shrink-0`}>
            <X size={14} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
