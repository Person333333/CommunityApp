import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, Check, Loader2 } from 'lucide-react';
import { useLocation } from '@/react-app/hooks/useLocation';

export default function LocationSelector() {
    const { location, loading, currentZip, setZipCodeLocation, requestLocation, locationSource } = useLocation();
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-full glass hover:bg-white/10 transition-colors text-sm text-slate-200"
                title="Change Location"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-teal-400" />
                ) : locationSource === 'zip' && currentZip ? (
                    <>
                        <MapPin className="w-4 h-4 text-amber-400" />
                        <span className="font-medium">{currentZip}</span>
                    </>
                ) : (
                    <>
                        <Navigation className="w-4 h-4 text-teal-400 fill-teal-400/20" />
                        <span className="hidden sm:inline">Current Location</span>
                    </>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-72 glass p-4 rounded-xl border border-white/10 shadow-xl backdrop-blur-xl z-50"
                    >
                        <div className="space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-white/10">
                                <span className="text-sm font-semibold text-slate-100">Location Settings</span>
                                <span className="text-xs text-slate-400">
                                    {locationSource === 'zip' ? 'Using ZIP Code' : 'Using GPS'}
                                </span>
                            </div>

                            {/* Use Current Location Option */}
                            <button
                                onClick={handleUseCurrentLocation}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors text-left ${locationSource === 'gps'
                                        ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/50'
                                        : 'hover:bg-white/5 text-slate-300 hover:text-slate-100'
                                    }`}
                            >
                                <div className={`p-2 rounded-full ${locationSource === 'gps' ? 'bg-teal-500/20' : 'bg-slate-800'}`}>
                                    <Navigation className={`w-4 h-4 ${locationSource === 'gps' ? 'text-teal-400' : 'text-slate-400'}`} />
                                </div>
                                <div className="flex-1">
                                    <div className="text-sm font-medium">Use Current Location</div>
                                    <div className="text-xs opacity-70">Detect automatically</div>
                                </div>
                                {locationSource === 'gps' && <Check className="w-4 h-4 text-teal-400" />}
                            </button>

                            {/* Manual Entry Option */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                                    Or Enter ZIP Code
                                </label>
                                <form onSubmit={handleZipSubmit} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={zipInput}
                                        onChange={(e) => setZipInput(e.target.value)}
                                        placeholder={currentZip || "ZIP Code"}
                                        className="flex-1 bg-slate-900/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50"
                                        maxLength={10}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!zipInput.trim() || isSubmitting}
                                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
