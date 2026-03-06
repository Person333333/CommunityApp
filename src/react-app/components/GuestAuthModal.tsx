import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn, UserPlus, Heart, FolderHeart } from 'lucide-react';
import GlassCard from './GlassCard';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';

interface GuestAuthModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    message: string;
    type: 'favorite' | 'submissions';
}

export default function GuestAuthModal({ isOpen, onClose, title, message, type }: GuestAuthModalProps) {
    const { t } = useTranslation();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-md"
                    >
                        <GlassCard variant="strong" className="p-8">
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 border border-blue-100">
                                    {type === 'favorite' ? (
                                        <FolderHeart className="w-8 h-8 text-blue-600" />
                                    ) : (
                                        <Heart className="w-8 h-8 text-indigo-600" />
                                    )}
                                </div>

                                <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-widest">
                                    {title}
                                </h3>
                                <p className="text-slate-800 mb-8 leading-relaxed font-bold">
                                    {message}
                                </p>

                                <div className="flex flex-col w-full gap-3">
                                    <Link
                                        to="/sign-in"
                                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        <LogIn className="w-5 h-5" />
                                        {t('auth.signInButton')}
                                    </Link>
                                    <Link
                                        to="/sign-up"
                                        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 rounded-xl font-black uppercase tracking-widest text-sm transition-all shadow-sm"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        {t('auth.signUpButton')}
                                    </Link>
                                    <button
                                        onClick={onClose}
                                        className="mt-2 text-sm text-slate-600 hover:text-slate-900 transition-colors font-bold"
                                    >
                                        {t('common.close')}
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
