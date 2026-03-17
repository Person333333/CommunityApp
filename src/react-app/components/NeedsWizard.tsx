import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Compass, Utensils, Home, Heart, Stethoscope, GraduationCap, Briefcase, Scale, Baby, Zap, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { categoryHierarchy } from '@/shared/categoryHierarchy';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  'Food Assistance': <Utensils className="w-5 h-5" />,
  'Housing & Utilities': <Home className="w-5 h-5" />,
  'Healthcare': <Stethoscope className="w-5 h-5" />,
  'Mental Health': <Heart className="w-5 h-5" />,
  'Education': <GraduationCap className="w-5 h-5" />,
  'Employment': <Briefcase className="w-5 h-5" />,
  'Legal Aid': <Scale className="w-5 h-5" />,
  'Youth & Family': <Baby className="w-5 h-5" />,
};

interface NeedsWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NeedsWizard({ isOpen, onClose }: NeedsWizardProps) {
  const [step, setStep] = useState(0);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [urgency, setUrgency] = useState('');
  const navigate = useNavigate();

  const categories = useMemo(() => categoryHierarchy.slice(0, 8).map(c => c.label), []);

  useEffect(() => {
    if (isOpen) { setStep(0); setSelectedCategories([]); setUrgency(''); }
  }, [isOpen]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const goToResults = () => {
    const cat = selectedCategories[0] || '';
    navigate(`/discover?category=${encodeURIComponent(cat)}`);
    onClose();
  };

  const urgencyOptions = [
    { value: 'immediate', label: 'Right now', desc: 'I need help today', color: 'indigo' },
    { value: 'week', label: 'This week', desc: 'Within the next few days', color: 'amber' },
    { value: 'browsing', label: 'Just exploring', desc: 'Looking for future reference', color: 'blue' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4"
          >
            <div className="glass-layer rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-white/10">
              {/* Progress bar */}
              <div className="h-1.5 bg-white/5">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                  animate={{ width: `${((step + 1) / 3) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-2">
                <div className="flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-400" />
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">Step {step + 1} of 3</span>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 pt-2">
                <AnimatePresence mode="wait">
                  {step === 0 && (
                    <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h2 className="text-xl font-bold text-white mb-1 drop-shadow-sm">What are you looking for?</h2>
                      <p className="text-sm text-slate-300 font-medium mb-5">Select one or more categories</p>
                      <div className="grid grid-cols-2 gap-3">
                        {categories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => toggleCategory(cat)}
                            className={`flex items-center gap-3 p-3 rounded-xl text-left text-sm font-semibold transition-all ${selectedCategories.includes(cat)
                                ? 'bg-blue-500/20 text-blue-300 border-2 border-blue-400/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                                : 'bg-white/5 text-slate-300 border-2 border-transparent hover:border-white/20'
                              }`}
                          >
                            <span className={`p-1.5 rounded-lg ${selectedCategories.includes(cat) ? 'bg-blue-500/30 shadow-inner' : 'bg-white/10'}`}>
                              {CATEGORY_ICONS[cat] || <Zap className="w-5 h-5" />}
                            </span>
                            <span className="truncate">{cat}</span>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-5">
                        <button onClick={goToResults} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-blue-400 transition-colors">Skip → View all</button>
                        <button
                          onClick={() => setStep(1)}
                          disabled={selectedCategories.length === 0}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-md"
                        >
                          Next <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 1 && (
                    <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h2 className="text-xl font-bold text-white drop-shadow-sm mb-1">How urgent is your need?</h2>
                      <p className="text-sm text-slate-300 font-medium mb-5">This helps us prioritize the right resources</p>
                      <div className="space-y-3">
                        {urgencyOptions.map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => setUrgency(opt.value)}
                            className={`w-full flex items-center gap-4 p-4 rounded-xl text-left transition-all ${urgency === opt.value
                                ? `bg-${opt.color}-500/20 border-2 border-${opt.color}-400/50 text-${opt.color}-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]`
                                : 'bg-white/5 border-2 border-transparent text-slate-300 hover:border-white/20'
                              }`}
                          >
                            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${urgency === opt.value ? `border-${opt.color}-400 bg-${opt.color}-500/30` : 'border-slate-500'
                              }`}>
                              {urgency === opt.value && <CheckCircle2 className="w-4 h-4 text-white" />}
                            </div>
                            <div>
                              <div className="font-semibold text-sm">{opt.label}</div>
                              <div className="text-xs text-slate-400">{opt.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center justify-between mt-5">
                        <button onClick={() => setStep(0)} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">← Back</button>
                        <button
                          onClick={() => setStep(2)}
                          disabled={!urgency}
                          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-white/10 disabled:text-slate-500 text-white font-semibold rounded-xl transition-colors text-sm shadow-md"
                        >
                          See Results <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {step === 2 && (
                    <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <div className="text-center mb-5">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300 }} className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-400/30">
                          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </motion.div>
                        <h2 className="text-xl font-bold text-white drop-shadow-sm mb-1">We found resources for you!</h2>
                        <p className="text-sm text-slate-300 font-medium">Based on your selections, here are your personalized recommendations</p>
                      </div>
                      <div className="space-y-3 mb-5">
                        {selectedCategories.map(cat => (
                          <button
                            key={cat}
                            onClick={() => { navigate(`/discover?category=${encodeURIComponent(cat)}`); onClose(); }}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-blue-500/10 border border-blue-400/20 hover:bg-blue-500/20 transition-all text-left group hover:shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                          >
                            <span className="p-1.5 rounded-lg bg-blue-500/20 border border-blue-400/30">
                              {CATEGORY_ICONS[cat] || <Zap className="w-5 h-5 text-blue-300" />}
                            </span>
                            <span className="flex-1 font-semibold text-sm text-blue-200">{cat}</span>
                            <ArrowRight className="w-4 h-4 text-blue-400 group-hover:text-blue-300 group-hover:translate-x-1 transition-all" />
                          </button>
                        ))}
                      </div>
                      {urgency === 'immediate' && (
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-6 text-center shadow-inner">
                          <p className="text-xs font-bold text-rose-300 tracking-wide leading-relaxed">⚠️ If you are in immediate danger, please call <strong className="text-rose-400">911</strong> or the Crisis Lifeline at <strong className="text-rose-400">988</strong></p>
                        </div>
                      )}
                      <button
                        onClick={goToResults}
                        className="w-full px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all text-sm shadow-[0_0_15px_rgba(37,99,235,0.4)]"
                      >
                        Browse All Resources
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
