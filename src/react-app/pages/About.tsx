import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router';
import { Users, Leaf, Lightbulb, Compass, Quote, Sparkles } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/react-app/hooks/useTheme';
import aboutLight from '../assets/hero/about-light.png';
import aboutDark from '../assets/hero/about-dark.png';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

function StickyAboutStory() {
  const containerRef = useRef<HTMLElement>(null);
  const { t } = useTranslation();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 30,
    restDelta: 0.001
  });

  // Phases of animation:
  // 0.00 - 0.30: Spins 3 times (1080 deg) + 90 deg = 1170 deg. Scales up.
  // 0.30 - 0.35: Pauses horizontally.
  // 0.35 - 0.45: Needle stretches out into a glowing horizontal connecting line.
  // 0.45 - 0.60: Content fades in (Methodology drops down, Challenge/Solution slide in from sides).
  // 0.85 - 1.00: Content fades out.

  // Spin & basic compass elements opacity
  const compassOpacity = useTransform(smoothProgress, [0, 0.05], [0, 1]);
  const ringOpacity = useTransform(smoothProgress, [0.15, 0.25], [1, 0]);
  const needleRotate = useTransform(smoothProgress, [0, 0.3], [0, 1170]);
  const compassScale = useTransform(smoothProgress, [0, 0.3], [1, 1.5]);

  // The needle remains its normal size, just acting as a pointer
  // Local X is vertical on screen, local Y is horizontal.
  const needleScaleX = useTransform(smoothProgress, [0.35, 0.45], [1, 1]);
  const needleScaleY = useTransform(smoothProgress, [0.35, 0.45], [1, 1.2]); // slightly scale for emphasis

  // Center circle scales up slightly
  const centerCircleScale = useTransform(smoothProgress, [0.35, 0.45], [1, 1.2]);

  // Content appearing
  const contentOpacity = useTransform(smoothProgress, [0.45, 0.55], [0, 1]);
  const methodologyY = useTransform(smoothProgress, [0.45, 0.60], [-60, 0]);
  
  // Cards sliding in from edges
  const challengeX = useTransform(smoothProgress, [0.45, 0.60], [-100, 0]);
  const solutionX = useTransform(smoothProgress, [0.45, 0.60], [100, 0]);
  
  // Overall section fade out before next section
  const sectionOpacity = useTransform(smoothProgress, [0.85, 0.95], [1, 0]);

  // Scroll indicator
  const indicatorOpacity = useTransform(smoothProgress, [0.1, 0.2], [1, 0]);

  return (
    <section ref={containerRef} className="relative h-[250vh] bg-background">
      <motion.div style={{ opacity: sectionOpacity }} className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Animated Compass Core */}
        <motion.div 
          style={{ 
            scale: compassScale, 
            opacity: compassOpacity
          }}
          className="absolute inset-0 m-auto w-32 h-32 md:w-56 md:h-56 flex items-center justify-center z-10"
        >
          {/* Outer Rings */}
          <motion.div style={{ opacity: ringOpacity }} className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <motion.div style={{ opacity: ringOpacity }} className="absolute inset-2 border border-primary/10 rounded-full" />
          <motion.div style={{ opacity: ringOpacity }}>
            <Compass className="absolute inset-0 m-auto w-12 h-12 text-primary opacity-20" />
          </motion.div>
          
          {/* Inner Compass Needle (Points left and right) */}
          <motion.div 
            style={{ 
              rotate: needleRotate,
              scaleX: needleScaleX,
              scaleY: needleScaleY,
            }}
            className="absolute m-auto w-1.5 h-full rounded-full overflow-hidden shadow-[0_0_20px_rgba(59,130,246,0.5)]"
          >
             {/* The glowing gradients pointing to the boxes */}
             <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-t from-primary to-primary-green" />
             <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-b from-primary/40 to-emerald-400" />
          </motion.div>

          {/* Center Pivot */}
          <motion.div 
            style={{ scale: centerCircleScale }}
            className="absolute z-20 flex items-center justify-center"
          >
            <div className="w-5 h-5 bg-background border-4 border-primary rounded-full shadow-[0_0_15px_rgba(59,130,246,0.7)]" />
          </motion.div>

        </motion.div>

        {/* The Methodology Content */}
        <motion.section
            style={{ opacity: contentOpacity }}
            className="absolute z-30 w-full max-w-7xl px-4 md:px-8 xl:px-12 pointer-events-auto flex flex-col items-center justify-center h-full"
        >
            <motion.div style={{ y: methodologyY }} className="absolute top-[8%] md:top-[12%] text-center">
               <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-foreground mb-4 tracking-tighter uppercase">{t('about.methodology.title')}</h2>
               <div className="w-32 h-1.5 bg-primary/40 mx-auto rounded-full mb-6" />
               <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-sm">{t('about.methodology.subtitle')}</p>
            </motion.div>

            <div className="w-full flex flex-col md:flex-row items-center justify-between gap-8 lg:gap-10 mt-32 xl:mt-40">
              {/* Challenge Box */}
              <motion.div style={{ x: challengeX }} className="w-full md:w-[38%] xl:w-[35%]">
                <GlassCard variant="strong" className="p-8 lg:p-12 backdrop-blur-xl bg-background/60 border border-blue-500/30 shadow-[0_0_50px_rgba(96,165,250,0.15)] rounded-[2.5rem] group hover:border-blue-500/50 transition-all duration-500 h-full">
                  <div className="flex flex-col xl:flex-row items-start gap-6 h-full">
                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-2xl font-black shadow-inner text-blue-500 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      1
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-black mb-4 tracking-tight text-blue-500 uppercase">
                        {t('about.methodology.challenge.title')}
                      </h3>
                      <div className="space-y-4 text-foreground/80 font-bold leading-relaxed text-lg">
                        <p>{t('about.methodology.challenge.content')}</p>
                        <p className="text-sm opacity-60 italic tracking-widest uppercase">TSA Webmaster Research</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>

              {/* Solution Box */}
              <motion.div style={{ x: solutionX }} className="w-full md:w-[38%] xl:w-[35%]">
                <GlassCard variant="strong" className="p-8 lg:p-12 backdrop-blur-xl bg-background/60 border border-indigo-500/30 shadow-[0_0_50px_rgba(129,140,248,0.15)] rounded-[2.5rem] group hover:border-indigo-500/50 transition-all duration-500 h-full">
                  <div className="flex flex-col xl:flex-row items-start gap-6 h-full">
                    <div className="shrink-0 w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-2xl font-black shadow-inner text-indigo-500 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
                      2
                    </div>
                    <div>
                      <h3 className="text-2xl lg:text-3xl font-black mb-4 tracking-tight text-indigo-500 uppercase">
                        {t('about.methodology.solution.title')}
                      </h3>
                      <div className="space-y-4 text-foreground/80 font-bold leading-relaxed text-lg">
                        <p>{t('about.methodology.solution.content')}</p>
                        <p className="text-sm opacity-60 italic tracking-widest uppercase">Community Compass Solution</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </div>
          </motion.section>

        {/* Scroll Indicator */}
        <motion.div
           style={{ opacity: indicatorOpacity }}
           className="absolute bottom-10 text-center px-4"
        >
           <p className="text-[10px] font-black uppercase tracking-[0.8em] text-primary/40 animate-pulse">
             Scroll Inside
           </p>
        </motion.div>
      </motion.div>
    </section>
  );
}

export default function About() {
  const { t } = useTranslation();
  const { isLight } = useTheme();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={`min-h-screen bg-background selection:bg-primary/20 transition-all duration-700`}
    >
      {/* Hero Section */}
      <section className="relative h-screen w-full overflow-hidden flex items-center justify-center pt-20">
        <div className="absolute inset-0 z-0">
          <img 
            src={isLight ? aboutLight : aboutDark} 
            alt="Community Collaboration" 
            className="w-full h-full object-cover opacity-30 grayscale-[20%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/60 to-background" />
        </div>
        <div className="relative z-10 container mx-auto px-4 md:px-6 text-center pt-32">
          <motion.div variants={fadeInUp} className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/10 mb-8 md:mb-12 shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-primary opacity-50" />
              <span className="text-[10px] text-primary/60 tracking-[0.2em] font-black uppercase">
                {t('about.hero.badge')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-6 md:mb-8 tracking-tighter leading-[0.9] uppercase text-foreground">
              Community<br />
              <span className="text-primary-green drop-shadow-sm">Compass</span>
            </h1>
            <div className="max-w-3xl mx-auto">
              <p className="text-base sm:text-lg lg:text-xl text-muted-foreground/80 mx-auto font-bold italic leading-relaxed mb-12">
                {t('about.hero.subtitle')}
              </p>
              <div className="flex justify-center">
                <div 
                  className="flex flex-col items-center gap-4 cursor-pointer group"
                  onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                >
                  <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground group-hover:text-foreground transition-colors">
                    {t('about.hero.scroll')}
                  </span>
                  <motion.div
                    animate={{ y: [0, 5, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-background/50 backdrop-blur-md"
                  >
                    <Compass className="w-6 h-6 text-primary" />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <StickyAboutStory />

      <div className="container mx-auto max-w-6xl py-16 px-4 sm:px-6 lg:px-8">
        {/* Research & Community Need Section moved inside StickyAboutStory */}

        {/* Our Values Section */}
        <motion.section variants={fadeInUp} className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-3xl sm:text-4xl font-black text-foreground mb-4 tracking-tighter uppercase">{t('about.values.title')}</h2>
            <div className="w-20 h-1 bg-border/40 mx-auto mb-6" />
            <p className="text-muted-foreground font-black tracking-[0.3em] text-xs uppercase">{t('about.values.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Sustainability",
                icon: <Leaf className="w-16 h-16 text-emerald-400" />,
                text: t('about.sustainabilityText'),
                color: "emerald"
              },
              {
                title: "Community",
                icon: <Users className="w-16 h-16 text-blue-400" />,
                text: t('about.communityText'),
                color: "blue"
              },
              {
                title: "Innovation",
                icon: <Lightbulb className="w-16 h-16 text-amber-400" />,
                text: t('about.innovationText'),
                color: "amber"
              }
            ].map((value, idx) => (
              <ValueCard key={idx} value={value} />
            ))}
          </div>
        </motion.section>

        {/* Founder's Story */}
        <motion.section variants={fadeInUp} className="mb-32">
          <GlassCard variant="strong" className="p-0 overflow-hidden bg-card/40 border-border shadow-[0_0_50px_rgba(0,0,0,0.05)] rounded-[3rem] backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 relative bg-background overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                  alt="Founder Alex Rivera"
                  className="w-full h-full object-cover min-h-[500px] grayscale mix-blend-luminosity opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-8 left-8 p-8 bg-card/90 backdrop-blur-xl rounded-[2.5rem] border border-border/50 shadow-xl">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-1 h-8 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                    <h4 className="text-2xl font-black text-foreground tracking-widest uppercase">{t('about.founder.title')}</h4>
                  </div>
                  <p className="text-blue-300 font-black uppercase tracking-[0.4em] text-[10px] ml-5">{t('about.founder.role')}</p>
                </div>
              </div>
              <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center relative bg-background/60 backdrop-blur-md border-l border-border/50">
                <Quote className="w-16 h-16 text-blue-500 mb-8 opacity-20" />
                <h3 className="text-4xl sm:text-5xl font-black text-foreground mb-8 leading-tight tracking-tighter uppercase italic">{t('about.founder.subtitle')}</h3>
                <div className="space-y-6 text-foreground leading-relaxed text-xl font-bold italic">
                  <p>"{t('about.founder.quote1')}"</p>
                  <p className="text-lg font-bold text-foreground/80 not-italic">{t('about.founder.quote2')}</p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* Call to Action */}
        <motion.section variants={fadeInUp} className="text-center">
          <div className="bg-primary/10 border border-primary/20 rounded-[3rem] p-12 sm:p-20 shadow-2xl relative overflow-hidden text-foreground">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 pointer-events-none" />
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none mix-blend-screen">
              <Compass className="w-64 h-64 text-blue-300" />
            </div>
            <h2 className="text-3xl sm:text-5xl font-black mb-6 text-foreground uppercase tracking-tighter relative z-10">
              {t('about.footer.title')}
            </h2>
            <p className="text-lg mb-12 max-w-2xl mx-auto leading-relaxed text-foreground/80 font-bold italic relative z-10">
              {t('about.footer.subtitle')}
            </p>
            <div className="flex justify-center relative z-10">
              <Link to="/submit">
                <GlassButton variant="primary" className="bg-emerald-600/80 backdrop-blur border border-emerald-400/50 shadow-[0_0_20px_rgba(16,185,129,0.3)] !text-white font-black uppercase tracking-widest px-12 h-16 rounded-chromic-pill hover:bg-emerald-500 hover:scale-105 transition-all">
                  {t('about.submitResource')}
                </GlassButton>
              </Link>
            </div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}

function ValueCard({ value }: { value: any }) {
  const cardRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"]
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [45, 0, 0, -45]);
  const rotateY = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [20, 0, 0, -20]);
  const scale = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [0.8, 1, 1, 0.8]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

  const smoothX = useSpring(rotateX, { stiffness: 100, damping: 30 });
  const smoothY = useSpring(rotateY, { stiffness: 100, damping: 30 });
  const smoothScale = useSpring(scale, { stiffness: 100, damping: 30 });

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX: smoothX,
        rotateY: smoothY,
        scale: smoothScale,
        opacity,
        transformStyle: "preserve-3d",
      }}
      className="relative z-10 group"
    >
      <GlassCard 
        variant="strong" 
        className="p-12 w-full h-[400px] text-left flex flex-col items-start justify-between border-border shadow-2xl relative overflow-hidden bg-card/40 backdrop-blur-2xl rounded-[2.5rem] transition-all duration-500 group-hover:border-primary/50 group-hover:shadow-primary/10"
      >
        <div className={`absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-${value.color}-500 to-transparent opacity-30 group-hover:opacity-100 transition-opacity`} />
        
        <div className="space-y-6">
          <div className={`p-4 rounded-2xl bg-${value.color}-500/10 border border-${value.color}-500/20 w-fit transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 shadow-inner`}>
            {value.icon}
          </div>
          <h3 className="text-4xl font-black uppercase tracking-tighter text-foreground leading-none">
            {value.title}
          </h3>
          <div className="w-12 h-1 bg-primary/20 group-hover:w-24 group-hover:bg-primary transition-all duration-700" />
        </div>

        <p className="text-lg font-bold text-muted-foreground/80 leading-relaxed italic pr-4 group-hover:text-foreground transition-colors duration-500">
          "{value.text}"
        </p>

        <div className="absolute top-8 right-8 mix-blend-overlay opacity-5 group-hover:opacity-20 transition-opacity duration-1000">
          {value.icon}
        </div>
      </GlassCard>
    </motion.div>
  );
}
