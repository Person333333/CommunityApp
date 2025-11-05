import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function AnimatedCompass() {
  const { scrollY } = useScroll();
  const rotate = useTransform(scrollY, [0, 500], [0, 180]);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          setHeading(360 - event.alpha);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, []);

  return (
    <motion.div
      className="relative w-64 h-64 mx-auto"
      style={{ rotate }}
    >
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full glass-strong border-2 border-teal-400/30">
        {/* Cardinal directions */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-teal-300 font-bold text-lg">
          N
        </div>
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-400 font-medium">
          S
        </div>
        <div className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
          W
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
          E
        </div>
      </div>

      {/* Middle ring */}
      <motion.div
        className="absolute inset-8 rounded-full glass-teal border border-teal-400/20"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-3 bg-teal-400/40"
            style={{
              top: '5px',
              left: '50%',
              transformOrigin: '50% 96px',
              transform: `translateX(-50%) rotate(${i * 30}deg)`,
            }}
          />
        ))}
      </motion.div>

      {/* Center compass needle */}
      <motion.div
        className="absolute inset-16 flex items-center justify-center"
        style={{ rotate: heading }}
      >
        <motion.div
          className="relative w-2 h-32"
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* North pointer */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderBottom: '60px solid #0f766e',
              filter: 'drop-shadow(0 0 10px rgba(15, 118, 110, 0.8))',
            }}
          />
          {/* South pointer */}
          <div 
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0"
            style={{
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '60px solid #ef4444',
            }}
          />
        </motion.div>
      </motion.div>

      {/* Center dot */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-teal-400 to-amber-500 shadow-lg shadow-teal-500/50" />

      {/* Animated particles */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-teal-400/30"
          style={{
            top: '50%',
            left: '50%',
            marginLeft: '-4px',
            marginTop: '-4px',
          }}
          animate={{
            x: [0, Math.cos(i * 60 * Math.PI / 180) * 150],
            y: [0, Math.sin(i * 60 * Math.PI / 180) * 150],
            opacity: [0.6, 0],
            scale: [1, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            delay: i * 0.5,
            ease: "easeOut",
          }}
        />
      ))}
    </motion.div>
  );
}
