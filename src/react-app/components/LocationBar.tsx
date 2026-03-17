import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Check, Loader2 } from 'lucide-react';
import { useLocation } from '@/react-app/hooks/useLocation';
import { motion, AnimatePresence } from 'framer-motion';

interface LocationBarProps {
    variant?: 'compact' | 'prominent';
    className?: string;
}

export default function LocationBar({ variant = 'compact', className = '' }: LocationBarProps) {
    const { loading, currentZip, setZipCodeLocation, requestLocation, locationSource } = useLocation();
    const [zipInput, setZipInput] = useState(currentZip || '');
    const [isEditing, setIsEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (currentZip) setZipInput(currentZip);
    }, [currentZip]);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!zipInput.trim()) {
            setIsEditing(false);
            return;
        }
        await setZipCodeLocation(zipInput);
        setIsEditing(false);
    };

    const handleGps = () => {
        requestLocation();
        setIsEditing(false);
    };

    const isCompact = variant === 'compact';

    return (
        <div className={`relative flex items-center gap-2 ${className}`}>
            <div
                className={`flex items-center transition-all duration-300 overflow-hidden ${isEditing
                    ? 'w-48 sm:w-56 bg-white/10 border-blue-400/50 ring-2 ring-blue-500/20'
                    : isCompact
                        ? 'w-32 bg-white/5 border-white/10 hover:bg-white/10'
                        : 'w-full sm:w-56 bg-white/5 border-white/10 hover:bg-white/10'
                    } rounded-2xl border px-3 h-12 relative group`}
            >
                <MapPin className={`w-4 h-4 flex-shrink-0 transition-colors ${isEditing ? 'text-blue-400' : 'text-slate-400'}`} />

                <form onSubmit={handleSubmit} className="flex-1 flex items-center ml-2">
                    <input
                        ref={inputRef}
                        type="text"
                        className="w-full bg-transparent border-none outline-none text-sm font-black text-white placeholder:text-slate-400"
                        placeholder={isEditing ? "Enter ZIP..." : "ZIP / City"}
                        value={zipInput}
                        onChange={(e) => setZipInput(e.target.value)}
                        onFocus={() => setIsEditing(true)}
                        onBlur={() => {
                            // Delay blur to allow button clicks
                            setTimeout(() => {
                                if (zipInput === currentZip) setIsEditing(false);
                            }, 200);
                        }}
                    />
                </form>

                <AnimatePresence>
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute right-3"
                        >
                            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        </motion.div>
                    )}

                    {!loading && isEditing && (
                        <motion.button
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            onClick={handleSubmit}
                            className="ml-2 p-1.5 bg-blue-600 rounded-lg text-white hover:bg-blue-700 transition-colors"
                        >
                            <Check className="w-3 h-3" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <button
                onClick={handleGps}
                disabled={loading}
                className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${locationSource === 'gps'
                    ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]'
                    : 'bg-white/5 border border-white/10 text-slate-400 hover:text-blue-400 hover:bg-white/10'
                    }`}
                title="Use Current Location (GPS)"
            >
                <Navigation className={`w-5 h-5 ${locationSource === 'gps' ? 'fill-current' : ''}`} />
            </button>
        </div>
    );
}
