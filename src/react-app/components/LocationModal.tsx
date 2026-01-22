import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, RefreshCw, X } from 'lucide-react';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onRequestLocation: () => void;
    onZipCodeSearch: (zipCode: string) => void;
    loading?: boolean;
    error?: string | null;
}

export default function LocationModal({
    isOpen,
    onClose,
    onRequestLocation,
    onZipCodeSearch,
    loading = false,
    error = null
}: LocationModalProps) {
    const { t } = useTranslation();
    const [zipCode, setZipCode] = useState('');
    const [useZip, setUseZip] = useState(false);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="max-w-md w-full relative"
                >
                    <GlassCard variant="strong" className="p-8 text-center relative">
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <motion.div
                            animate={{ rotate: loading ? 360 : 0 }}
                            transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: "linear" }}
                            className="inline-block mb-6"
                        >
                            <MapPin className="w-12 h-12 text-teal-400 mx-auto" />
                        </motion.div>

                        <h2 className="text-2xl font-bold text-slate-100 mb-4">
                            {t('location.title')}
                        </h2>

                        {/* ZIP Code Option */}
                        <div className="mb-6">
                            <div className="flex gap-2 mb-4">
                                <button
                                    onClick={() => setUseZip(false)}
                                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${!useZip ? 'bg-teal-500/30 border border-teal-400/50' : 'glass hover:bg-white/10'
                                        }`}
                                >
                                    {t('location.useMyLocation')}
                                </button>
                                <button
                                    onClick={() => setUseZip(true)}
                                    className={`flex-1 py-2 px-4 rounded-lg transition-colors ${useZip ? 'bg-teal-500/30 border border-teal-400/50' : 'glass hover:bg-white/10'
                                        }`}
                                >
                                    {t('location.useZipCode')}
                                </button>
                            </div>

                            {useZip && (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={zipCode}
                                        onChange={(e) => setZipCode(e.target.value)}
                                        placeholder={t('location.zipPlaceholder')}
                                        className="w-full px-4 py-3 rounded-lg glass border border-white/10 focus:border-teal-400/50 focus:outline-none text-slate-100 placeholder-slate-400"
                                        maxLength={10}
                                    />
                                    <GlassButton
                                        variant="primary"
                                        size="lg"
                                        onClick={() => {
                                            if (zipCode) {
                                                onZipCodeSearch(zipCode);
                                                onClose();
                                            }
                                        }}
                                        disabled={loading || !zipCode}
                                        className="w-full"
                                    >
                                        {t('location.searchByZip')}
                                    </GlassButton>
                                </div>
                            )}
                        </div>

                        {!useZip && (
                            <GlassButton
                                variant="primary"
                                size="lg"
                                onClick={() => {
                                    onRequestLocation();
                                    onClose();
                                }}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        {t('location.requesting')}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5" />
                                        {t('location.allow')}
                                    </span>
                                )}
                            </GlassButton>
                        )}

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-3 bg-rose-500/20 border border-rose-400/30 rounded-lg text-rose-200 text-sm"
                            >
                                {error}
                            </motion.div>
                        )}
                    </GlassCard>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
