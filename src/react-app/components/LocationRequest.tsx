import { motion } from 'framer-motion';
import { MapPin, RefreshCw } from 'lucide-react';
import GlassCard from './GlassCard';
import GlassButton from './GlassButton';

interface LocationRequestProps {
  onRequestLocation: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function LocationRequest({ onRequestLocation, loading = false, error = null }: LocationRequestProps) {
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
            Location Access Required
          </h2>
          
          <p className="text-slate-300 mb-6">
            We need your location to show you local community resources near you. 
            Your location data is only used to filter resources and is never stored or shared.
          </p>
          
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
                Requesting Location...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Allow Location Access
              </span>
            )}
          </GlassButton>
          
          <p className="text-xs text-slate-400 mt-4">
            Click the button above to enable location services
          </p>
        </GlassCard>
      </motion.div>
    </div>
  );
}

