import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Check, Loader2 } from 'lucide-react';
import { useLocation } from '@/react-app/hooks/useLocation';
import { useTranslation } from 'react-i18next';

export default function LocationSelector() {
    const { t } = useTranslation();
    const { loading, currentZip, setZipCodeLocation, requestLocation, locationSource } = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [zipInput, setZipInput] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleZipSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!zipInput.trim()) return;

        setIsSubmitting(true);
        await setZipCodeLocation(zipInput);
        setIsSubmitting(false);
        setIsOpen(false);
        setZipInput('');
    };

    const handleUseCurrentLocation = () => {
        requestLocation();
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 hover:bg-slate-50 transition-colors text-sm text-slate-900 shadow-sm"
                title={t('location.changeLocation')}
            >
                {loading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                ) : locationSource === 'zip' && currentZip ? (
                    <>
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-medium text-[10px]">{currentZip}</span>
                    </>
                ) : (
                    <>
                        <Navigation className="w-3.5 h-3.5 text-blue-600 fill-blue-600/20" />
                        <span className="hidden sm:inline text-[10px] font-black tracking-tight uppercase">GPS</span>
                    </>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-72 bg-white p-4 rounded-xl border border-slate-200 shadow-2xl z-50"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                                <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{t('location.settings')}</span>
                                <span className="text-[10px] font-black text-slate-500 uppercase">
                                    {locationSource === 'zip' ? t('location.usingZip') : t('location.usingGps')}
                                </span>
                            </div>

                            {/* Use Current Location Option */}
                            <button
                                onClick={handleUseCurrentLocation}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left font-black ${locationSource === 'gps'
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                                    : 'bg-slate-50 border border-slate-100 text-slate-900 hover:bg-slate-100'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${locationSource === 'gps' ? 'bg-white/20' : 'bg-white shadow-sm'}`}>
                                    <Navigation className={`w-4 h-4 ${locationSource === 'gps' ? 'text-white' : 'text-blue-600'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium">{t('location.useCurrentLocation')}</div>
                                    <div className="text-xs opacity-70">{t('location.detectAutomatically')}</div>
                                </div>
                                {locationSource === 'gps' && <Check className="w-4 h-4 text-white" />}
                            </button>

                            {/* Manual Entry Option */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest block mb-2">
                                    {t('location.enterZipCode')}
                                </label>
                                <form onSubmit={handleZipSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={zipInput}
                                        onChange={(e) => setZipInput(e.target.value)}
                                        placeholder={currentZip || t('location.zipCode')}
                                        className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-black placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 font-black"
                                        maxLength={10}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!zipInput.trim() || isSubmitting}
                                        className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-500/20"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Check className="w-4 h-4" />
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
