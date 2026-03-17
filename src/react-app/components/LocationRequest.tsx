import { motion } from 'framer-motion';
import { MapPin, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface LocationRequestProps {
  onRequestLocation: () => void;
  onZipCodeSearch?: (zipCode: string) => void;
  loading?: boolean;
  error?: string | null;
}

export default function LocationRequest({ onRequestLocation, onZipCodeSearch, loading = false, error = null }: LocationRequestProps) {
  const { t } = useTranslation();
  console.log('LocationRequest PROPS:', {
    onRequestLocation: !!onRequestLocation,
    onZipCodeSearch: !!onZipCodeSearch,
    loading,
    error
  });
  const [zipCode, setZipCode] = useState('');
  const [useZip, setUseZip] = useState(false);
  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <GlassCard variant="strong" className="p-8 text-center">
          <motion.div
            animate={{ rotate: loading ? 360 : 0 }}
            transition={{ duration: 2, repeat: loading ? Infinity : 0, ease: "linear" }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center shadow-inner border border-blue-400/30">
              <MapPin className="w-10 h-10 text-blue-400" />
            </div>
          </motion.div>

          <h2 className="text-3xl font-black text-white drop-shadow-sm mb-4 uppercase tracking-widest">
            {t('location.title')}
          </h2>

          <p className="text-slate-300 mb-8 font-bold leading-relaxed">
            {t('location.description')}
          </p>

          {/* ZIP Code Option */}
          <div className="mb-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setUseZip(false)}
                className={`flex-1 py-3 px-4 rounded-xl transition-all font-bold text-sm shadow-sm ${!useZip ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
                  }`}
              >
                {t('location.useMyLocation')}
              </button>
              <button
                onClick={() => setUseZip(true)}
                className={`flex-1 py-3 px-4 rounded-xl transition-all font-bold text-sm shadow-sm ${useZip ? 'bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]' : 'bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10'
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
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 focus:border-blue-400/50 focus:bg-white/10 focus:outline-none text-white placeholder-slate-400 font-bold tracking-wide"
                  maxLength={10}
                />
                <GlassButton
                  variant="primary"
                  size="lg"
                  onClick={async () => {
                    console.log('ZIP search button clicked with:', zipCode);
                    if (onZipCodeSearch && zipCode) {
                      console.log('Calling onZipCodeSearch...');
                      await onZipCodeSearch(zipCode);
                    } else {
                      console.log('No onZipCodeSearch or empty zipCode');
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

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-300 text-sm font-bold tracking-wide ${error ? 'block' : 'hidden'}`}
          >
            {error}
          </motion.div>

          <GlassButton
            variant="primary"
            size="lg"
            onClick={onRequestLocation}
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

          <p className="text-xs text-slate-500 mt-6 font-bold uppercase tracking-widest">
            {t('location.hint')}
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

