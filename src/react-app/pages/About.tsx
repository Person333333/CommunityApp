import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router';
import { Heart, Users, Leaf, Lightbulb, Compass, Quote, ChevronDown } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();
  const { scrollY } = useScroll();

  const textColor = useTransform(scrollY, [0, 500], ['#0f172a', '#0f172a']); // Slate 900
  const subTextColor = useTransform(scrollY, [0, 500], ['#475569', '#64748b']); // Slate 600 -> 500
  const accentColor = useTransform(scrollY, [0, 500], ['#2563eb', '#2563eb']); // Blue 600

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Full-Screen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&q=80&w=1600"
            alt="Community Connection"
            className="w-full h-full object-cover scale-105 opacity-[0.4]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-white/50 to-white z-10" />
        </div>

        <div className="container mx-auto max-w-6xl px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="space-y-6"
            style={{ color: textColor }}
          >
            <span className="inline-block px-4 py-2 bg-blue-100/80 backdrop-blur-md border border-blue-200 rounded-full text-blue-800 text-xs font-black uppercase tracking-[0.3em] mb-4 shadow-sm">
              Our Story & Mission
            </span>
            <motion.h1
              className="text-6xl sm:text-7xl lg:text-9xl font-black mb-6 drop-shadow-2xl tracking-tighter uppercase leading-[0.9]"
            >
              Community <br />
              <motion.span style={{ color: accentColor }}>Compass</motion.span>
            </motion.h1>
            <motion.p
              className="text-xl sm:text-2xl max-w-3xl mx-auto leading-relaxed italic font-bold drop-shadow-lg opacity-90"
              style={{ color: subTextColor }}
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
            className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-800 group cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 group-hover:opacity-100 transition-opacity">Scroll Down</span>
            <div className="w-10 h-10 rounded-full border border-slate-300 flex items-center justify-center backdrop-blur-sm group-hover:bg-slate-100 transition-all animate-bounce-slow shadow-sm">
              <ChevronDown className="w-5 h-5 text-slate-700" />
            </div>
          </motion.button>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl py-24 px-4 sm:px-6 lg:px-8">

        {/* Our Vision & Mission - Clean Scroll Reveal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard variant="strong" className="p-0 h-[320px] overflow-hidden relative shadow-2xl border-blue-200/50 group">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                alt="Vision"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-blue-900/60 p-8 flex flex-col justify-end text-white">
                <Compass className="w-12 h-12 text-blue-300 mb-4" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-2">{t('about.vision')}</h2>
                <p className="text-xs sm:text-sm text-blue-100 font-bold leading-relaxed line-clamp-2">
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
            <GlassCard variant="strong" className="p-0 h-[320px] overflow-hidden relative shadow-2xl border-emerald-200/50 group">
              <img
                src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                alt="Mission"
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-emerald-900/60 p-8 flex flex-col justify-end text-white">
                <Heart className="w-12 h-12 text-emerald-300 mb-4" />
                <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter mb-2">{t('about.mission')}</h2>
                <p className="text-xs sm:text-sm text-emerald-100 font-bold leading-relaxed line-clamp-2">
                  {t('about.missionText')}
                </p>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Research & Community Need Section */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">{t('home.impact.title')} & Research</h2>
            <div className="w-24 h-1.5 bg-blue-600 mx-auto rounded-full mb-6" />
            <p className="text-slate-500 font-bold uppercase tracking-[0.2em] text-xs">Data-driven approach to solving local challenges</p>
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
              >
                <GlassCard variant="strong" className={`p-10 h-full bg-white border-${item.color}-100 shadow-xl group hover:border-${item.color}-300 transition-colors`}>
                  <div className="flex items-start gap-6">
                    <div className={`shrink-0 w-14 h-14 rounded-2xl bg-${item.color}-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-${item.color}-500/20`}>
                      {item.step}
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black text-${item.color}-900 mb-4 tracking-tight`}>
                        {item.title}
                      </h3>
                      <div className="space-y-4 text-slate-700 font-bold leading-relaxed">
                        <p>{item.text}</p>
                        <p className="text-sm opacity-70 italic">{item.subtext}</p>
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
            <h2 className="text-5xl font-black text-slate-900 mb-4 tracking-tighter uppercase">Our Core Values</h2>
            <div className="w-20 h-1 bg-slate-900 mx-auto mb-6" />
            <p className="text-slate-500 font-black tracking-[0.3em] text-xs uppercase">Guiding principles for community impact</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 perspective-lg">
            {[
              {
                title: "Sustainability",
                icon: <Leaf className="w-16 h-16 text-emerald-500" />,
                text: t('about.sustainabilityText'),
                color: "emerald"
              },
              {
                title: "Community",
                icon: <Users className="w-16 h-16 text-blue-500" />,
                text: t('about.communityText'),
                color: "blue"
              },
              {
                title: "Innovation",
                icon: <Lightbulb className="w-16 h-16 text-amber-500" />,
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
          <GlassCard variant="strong" className="p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-[3rem]">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 relative bg-slate-900 overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                  alt="Founder Alex Rivera"
                  className="w-full h-full object-cover min-h-[500px] grayscale group-hover:grayscale-0 transition-all duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/20 to-transparent" />
                <div className="absolute bottom-8 left-8 p-8 glass-strong backdrop-blur-xl rounded-[2rem] border border-white/30 shadow-2xl">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-1 h-8 bg-blue-500 rounded-full" />
                    <h4 className="text-2xl font-black text-slate-900 tracking-widest uppercase">ALEX RIVERA</h4>
                  </div>
                  <p className="text-blue-300 font-black uppercase tracking-[0.4em] text-[10px] ml-5">Founder & Neighbor</p>
                </div>
              </div>
              <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center relative bg-slate-50">
                <Quote className="w-16 h-16 text-blue-600 mb-8 opacity-10" />
                <h3 className="text-4xl sm:text-5xl font-black text-slate-900 mb-8 leading-tight tracking-tighter uppercase italic">Inspired by Tradition,<br />Driven by Need</h3>
                <div className="space-y-6 text-slate-700 leading-relaxed text-xl font-bold italic">
                  <p>
                    "Community Compass began with a simple observation: many of our neighbors were struggling to find help even when resources were right around the corner."
                  </p>
                  <p className="text-lg font-bold text-slate-600 not-italic">
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
          <div className="bg-blue-600 rounded-[3rem] p-12 sm:p-20 shadow-2xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Compass className="w-64 h-64 text-white" />
            </div>
            <h2 className="text-4xl sm:text-6xl font-black mb-6 text-white uppercase tracking-tighter">
              Build the Future<br />Together
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-blue-100 font-bold italic">
              Join the movement and help us bridge the gap between need and support. Every resource shared is a hand extended to someone in need.
            </p>
            <div className="flex justify-center">
              <Link to="/submit">
                <GlassButton variant="primary" className="bg-white !text-slate-900 font-black uppercase tracking-widest px-12 h-16 rounded-2xl hover:bg-white hover:scale-105 transition-all shadow-xl">
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
      <GlassCard variant="strong" className={`p-10 h-full text-center flex flex-col items-center justify-center border-${value.color}-200 shadow-2xl relative overflow-hidden bg-white`}>
        <div className={`absolute top-0 left-0 w-full h-1 bg-${value.color}-500`} />
        <div className="mb-6 transform hover:scale-110 transition-transform duration-500">
          {value.icon}
        </div>
        <h3 className={`text-3xl font-black mb-4 uppercase tracking-tighter text-slate-900`}>
          {value.title}
        </h3>
        <p className={`text-lg font-bold text-slate-600 italic leading-relaxed`}>
          {value.text}
        </p>
      </GlassCard>
    </motion.div>
  );
}
