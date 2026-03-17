import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, Home, Phone, Utensils } from 'lucide-react';
import GlassButton from './GlassButton';

export default function NeedHelpNow() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 left-4 z-[60] bg-slate-900 hover:bg-slate-800 text-white shadow-slate-500/30 shadow-lg rounded-full px-3 py-2.5 sm:p-4 flex items-center gap-2 sm:gap-3 transition-colors duration-300"
            >
                <AlertCircle className="w-6 h-6 animate-pulse" />
                <span className="font-semibold hidden sm:inline-block">Need Help Now?</span>
            </motion.button>

            {/* Modal overlay */}
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="glass-layer rounded-[2rem] shadow-[0_0_30px_rgba(255,255,255,0.05)] w-full max-w-lg relative z-[71] overflow-hidden border border-white/10"
                        >
                            <div className="bg-white/5 border-b border-white/10 p-6 flex justify-between items-center text-white">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-8 h-8 text-rose-400" />
                                    <h2 className="text-xl font-bold uppercase tracking-widest drop-shadow-sm">Immediate Access</h2>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                    <X className="w-5 h-5 text-slate-300" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <p className="text-slate-300 font-medium">If you are in immediate physical danger, please call <strong className="text-rose-400 font-black tracking-widest text-lg">911</strong> immediately.</p>

                                <div className="space-y-4">
                                    <a href="tel:988" className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-blue-500/10 hover:border-blue-400/30 transition-all group">
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors border border-blue-400/20">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm tracking-wide">Crisis Lifeline</h3>
                                            <p className="text-blue-200 text-xs font-medium">Call or Text 988 (Available 24/7)</p>
                                        </div>
                                    </a>

                                    <a href="/discover?category=Housing%20%26%20Utilities" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-amber-500/10 hover:border-amber-400/30 transition-all group shadow-sm">
                                        <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors border border-amber-400/20">
                                            <Home className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm tracking-wide">Emergency Housing</h3>
                                            <p className="text-amber-200 text-xs font-medium">Find shelters open right now</p>
                                        </div>
                                    </a>

                                    <a href="/discover?category=Food%20Assistance" className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-emerald-500/10 hover:border-emerald-400/30 transition-all group shadow-sm">
                                        <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors border border-emerald-400/20">
                                            <Utensils className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-sm tracking-wide">Food Banks Today</h3>
                                            <p className="text-emerald-200 text-xs font-medium">Hot meals and emergency pantries</p>
                                        </div>
                                    </a>
                                </div>

                                <div className="pt-4 text-center">
                                    <GlassButton variant="secondary" onClick={() => setIsOpen(false)} className="w-full justify-center">Close</GlassButton>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
