import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimate, stagger } from 'framer-motion';
import { Compass } from 'lucide-react';

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [scope, animate] = useAnimate();
  const [phase, setPhase] = useState(1);
  
  useEffect(() => {
    const runSequence = async () => {
      // Phase 1: The Dot appears (0s - 1.0s)
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase(2);

      // Phase 2: Dot expands and morphs into Compass (1.0s - 2.5s)
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase(3);

      // Phase 3: The Headline Eruption and Compass spins/zooms (2.5s - 4.0s)
      if (scope.current && document.querySelector(".char")) {
        await animate(
          ".char",
          { y: [40, 0], opacity: [0, 1], rotateX: [20, 0] } as any,
          { duration: 0.8, delay: stagger(0.05), ease: "easeOut" }
        );
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase(4);

      // Phase 4: Integration/Completion
      onComplete();
    };

    runSequence();
  }, [animate, onComplete]);

  const text = "Community Compass";
  const words = text.split(" ");

  return (
    <motion.div
      ref={scope}
      id="cinematic-intro"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
    >
      <AnimatePresence mode="wait">
        {phase === 1 && (
          <motion.div
            key="dot"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-4 h-4 rounded-full bg-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.8)]"
          />
        )}
        
        {phase === 2 && (
          <motion.div
            key="compass-morph"
            initial={{ scale: 0.1, rotate: -180, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: 1.2, type: "spring", bounce: 0.4 }}
            className="text-emerald-500 drop-shadow-[0_0_40px_rgba(16,185,129,0.5)]"
          >
            <Compass className="w-32 h-32" strokeWidth={1.5} />
          </motion.div>
        )}

        {phase === 3 && (
          <motion.div
            key="compass-spin-up"
            initial={{ scale: 1, y: 0 }}
            animate={{ scale: 0.6, y: -60, rotate: 360 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-emerald-500 flex flex-col items-center"
          >
            <Compass className="w-32 h-32 drop-shadow-[0_0_30px_rgba(16,185,129,0.4)]" strokeWidth={1.5} />
            
            <div className="relative z-20 text-center select-none pointer-events-none mt-8">
              <div className="flex flex-wrap justify-center gap-x-4 overflow-hidden py-4">
                {words.map((word, wIdx) => (
                  <span key={wIdx} className="inline-block whitespace-nowrap">
                    {word.split("").map((char, cIdx) => (
                      <motion.span
                        key={cIdx}
                        className="char inline-block text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-foreground uppercase"
                        style={{ opacity: 0 }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </span>
                ))}
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 1 }}
                className="relative mt-2 inline-block"
              >
                <div className="w-32 h-1 bg-gradient-to-r from-emerald-400 to-teal-400 mx-auto rounded-full shadow-[0_0_15px_rgba(52,211,153,0.5)]" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 opacity-[0.03] pointer-events-none dot-grid-pattern" />
    </motion.div>
  );
};

export default CinematicIntro;
