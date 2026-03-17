import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Command, ArrowUp, CornerDownLeft, Search, Moon, Eye, Type, Zap, HelpCircle } from 'lucide-react';

export default function KeyboardShortcutsGuide() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not in an input/textarea and shift+/ (= ?)
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return;
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const shortcuts = [
    { keys: ['Ctrl', 'K'], label: 'Open Command Palette', icon: <Search className="w-4 h-4" /> },
    { keys: ['?'], label: 'Keyboard Shortcuts', icon: <HelpCircle className="w-4 h-4" /> },
    { keys: ['Tab'], label: 'Skip to Main Content', icon: <CornerDownLeft className="w-4 h-4" /> },
    { keys: ['↑', '↓'], label: 'Navigate Command Palette', icon: <ArrowUp className="w-4 h-4" /> },
    { keys: ['Enter'], label: 'Select Command', icon: <CornerDownLeft className="w-4 h-4" /> },
    { keys: ['Esc'], label: 'Close Overlay', icon: <X className="w-4 h-4" /> },
  ];

  const features = [
    { icon: <Moon className="w-4 h-4" />, label: 'Dark Mode', desc: 'Toggle via Navbar or Command Palette' },
    { icon: <Eye className="w-4 h-4" />, label: 'High Contrast', desc: 'Accessibility widget (bottom-right)' },
    { icon: <Type className="w-4 h-4" />, label: 'Large Text', desc: 'Accessibility widget (bottom-right)' },
    { icon: <Zap className="w-4 h-4" />, label: 'Reduce Motion', desc: 'Accessibility widget (bottom-right)' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-md z-[101]"
          >
            <div className="glass-layer rounded-2xl shadow-[0_0_30px_rgba(255,255,255,0.05)] border border-white/10 overflow-hidden">
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Command className="w-5 h-5 text-blue-400" />
                  <h2 className="font-bold text-white drop-shadow-sm text-sm uppercase tracking-widest">Keyboard Shortcuts</h2>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Navigation</h3>
                  <div className="space-y-2">
                    {shortcuts.map((s, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-white font-medium">
                          {s.icon}
                          <span>{s.label}</span>
                        </div>
                        <div className="flex gap-1">
                          {s.keys.map((key, j) => (
                            <kbd key={j} className="px-2 py-1 bg-white/5 rounded text-[10px] font-bold text-blue-300 border border-white/20 min-w-[24px] text-center shadow-inner">
                              {key}
                            </kbd>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Accessibility Features</h3>
                  <div className="space-y-2">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="p-1 rounded bg-white/5 border border-white/10 text-blue-400 shadow-inner">{f.icon}</span>
                        <div>
                          <span className="text-sm font-bold text-white tracking-wide">{f.label}</span>
                          <span className="text-xs text-slate-400 ml-2 font-medium">{f.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-white/10 text-center bg-white/5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Press ? to toggle this guide</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
