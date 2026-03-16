import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft, Sparkles, Compass, CheckCircle2, Circle } from 'lucide-react';
import { categoryHierarchy } from '@/shared/categoryHierarchy';
import { useLocation } from '@/react-app/hooks/useLocation';

interface QuestionnaireModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (filters: { searchTerm?: string; categories: string[]; tag?: string }) => void;
}

const DEMOGRAPHICS = [
    { id: 'family', label: 'Family with Children', icon: '👨‍👩‍👧‍👦' },
    { id: 'senior', label: 'Senior / Elderly', icon: '👴' },
    { id: 'veteran', label: 'Veteran', icon: '🎖️' },
    { id: 'student', label: 'Student', icon: '🎓' },
    { id: 'any', label: 'Any / I don\'t care', icon: '🌍' },
];

export default function QuestionnaireModal({ isOpen, onClose, onComplete }: QuestionnaireModalProps) {
    const [step, setStep] = useState(1);
    const [zipCode, setZipCode] = useState('');
    const [selectedDemographic, setSelectedDemographic] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const { currentZip, location: userLocation } = useLocation();

    useEffect(() => {
        if (isOpen && (currentZip || userLocation)) {
            setStep(2); // Skip zip step if we already have it
        }
    }, [isOpen, currentZip, userLocation]);

    const reset = () => {
        setStep(1);
        setZipCode('');
        setSelectedDemographic(null);
        setSelectedCategory(null);
        setSelectedSubCategory(null);
    };

    const handleComplete = (bypassLocation: boolean = false) => {
        if (bypassLocation) {
            console.log("User chose to see everything, bypassing location filtering.");
        }

        onComplete({
            categories: selectedCategory && selectedCategory !== 'any' ? [selectedCategory] : [],
            tag: selectedDemographic && selectedDemographic !== 'any' ? selectedDemographic : undefined,
            searchTerm: selectedSubCategory && selectedSubCategory !== 'any' ? selectedSubCategory : undefined
        });

        // If a ZIP code was entered and not bypassed, we'd typically handle it here or in the parent
        // For now, we pass the filters and the parent can handle the location update if needed
        // or we could add a handleLocationUpdate in onComplete props.

        onClose();
        setTimeout(reset, 300);
    };

    const currentCategoryObj = categoryHierarchy.find(c => c.label === selectedCategory);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-2xl max-h-[95vh] flex flex-col bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                    <Compass className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Resource Finder</h2>
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Step {step} of 4</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-200 rounded-full transition-colors"
                            >
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-1.5 bg-slate-100">
                            <motion.div
                                className="h-full bg-blue-600"
                                initial={{ width: '0%' }}
                                animate={{ width: `${(step / 4) * 100}%` }}
                            />
                        </div>

                        <div className="p-5 sm:p-10 flex flex-col flex-1 overflow-y-auto" style={{ minHeight: 'min(500px, 70vh)' }}>
                            <AnimatePresence mode="wait">
                                {step === 1 && (
                                    <motion.div
                                        key="step1"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6 flex-1"
                                    >
                                        <div className="text-center mb-8">
                                            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Where are you?</h3>
                                            <p className="text-slate-500 font-bold italic">Enter your ZIP code to find resources closest to you.</p>
                                        </div>

                                        <div className="max-w-xs mx-auto space-y-4">
                                            <input
                                                type="text"
                                                value={zipCode}
                                                onChange={(e) => setZipCode(e.target.value)}
                                                placeholder="e.g. 90210"
                                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-center text-2xl font-black uppercase tracking-widest focus:border-blue-500 transition-all outline-none"
                                            />
                                            <button
                                                onClick={() => { setZipCode(''); setStep(2); }}
                                                className="w-full py-3 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest"
                                            >
                                                See Everything (No ZIP needed)
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                                {step === 2 && (
                                    <motion.div
                                        key="step2"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6 flex-1"
                                    >
                                        <div className="text-center mb-8">
                                            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Who is this for?</h3>
                                            <p className="text-slate-500 font-bold italic">Tell us a bit about yourself or the person you are helping.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {DEMOGRAPHICS.map((demo) => (
                                                <button
                                                    key={demo.id}
                                                    onClick={() => setSelectedDemographic(demo.id)}
                                                    className={`flex items-center gap-4 p-5 rounded-3xl border-2 transition-all text-left group ${selectedDemographic === demo.id
                                                        ? 'border-blue-600 bg-blue-50/50 shadow-md'
                                                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <span className="text-3xl group-hover:scale-110 transition-transform">{demo.icon}</span>
                                                    <span className={`text-lg font-black tracking-tight ${selectedDemographic === demo.id ? 'text-blue-900' : 'text-slate-700'}`}>
                                                        {demo.label}
                                                    </span>
                                                    <div className="ml-auto">
                                                        {selectedDemographic === demo.id ? (
                                                            <CheckCircle2 className="w-6 h-6 text-blue-600" />
                                                        ) : (
                                                            <Circle className="w-6 h-6 text-slate-200" />
                                                        )}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                {step === 3 && (
                                    <motion.div
                                        key="step3"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6 flex-1"
                                    >
                                        <div className="text-center mb-8">
                                            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">What do you need?</h3>
                                            <p className="text-slate-500 font-bold italic">Select a category of support you are looking for.</p>
                                        </div>

                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                            {categoryHierarchy.map((cat) => (
                                                <button
                                                    key={cat.id}
                                                    onClick={() => setSelectedCategory(cat.label)}
                                                    className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all text-center group ${selectedCategory === cat.label
                                                        ? 'border-blue-600 bg-blue-50/50 shadow-md'
                                                        : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                                        }`}
                                                >
                                                    <span className={`text-sm font-black uppercase tracking-tighter ${selectedCategory === cat.label ? 'text-blue-900' : 'text-slate-700'}`}>
                                                        {cat.label}
                                                    </span>
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setSelectedCategory('any')}
                                                className={`flex flex-col items-center justify-center gap-3 p-6 rounded-3xl border-2 transition-all text-center group ${selectedCategory === 'any'
                                                    ? 'border-blue-600 bg-blue-50/50 shadow-md'
                                                    : 'border-slate-100 hover:border-blue-200 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span className={`text-sm font-black uppercase tracking-tighter ${selectedCategory === 'any' ? 'text-blue-900' : 'text-slate-700'}`}>
                                                    Any / Skip
                                                </span>
                                            </button>
                                        </div>
                                    </motion.div>
                                )}

                                {step === 4 && (
                                    <motion.div
                                        key="step4"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        className="space-y-6 flex-1"
                                    >
                                        <div className="text-center mb-8">
                                            <h3 className="text-3xl font-black text-slate-900 mb-2 tracking-tight uppercase">Any specifics?</h3>
                                            <p className="text-slate-500 font-bold italic">Choose an area of interest or skip to see all.</p>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {selectedCategory === 'any' ? (
                                                <div className="col-span-2 text-center py-10">
                                                    <Compass className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                                                    <p className="text-slate-400 font-bold italic">You've chosen to explore all resources. Ready to go!</p>
                                                </div>
                                            ) : (
                                                <>
                                                    {currentCategoryObj?.children?.map((sub) => (
                                                        <button
                                                            key={sub.id}
                                                            onClick={() => setSelectedSubCategory(sub.label)}
                                                            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${selectedSubCategory === sub.label
                                                                ? 'border-blue-600 bg-blue-50/50'
                                                                : 'border-slate-100 hover:border-blue-200'
                                                                }`}
                                                        >
                                                            <div className={`w-3 h-3 rounded-full ${selectedSubCategory === sub.label ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                                            <span className={`text-sm font-bold ${selectedSubCategory === sub.label ? 'text-blue-900' : 'text-slate-700'}`}>
                                                                {sub.label}
                                                            </span>
                                                        </button>
                                                    ))}
                                                    <button
                                                        onClick={() => setSelectedSubCategory('any')}
                                                        className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all text-left ${selectedSubCategory === 'any'
                                                            ? 'border-blue-600 bg-blue-50/50'
                                                            : 'border-slate-100 hover:border-blue-200'
                                                            }`}
                                                    >
                                                        <div className={`w-3 h-3 rounded-full ${selectedSubCategory === 'any' ? 'bg-blue-600' : 'bg-slate-200'}`} />
                                                        <span className={`text-sm font-bold ${selectedSubCategory === 'any' ? 'text-blue-900' : 'text-slate-700'}`}>
                                                            Show All {selectedCategory}
                                                        </span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Actions */}
                            <div className="mt-auto pt-10 flex items-center justify-between gap-4 border-t border-slate-50">
                                {step > 1 ? (
                                    <button
                                        onClick={() => setStep(step - 1)}
                                        className="flex items-center gap-2 px-4 sm:px-6 py-3 text-slate-500 font-black uppercase tracking-widest text-xs hover:text-slate-900 transition-colors"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> <span className="hidden sm:inline">Back</span>
                                    </button>
                                ) : <div />}

                                {step < 4 ? (
                                    <button
                                        disabled={step === 1 ? (zipCode.length < 5) : step === 2 ? !selectedDemographic : !selectedCategory}
                                        onClick={() => setStep(step + 1)}
                                        className="flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs transition-all shadow-xl shadow-slate-900/10"
                                    >
                                        Next Step <ChevronRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleComplete()}
                                        className="flex items-center gap-2 px-6 sm:px-10 py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs transition-all shadow-xl shadow-blue-600/20"
                                    >
                                        See Resources <Sparkles className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
