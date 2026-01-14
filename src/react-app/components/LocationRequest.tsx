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
            <MapPin className="w-16 h-16 text-teal-400 mx-auto" />
          </motion.div>

          <h2 className="text-3xl font-bold text-slate-100 mb-4">
            {t('location.title')}
          </h2>

          <p className="text-slate-300 mb-6">
            {t('location.description')}
          </p>

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

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-rose-500/20 border border-rose-400/30 rounded-lg text-rose-200 text-sm"
            >
              {error}
            </motion.div>
          )}

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

          <p className="text-xs text-slate-400 mt-4">
            {t('location.hint')}
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

