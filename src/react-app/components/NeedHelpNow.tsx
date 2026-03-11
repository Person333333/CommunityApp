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
                className="fixed bottom-6 left-6 z-[60] bg-rose-600 hover:bg-rose-700 text-white shadow-rose-500/30 shadow-lg rounded-full p-4 flex items-center gap-3 transition-colors duration-300"
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
                            className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg relative z-[71] overflow-hidden border border-rose-100"
                        >
                            <div className="bg-rose-600 p-6 flex justify-between items-center text-white">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-8 h-8" />
                                    <h2 className="text-2xl font-semibold">Immediate Access</h2>
                                </div>
                                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-rose-700 rounded-full transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <p className="text-slate-600 font-bold">If you are in immediate physical danger, please call <strong className="text-rose-600">911</strong> immediately.</p>

                                <div className="space-y-4">
                                    <a href="tel:988" className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:bg-blue-50 hover:border-blue-200 transition-all group">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                            <Phone className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm">Crisis Lifeline</h3>
                                            <p className="text-slate-500 text-xs font-medium">Call or Text 988 (Available 24/7)</p>
                                        </div>
                                    </a>

                                    <a href="/discover?category=Housing%20%26%20Utilities" className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-amber-50 hover:border-amber-200 transition-all group shadow-sm">
                                        <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                                            <Home className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm">Emergency Housing</h3>
                                            <p className="text-slate-500 text-xs font-medium">Find shelters open right now</p>
                                        </div>
                                    </a>

                                    <a href="/discover?category=Food%20Assistance" className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 hover:bg-emerald-50 hover:border-emerald-200 transition-all group shadow-sm">
                                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                            <Utensils className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 text-sm">Food Banks Today</h3>
                                            <p className="text-slate-500 text-xs font-medium">Hot meals and emergency pantries</p>
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
