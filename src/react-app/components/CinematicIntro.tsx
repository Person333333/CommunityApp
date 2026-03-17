import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useAnimate, useMotionValue, useSpring, useTransform, stagger } from 'framer-motion';

interface CinematicIntroProps {
  onComplete: () => void;
}

const CinematicIntro: React.FC<CinematicIntroProps> = ({ onComplete }) => {
  const [scope, animate] = useAnimate();
  const [phase, setPhase] = useState(1);
  
  // Mouse tracking for parallax
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Smoothing springs for the orb magnetic effect
  const springConfig = { damping: 20, stiffness: 150 };
  const orbX = useSpring(useTransform(mouseX, [-500, 500], [-30, 30]), springConfig);
  const orbY = useSpring(useTransform(mouseY, [-500, 500], [-30, 30]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX - window.innerWidth / 2);
      mouseY.set(e.clientY - window.innerHeight / 2);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const runSequence = async () => {
      // Phase 1: The Void & The Spark (0s - 1.5s)
      // Visuals are handled by initial state and Framer Motion components
      await new Promise(resolve => setTimeout(resolve, 1500));
      setPhase(2);

      // Phase 2: The Chromic Shatter (1.5s - 2.5s)
      await animate(
        ".intro-pill",
        { 
          scale: [0, 1],
          opacity: [0, 1],
          x: (i: number) => (i % 2 === 0 ? 300 : -300) * Math.random(),
          y: (i: number) => (i < 3 ? 300 : -300) * Math.random(),
          rotate: (i: number) => i * 45
        } as any,
        { 
          duration: 1.2, 
          type: "spring", 
          damping: 12, 
          stiffness: 100,
          delay: (i: number) => i * 0.1 
        }
      );
      setPhase(3);

      // Phase 3: The Headline Eruption (2.0s - 3.5s)
      await animate(
        ".char",
        { y: [40, 0], opacity: [0, 1], rotateX: [20, 0] } as any,
        { duration: 0.8, delay: stagger(0.05), ease: "easeOut" }
      );
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase(4);

      // Phase 4: Integration/Completion
      onComplete();
    };

    runSequence();
  }, [animate, onComplete]);

  const pillVariants = {
    float: (i: number) => ({
      y: [0, -20, 0],
      rotate: [i * 45, i * 45 + 5, i * 45],
      transition: {
        duration: 5 + i,
        repeat: Infinity,
        ease: "easeInOut"
      }
    })
  } as any;

  const text = "Discover Your Community";
  const words = text.split(" ");

  return (
    <motion.div
      ref={scope}
      id="cinematic-intro"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050505] overflow-hidden"
      exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
    >
      {/* Phase 1 & 2: The Central Orb and Shattered Pills */}
      <AnimatePresence>
        {phase <= 2 && (
          <motion.div
            className="absolute z-10"
            style={{ x: orbX, y: orbY }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 2, opacity: 0, filter: "blur(40px)" }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#B4C4FF] to-[#FFB6C1] blur-[60px] opacity-80 animate-pulse" />
            <div className="absolute inset-0 w-48 h-48 rounded-full bg-white/20 blur-xl" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Background Chromic Glass Pills */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          custom={i}
          variants={pillVariants}
          animate="float"
          className="intro-pill absolute w-64 h-24 rounded-full bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center overflow-hidden"
          style={{ 
            boxShadow: 'inset 0 0 20px rgba(255, 255, 255, 0.05), 0 10px 40px rgba(0, 0, 0, 0.5)',
            opacity: 0
          }}
        >
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </motion.div>
      ))}

      {/* Phase 3: Headline Eruption */}
      <div className="relative z-20 text-center select-none pointer-events-none">
        <div className="flex flex-wrap justify-center gap-x-6 overflow-hidden py-4">
          {words.map((word, wIdx) => (
            <span key={wIdx} className="inline-block whitespace-nowrap">
              {word.split("").map((char, cIdx) => (
                <motion.span
                  key={cIdx}
                  className="char inline-block text-7xl md:text-9xl font-bold tracking-tighter text-white"
                  style={{ opacity: 0 }}
                >
                  {char}
                </motion.span>
              ))}
            </span>
          ))}
        </div>
        
        {/* Gradient emphasis with shine effect */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={phase >= 3 ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 1, duration: 1 }}
          className="relative mt-4 inline-block"
        >
          <span className="text-3xl md:text-5xl font-medium tracking-tight bg-gradient-to-r from-[#B4C4FF] via-[#FFB6C1] to-[#B4C4FF] bg-[length:200%_auto] bg-clip-text text-transparent animate-gradient-shine">
            Elevate Your Reach.
          </span>
        </motion.div>
      </div>

      {/* Grid Pattern overlay */}
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none dot-grid-pattern" />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes gradient-shine {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-shine {
          animation: gradient-shine 6s linear infinite;
        }
        .dot-grid-pattern {
          background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0);
          background-size: 32px 32px;
        }
      `}} />
    </motion.div>
  );
};

export default CinematicIntro;
