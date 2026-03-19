import { motion, useScroll, useTransform, useSpring, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router';
import { Heart, Users, Leaf, Lightbulb, Compass, Quote, Sparkles } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import FlipCard from '@/react-app/components/FlipCard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/react-app/hooks/useTheme';
import aboutLight from '../assets/hero/about-light.png';
import aboutDark from '../assets/hero/about-dark.png';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.8, ease: "easeOut" }
};

function StickyCompassSection() {
  const containerRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 2, 4]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 720]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const lineOpacity = useTransform(scrollYProgress, [0.8, 0.95], [0, 1]);
  
  // Needle specific rotation to end horizontal
  const needleRotate = useTransform(scrollYProgress, [0, 1], [0, 720 + 90]);

  return (
    <section ref={containerRef} className="relative h-[200vh] bg-background">
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div 
          style={{ scale: shouldReduceMotion ? 1 : scale, rotate: shouldReduceMotion ? 0 : rotate, opacity }}
          className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center"
        >
          {/* Outer Ring */}
          <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
          <div className="absolute inset-2 border border-primary/10 rounded-full" />
          
          {/* Inner Compass Needle Container */}
          <motion.div 
            style={{ rotate: shouldReduceMotion ? 90 : needleRotate }}
            className="w-full h-full relative"
          >
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1/2 bg-gradient-to-t from-primary to-primary-green rounded-t-full" />
             <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1/2 bg-gradient-to-b from-primary/40 to-muted rounded-b-full" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full z-10" />
          </motion.div>

          <Compass className="absolute inset-0 m-auto w-12 h-12 text-primary opacity-20" />
        </motion.div>

        {/* The Horizontal Line that forms at the end */}
        <motion.div 
          style={{ opacity: shouldReduceMotion ? 1 : lineOpacity }}
          className="absolute w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent bottom-[20%]"
        />
        
        <motion.div
           style={{ opacity: lineOpacity }}
           className="mt-12 text-center px-4"
        >
           <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/40">Alignment Achieved</p>
        </motion.div>
      </div>
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
      className={`min-h-screen overflow-x-hidden bg-background selection:bg-primary/20 transition-all duration-700`} 
      style={{ perspective: "1200px" }}
    >
      {/* Hero Section with Theme-aware Background */}
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
            <div className="inline-flex items-center gap-2 mb-6 group justify-center">
               <div className="p-3 rounded-2xl bg-primary/10 border border-primary/20 backdrop-blur-md shadow-inner group-hover:scale-110 transition-transform">
                  <Compass className="w-8 h-8 text-primary" />
               </div>
            </div>
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/5 border border-primary/10 mb-8 md:mb-12 shadow-sm backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-primary opacity-50" />
              <span className="text-[10px] text-primary/60 tracking-[0.2em] font-black uppercase">
                {t('about.hero.badge')}
              </span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black mb-6 md:mb-8 tracking-tighter leading-[0.9] uppercase text-foreground">
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

      <StickyCompassSection />

      <div className="container mx-auto max-w-6xl py-16 px-4 sm:px-6 lg:px-8">

        {/* Our Vision & Mission - Clean Scroll Reveal */}
        <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <div>
            <GlassCard variant="strong" className="p-0 h-[320px] overflow-hidden relative shadow-[0_0_30px_rgba(37,99,235,0.05)] border-border/50 group rounded-chromic-card">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                alt="Vision"
                className="w-full h-full object-cover grayscale mix-blend-luminosity opacity-40 group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-matte-blue/80 dark:bg-slate-900/60 p-8 flex flex-col justify-end text-foreground dark:text-white backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all duration-700">
                <Compass className="w-12 h-12 text-primary mb-4 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-2 drop-shadow-sm">{t('about.vision')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-300 font-bold leading-relaxed line-clamp-2">
                  {t('about.visionText')}
                </p>
              </div>
            </GlassCard>
          </div>

          <div>
            <GlassCard variant="strong" className="p-0 h-[320px] overflow-hidden relative shadow-[0_0_30px_rgba(16,185,129,0.05)] border-border/50 group rounded-chromic-card">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                alt="Mission"
                className="w-full h-full object-cover grayscale mix-blend-luminosity opacity-40 group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-matte-green/80 dark:bg-slate-900/60 p-8 flex flex-col justify-end text-foreground dark:text-white backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all duration-700">
                <Heart className="w-12 h-12 text-primary-green mb-4 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-2 drop-shadow-sm">{t('about.mission')}</h2>
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-slate-300 font-bold leading-relaxed line-clamp-2">
                  {t('about.missionText')}
                </p>
              </div>
            </GlassCard>
          </div>
        </motion.div>

        {/* Research & Community Need Section */}
        <div className="section-divider mx-auto max-w-md mb-12 opacity-20" />
        <motion.section variants={fadeInUp} className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-foreground mb-4 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{t('about.methodology.title')}</h2>
            <div className="w-24 h-1 bg-white/20 mx-auto rounded-full mb-6" />
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">{t('about.methodology.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                step: "1",
                title: t('about.methodology.challenge.title'),
                text: t('about.methodology.challenge.content'),
                subtext: "TSA Webmaster Research",
                color: "blue"
              },
              {
                step: "2",
                title: t('about.methodology.solution.title'),
                text: t('about.methodology.solution.content'),
                subtext: "Community Compass Solution",
                color: "indigo"
              }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
                className="h-full"
              >
                <GlassCard variant="strong" className={`p-10 h-full backdrop-blur-md bg-card border-border shadow-[0_0_30px_rgba(255,255,255,0.03)] group transition-all rounded-chromic-card \${item.color === 'blue' ? 'hover:shadow-[0_0_30px_rgba(96,165,250,0.15)] hover:border-blue-400/30' : 'hover:shadow-[0_0_30px_rgba(129,140,248,0.15)] hover:border-indigo-400/30'}`}>
                  <div className="flex items-start gap-6">
                    <div className={`shrink-0 w-14 h-14 rounded-2xl bg-background/50 backdrop-blur border border-border text-foreground flex items-center justify-center text-xl font-black shadow-lg \${item.color === 'blue' ? 'shadow-blue-500/10 text-blue-600 dark:text-blue-300' : 'shadow-indigo-500/10 text-indigo-600 dark:text-indigo-300'}`}>
                      {item.step}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black mb-4 tracking-tight \${item.color === 'blue' ? 'text-blue-300' : 'text-indigo-300'}`}>
                        {item.title}
                      </h3>
                      <div className="space-y-4 text-slate-300 font-bold leading-relaxed">
                        <p>{item.text}</p>
                        <p className="text-sm opacity-60 italic">{item.subtext}</p>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Our Values Section - 3D Reveal */}
        <motion.section variants={fadeInUp} className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl font-black text-foreground mb-4 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{t('about.values.title')}</h2>
            <div className="w-20 h-1 bg-border/40 mx-auto mb-6" />
            <p className="text-slate-400 font-black tracking-[0.3em] text-xs uppercase">{t('about.values.subtitle')}</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                title: "Sustainability",
                icon: <Leaf className="w-16 h-16 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />,
                text: t('about.sustainabilityText'),
                color: "emerald"
              },
              {
                title: "Community",
                icon: <Users className="w-16 h-16 text-blue-400 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />,
                text: t('about.communityText'),
                color: "blue"
              },
              {
                title: "Innovation",
                icon: <Lightbulb className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]" />,
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
                <Quote className="w-16 h-16 text-blue-500 mb-8 opacity-20 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                <h3 className="text-4xl sm:text-5xl font-black text-foreground mb-8 leading-tight tracking-tighter uppercase italic drop-shadow-md">{t('about.founder.subtitle')}</h3>
                <div className="space-y-6 text-slate-300 leading-relaxed text-xl font-bold italic">
                  <p className="drop-shadow-sm">
                    "{t('about.founder.quote1')}"
                  </p>
                  <p className="text-lg font-bold text-slate-400 not-italic">
                    {t('about.founder.quote2')}
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.section>

        {/* Removed CommunityMorpher per user request */}

        {/* Call to Action */}
        <motion.section variants={fadeInUp} className="text-center">
          <div className="bg-matte-green/40 dark:bg-emerald-500/5 backdrop-blur-xl border border-primary-green/30 rounded-[3rem] p-12 sm:p-20 shadow-2xl relative overflow-hidden text-foreground">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 pointer-events-none" />
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none mix-blend-screen">
              <Compass className="w-64 h-64 text-blue-300" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black mb-6 text-foreground uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10">
              {t('about.footer.title')}
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-blue-200 font-bold italic relative z-10">
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
      className="relative z-10"
    >
      <FlipCard
        heightClass="h-[360px]"
        front={
          <GlassCard variant="strong" className={`p-10 w-full h-full text-center flex flex-col items-center justify-center border-border shadow-[0_0_30px_rgba(0,0,0,0.1)] relative overflow-hidden bg-card backdrop-blur-md hover:bg-card/90 transition-colors rounded-chromic-card group`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-${value.color}-400 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
            <div className="mb-6 transform group-hover:scale-110 transition-transform duration-500">
              {value.icon}
            </div>
            <h3 className={`text-3xl font-black uppercase tracking-tighter text-foreground group-hover:text-${value.color}-600 dark:group-hover:text-${value.color}-300 transition-colors drop-shadow-sm`}>
              {value.title}
            </h3>
            <p className="mt-6 text-[10px] font-black tracking-[0.3em] uppercase text-muted-foreground group-hover:text-foreground transition-colors uppercase">Tap to Reveal</p>
          </GlassCard>
        }
        back={
          <GlassCard variant="strong" className={`p-8 w-full h-full text-center flex flex-col items-center justify-center border-${value.color}-400/50 shadow-[0_0_40px_rgba(16,185,129,0.1)] relative overflow-hidden bg-card/90 backdrop-blur-xl border-2 rounded-chromic-card`}>
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-${value.color}-400 shadow-[0_0_10px_rgba(255,255,255,0.1)]`} />
            <p className={`text-xl font-bold text-foreground italic leading-relaxed drop-shadow-sm`}>
              "{value.text}"
            </p>
          </GlassCard>
        }
      />
    </motion.div>
  );
}
