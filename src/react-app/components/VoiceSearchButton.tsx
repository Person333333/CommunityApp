import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

interface VoiceSearchButtonProps {
  onResult: (text: string) => void;
  className?: string;
}

export default function VoiceSearchButton({ onResult, className = '' }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported] = useState(() => 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  const startListening = useCallback(() => {
    if (!supported) {
      alert('Voice search is not supported in this browser. Please use Chrome or Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setIsListening(false);
    };

    recognition.start();
  }, [supported, onResult]);

  if (!supported) return null;

  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={isListening ? undefined : startListening}
      className={`relative flex items-center justify-center rounded-full transition-all ${
        isListening
          ? 'bg-rose-500 text-white'
          : 'bg-slate-100 hover:bg-blue-100 text-slate-500 hover:text-blue-600'
      } ${className}`}
      aria-label={isListening ? 'Listening...' : 'Search by voice'}
      title={isListening ? 'Listening...' : 'Search by voice'}
    >
      {isListening && (
        <>
          <motion.div
            className="absolute inset-0 rounded-full bg-rose-400"
            animate={{ scale: [1, 1.6, 1], opacity: [0.5, 0, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
          <motion.div
            className="absolute inset-0 rounded-full bg-rose-300"
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
          />
        </>
      )}
      {isListening ? (
        <MicOff className="w-4 h-4 relative z-10" />
      ) : (
        <Mic className="w-4 h-4 relative z-10" />
      )}
    </motion.button>
  );
}
