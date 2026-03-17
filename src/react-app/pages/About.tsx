import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router';
import { Heart, Users, Leaf, Lightbulb, Compass, Quote, ChevronDown } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import FlipCard from '@/react-app/components/FlipCard';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();

  const textColor = useTransform(scrollY, [0, 500], ['#f8fafc', '#f8fafc']); // Slate 50
  const accentColor = useTransform(scrollY, [0, 500], ['#60a5fa', '#60a5fa']); // Blue 400

  return (
    <div className="min-h-screen overflow-x-hidden bg-transparent">
      {/* Full-Screen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1600"
            alt="Community Connection"
            className="w-full h-full object-cover scale-105 opacity-[0.15] mix-blend-luminosity"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/95 to-slate-950 z-10" />
        </div>

        <div className="container mx-auto max-w-6xl px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-6"
            style={{ color: textColor }}
          >
            <span className="inline-block px-4 py-2 bg-blue-500/10 backdrop-blur-md border border-blue-400/30 rounded-full text-blue-300 text-xs font-black uppercase tracking-[0.3em] mb-4 shadow-[0_0_15px_rgba(96,165,250,0.2)]">
              Our Story & Mission
            </span>
            <motion.h1
              className="text-6xl sm:text-7xl lg:text-9xl font-black mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)] tracking-tighter uppercase leading-[0.9] text-white"
            >
              Community <br />
              <motion.span style={{ color: accentColor }} className="drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]">Compass</motion.span>
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed italic font-bold drop-shadow-lg opacity-90 text-slate-300"
            >
              "From a simple idea to a neighborhood movement."
            </motion.p>
          </motion.div>

          {/* Scroll Down Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 1 }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-300 group cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 group-hover:opacity-100 transition-opacity">Scroll Down</span>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-md bg-white/5 hover:bg-white/20 transition-all animate-bounce-slow shadow-[0_0_15px_rgba(255,255,255,0.1)]">
              <ChevronDown className="w-5 h-5 text-white" />
            </div>
          </motion.button>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl py-16 px-4 sm:px-6 lg:px-8">

        {/* Our Vision & Mission - Clean Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard variant="strong" className="p-0 h-[320px] overflow-hidden relative shadow-[0_0_30px_rgba(37,99,235,0.15)] border-white/10 group rounded-chromic-card">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                alt="Vision"
                className="w-full h-full object-cover grayscale mix-blend-luminosity opacity-40 group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/60 p-8 flex flex-col justify-end text-white backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all duration-700">
                <Compass className="w-12 h-12 text-blue-400 mb-4 drop-shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-2 drop-shadow-md">{t('about.vision')}</h2>
                <p className="text-xs sm:text-sm text-slate-300 font-bold leading-relaxed line-clamp-2">
                  {t('about.visionText')}
                </p>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassCard variant="strong" className="p-0 h-[320px] overflow-hidden relative shadow-[0_0_30px_rgba(16,185,129,0.15)] border-white/10 group rounded-chromic-card">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                alt="Mission"
                className="w-full h-full object-cover grayscale mix-blend-luminosity opacity-40 group-hover:grayscale-0 group-hover:opacity-70 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-slate-900/60 p-8 flex flex-col justify-end text-white backdrop-blur-[2px] group-hover:backdrop-blur-none transition-all duration-700">
                <Heart className="w-12 h-12 text-emerald-400 mb-4 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-2 drop-shadow-md">{t('about.mission')}</h2>
                <p className="text-xs sm:text-sm text-slate-300 font-bold leading-relaxed line-clamp-2">
                  {t('about.missionText')}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Research & Community Need Section */}
        <div className="section-divider mx-auto max-w-md mb-12 opacity-20" />
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">{t('home.impact.title')} & Research</h2>
            <div className="w-24 h-1 bg-white/20 mx-auto rounded-full mb-6" />
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Data-driven approach to solving local challenges</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              {
                step: "1",
                title: "The Challenge",
                text: "According to our community assessment research, 68% of local residents reported difficulty finding reliable, up-to-date information regarding food pantries and support services.",
                subtext: "As part of the TSA Webmaster challenge, we recognized that existing solutions lacked interactivity, real-time updates, and broad accessibility.",
                color: "blue"
              },
              {
                step: "2",
                title: "Our Methodology",
                text: "We conducted robust research by reviewing over 50 regional resource boards and analyzing common user pain points: navigational complexity, mobile incompatibility, and language access.",
                subtext: "Community Compass was designed directly from this feedback, implementing an interactive Leaflet map, a user-driven submission system, and automated multilingual translation.",
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
                <GlassCard variant="strong" className={`p-10 h-full backdrop-blur-md bg-white/5 border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.03)] group transition-all rounded-chromic-card ${item.color === 'blue' ? 'hover:shadow-[0_0_30px_rgba(96,165,250,0.15)] hover:border-blue-400/30' : 'hover:shadow-[0_0_30px_rgba(129,140,248,0.15)] hover:border-indigo-400/30'}`}>
                  <div className="flex items-start gap-6">
                    <div className={`shrink-0 w-14 h-14 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-white flex items-center justify-center text-xl font-black shadow-lg ${item.color === 'blue' ? 'shadow-blue-500/20 text-blue-300' : 'shadow-indigo-500/20 text-indigo-300'}`}>
                      {item.step}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black mb-4 tracking-tight ${item.color === 'blue' ? 'text-blue-300' : 'text-indigo-300'}`}>
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
        </section>

        {/* Our Values Section - 3D Reveal */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl font-black text-white mb-4 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">Our Core Values</h2>
            <div className="w-20 h-1 bg-white/20 mx-auto mb-6" />
            <p className="text-slate-400 font-black tracking-[0.3em] text-xs uppercase">Guiding principles for community impact</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 perspective-lg">
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
        </section>

        {/* Founder's Story */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="mb-32"
        >
          <GlassCard variant="strong" className="p-0 overflow-hidden bg-transparent border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.05)] rounded-[3rem] backdrop-blur-xl">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 relative bg-slate-900 overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                  alt="Founder Alex Rivera"
                  className="w-full h-full object-cover min-h-[500px] grayscale mix-blend-luminosity opacity-50 group-hover:grayscale-0 group-hover:opacity-80 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/40 to-transparent" />
                <div className="absolute bottom-8 left-8 p-8 bg-white/5 backdrop-blur-xl rounded-[2rem] border border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-1 h-8 bg-blue-400 rounded-full shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
                    <h4 className="text-2xl font-black text-white tracking-widest uppercase">ALEX RIVERA</h4>
                  </div>
                  <p className="text-blue-300 font-black uppercase tracking-[0.4em] text-[10px] ml-5">Founder & Neighbor</p>
                </div>
              </div>
              <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center relative bg-white/5 backdrop-blur-md border-l border-white/10">
                <Quote className="w-16 h-16 text-blue-500 mb-8 opacity-20 drop-shadow-[0_0_10px_rgba(59,130,246,0.3)]" />
                <h3 className="text-4xl sm:text-5xl font-black text-white mb-8 leading-tight tracking-tighter uppercase italic drop-shadow-md">Inspired by Tradition,<br />Driven by Need</h3>
                <div className="space-y-6 text-slate-300 leading-relaxed text-xl font-bold italic">
                  <p className="drop-shadow-sm">
                    "Community Compass began with a simple observation: many of our neighbors were struggling to find help even when resources were right around the corner."
                  </p>
                  <p className="text-lg font-bold text-slate-400 not-italic">
                    I grew up believing that a community is only as strong as its most vulnerable member. After seeing the power of teamwork during local projects, I knew we needed a digital "compass" to point people toward support.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-slate-900/60 backdrop-blur-xl border border-blue-500/30 rounded-[3rem] p-12 sm:p-20 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/10 to-indigo-600/10 pointer-events-none" />
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none mix-blend-screen">
              <Compass className="w-64 h-64 text-blue-300" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black mb-6 text-white uppercase tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] relative z-10">
              Build the Future<br />Together
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-blue-200 font-bold italic relative z-10">
              Join the movement and help us bridge the gap between need and support. Every resource shared is a hand extended to someone in need.
            </p>
            <div className="flex justify-center relative z-10">
              <Link to="/submit">
                <GlassButton variant="primary" className="bg-blue-600/80 backdrop-blur border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.5)] !text-white font-black uppercase tracking-widest px-12 h-16 rounded-chromic-pill hover:bg-blue-500 hover:scale-105 transition-all">
                  {t('about.submitResource')}
                </GlassButton>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
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
          <GlassCard variant="strong" className={`p-10 w-full h-full text-center flex flex-col items-center justify-center border-${value.color}-500/30 shadow-[0_0_30px_rgba(0,0,0,0.5)] relative overflow-hidden bg-slate-900/80 backdrop-blur-md group-hover:bg-slate-800/90 transition-colors rounded-chromic-card`}>
            <div className={`absolute top-0 left-0 w-full h-1 bg-${value.color}-400 shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
            <div className="mb-6 transform hover:scale-110 transition-transform duration-500">
              {value.icon}
            </div>
            <h3 className={`text-3xl font-black uppercase tracking-tighter text-white group-hover:text-${value.color}-300 transition-colors drop-shadow-md`}>
              {value.title}
            </h3>
            <p className="mt-6 text-[10px] font-black tracking-[0.3em] uppercase text-slate-500 group-hover:text-slate-300 transition-colors">Tap to Reveal</p>
          </GlassCard>
        }
        back={
          <GlassCard variant="strong" className={`p-8 w-full h-full text-center flex flex-col items-center justify-center border-${value.color}-400/50 shadow-[0_0_40px_rgba(var(--color-${value.color}-500),0.2)] relative overflow-hidden bg-slate-950/90 backdrop-blur-xl border-2 rounded-chromic-card`}>
            <div className={`absolute bottom-0 left-0 w-full h-1 bg-${value.color}-400 shadow-[0_0_10px_rgba(255,255,255,0.5)]`} />
            <p className={`text-xl font-bold text-${value.color}-100 italic leading-relaxed drop-shadow-sm`}>
              "{value.text}"
            </p>
          </GlassCard>
        }
      />
    </motion.div>
  );
}
