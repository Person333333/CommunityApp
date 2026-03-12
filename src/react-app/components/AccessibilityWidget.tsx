import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accessibility, Eye, Type, Zap, X } from 'lucide-react';

export default function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [highContrast, setHighContrast] = useState(() => localStorage.getItem('a11y-high-contrast') === 'true');
  const [largeText, setLargeText] = useState(() => localStorage.getItem('a11y-large-text') === 'true');
  const [reduceMotion, setReduceMotion] = useState(() => localStorage.getItem('a11y-reduce-motion') === 'true');

  useEffect(() => {
    document.documentElement.classList.toggle('high-contrast', highContrast);
    localStorage.setItem('a11y-high-contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    document.documentElement.classList.toggle('large-text', largeText);
    localStorage.setItem('a11y-large-text', String(largeText));
  }, [largeText]);

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion);
    localStorage.setItem('a11y-reduce-motion', String(reduceMotion));
  }, [reduceMotion]);

  const toggles = [
    { label: 'High Contrast', icon: <Eye className="w-4 h-4" />, active: highContrast, toggle: () => setHighContrast(!highContrast) },
    { label: 'Large Text', icon: <Type className="w-4 h-4" />, active: largeText, toggle: () => setLargeText(!largeText) },
    { label: 'Reduce Motion', icon: <Zap className="w-4 h-4" />, active: reduceMotion, toggle: () => setReduceMotion(!reduceMotion) },
  ];

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-slate-900 hover:bg-slate-800 rounded-full flex items-center justify-center shadow-lg z-40 transition-colors"
        aria-label="Accessibility options"
        title="Accessibility options"
      >
        <Accessibility className="w-6 h-6 text-white" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="fixed bottom-[8.5rem] right-6 w-72 bg-white border border-slate-200 rounded-2xl shadow-2xl p-5 z-40"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Accessibility className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Accessibility</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              {toggles.map((t) => (
                <button
                  key={t.label}
                  onClick={t.toggle}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${t.active
                      ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                      : 'bg-slate-50 text-slate-700 border border-slate-100 hover:bg-slate-100'
                    }`}
                >
                  <span className={`p-1.5 rounded-lg ${t.active ? 'bg-indigo-200' : 'bg-slate-200'}`}>
                    {t.icon}
                  </span>
                  <span className="flex-1 text-left">{t.label}</span>
                  <div className={`w-10 h-6 rounded-full transition-colors relative ${t.active ? 'bg-indigo-600' : 'bg-slate-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${t.active ? 'translate-x-5' : 'translate-x-1'}`} />
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-400 font-medium mt-3 text-center">
              Settings are saved automatically
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
