import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Heart, Users, Leaf, Lightbulb, Compass, Quote, ChevronDown } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import FlipCard from '@/react-app/components/FlipCard';
import TiltCard from '@/react-app/components/TiltCard';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      {/* Full-Screen Hero Section */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1544027993-37dbfe43552e?auto=format&fit=crop&q=80&w=2000"
            alt="Community Connection"
            className="w-full h-full object-cover scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-800/30 to-white z-10" />
        </div>

        <div className="container mx-auto max-w-6xl px-4 relative z-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-2 bg-blue-600/20 backdrop-blur-md border border-white/20 rounded-full text-blue-100 text-xs font-black uppercase tracking-[0.3em] mb-4">
              Our Story & Mission
            </span>
            <h1 className="text-6xl sm:text-7xl lg:text-9xl font-black text-white mb-6 drop-shadow-2xl tracking-tighter uppercase leading-[0.9]">
              Community <br />
              <span className="text-blue-200">Compass</span>
            </h1>
            <p className="text-xl sm:text-2xl text-blue-50 max-w-3xl mx-auto leading-relaxed italic font-bold drop-shadow-lg opacity-90">
              "From a simple idea to a neighborhood movement."
            </p>
          </motion.div>

          {/* Scroll Down Button */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white group cursor-pointer"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 group-hover:opacity-100 transition-opacity">Scroll Down</span>
            <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/10 transition-all animate-bounce-slow">
              <ChevronDown className="w-5 h-5 text-white" />
            </div>
          </motion.button>
        </div>
      </section>

      <div className="container mx-auto max-w-6xl py-16 px-4 sm:px-6 lg:px-8">

        {/* Our Vision & Mission - Clean Static Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          >
            <TiltCard>
              <FlipCard
                heightClass="h-[320px]"
                front={
                  <GlassCard variant="strong" className="p-0 h-full overflow-hidden relative shadow-2xl border-blue-200/50 group">
                    <img
                      src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                      alt="Vision"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-blue-900/60 flex flex-col items-center justify-center p-8 text-center backdrop-blur-[2px]">
                      <Compass className="w-16 h-16 text-blue-300 mb-4 transform group-hover:rotate-12 transition-transform" />
                      <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{t('about.vision')}</h2>
                      <div className="w-12 h-1 bg-blue-400 rounded-full mb-4 opacity-50" />
                      <p className="text-blue-200 font-black text-sm uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">Reveal Vision</p>
                    </div>
                  </GlassCard>
                }
                back={
                  <GlassCard variant="strong" className="p-10 h-full bg-blue-50/90 border-2 border-blue-200 flex flex-col justify-center items-center text-center shadow-2xl">
                    <Compass className="w-12 h-12 text-blue-600 mb-6" />
                    <p className="text-xl text-slate-900 leading-relaxed font-black mb-4">
                      {t('about.visionText')}
                    </p>
                    <div className="absolute top-4 right-4 text-blue-200">
                      <Quote className="w-12 h-12 opacity-20" />
                    </div>
                  </GlassCard>
                }
              />
            </TiltCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2, type: "spring", bounce: 0.3 }}
          >
            <TiltCard>
              <FlipCard
                heightClass="h-[320px]"
                front={
                  <GlassCard variant="strong" className="p-0 h-full overflow-hidden relative shadow-2xl border-emerald-200/50 group">
                    <img
                      src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                      alt="Mission"
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-emerald-900/60 flex flex-col items-center justify-center p-8 text-center backdrop-blur-[2px]">
                      <Heart className="w-16 h-16 text-emerald-300 mb-4 transform group-hover:scale-110 transition-transform" />
                      <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">{t('about.mission')}</h2>
                      <div className="w-12 h-1 bg-emerald-400 rounded-full mb-4 opacity-50" />
                      <p className="text-emerald-200 font-black text-sm uppercase tracking-[0.3em] opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0">Reveal Mission</p>
                    </div>
                  </GlassCard>
                }
                back={
                  <GlassCard variant="strong" className="p-10 h-full bg-emerald-50/90 border-2 border-emerald-200 flex flex-col justify-center items-center text-center shadow-2xl">
                    <Heart className="w-12 h-12 text-emerald-600 mb-6" />
                    <p className="text-xl text-slate-900 leading-relaxed font-black mb-4">
                      {t('about.missionText')}
                    </p>
                    <div className="absolute top-4 right-4 text-emerald-200">
                      <Quote className="w-12 h-12 opacity-20" />
                    </div>
                  </GlassCard>
                }
              />
            </TiltCard>
          </motion.div>
        </div>

        {/* Research & Community Need Section */}
        <div className="section-divider mx-auto max-w-md mb-12" />
        <section className="mb-20">
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
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
              >
                <TiltCard>
                  <GlassCard variant="strong" className={`p-10 h-full bg-${item.color}-50/30 border-${item.color}-100 shadow-2xl group hover:border-${item.color}-300 transition-colors`}>
                    <div className="flex items-start gap-6">
                      <div className={`shrink-0 w-14 h-14 rounded-2xl bg-${item.color}-600 text-white flex items-center justify-center text-xl font-black shadow-lg shadow-${item.color}-500/20 transform group-hover:rotate-6 transition-transform`}>
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
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Our Values Section */}
        <div className="section-divider mx-auto max-w-md mb-12" />
        <section className="mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-500 font-medium tracking-wider text-sm uppercase">Guiding principles for community impact</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Sustainability",
                icon: <Leaf className="w-16 h-16 text-emerald-500" />,
                frontText: t('about.sustainabilitySummary'),
                text: t('about.sustainabilityText'),
                delay: 0,
                bg: "bg-emerald-50/10",
                backBg: "bg-emerald-600",
                textColor: "text-emerald-900",
                accentColor: "emerald"
              },
              {
                title: "Community",
                icon: <Users className="w-16 h-16 text-blue-500" />,
                frontText: t('about.communitySummary'),
                text: t('about.communityText'),
                delay: 0.2,
                bg: "bg-blue-50/10",
                backBg: "bg-blue-600",
                textColor: "text-blue-900",
                accentColor: "blue"
              },
              {
                title: "Innovation",
                icon: <Lightbulb className="w-16 h-16 text-amber-500" />,
                frontText: t('about.innovationSummary'),
                text: t('about.innovationText'),
                delay: 0.4,
                bg: "bg-amber-50/10",
                backBg: "bg-amber-600",
                textColor: "text-amber-900",
                accentColor: "amber"
              }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: value.delay, duration: 0.8 }}
              >
                <TiltCard className="group">
                  <FlipCard
                    heightClass="h-[320px]"
                    front={
                      <GlassCard variant="strong" className={`p-8 h-full text-center flex flex-col items-center justify-center relative overflow-hidden group-hover:border-${value.accentColor}-400/50 transition-colors`}>
                        <div className={`absolute inset-0 bg-gradient-to-br from-${value.accentColor}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
                        <div className="mb-4 relative z-10">{value.icon}</div>
                        <h3 className={`text-2xl font-black mb-2 relative z-10 ${value.textColor}`}>{value.title}</h3>
                        <p className={`text-sm font-bold relative z-10 ${value.textColor} opacity-80 mb-4 px-2`}>{value.frontText}</p>
                        <p className={`mt-auto pt-2 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 ${value.textColor}`}>Tap to Reveal</p>
                      </GlassCard>
                    }
                    back={
                      <GlassCard className={`p-8 h-full flex items-center justify-center text-center ${value.backBg} shadow-2xl border-none`}>
                        <p className="text-white text-lg leading-relaxed font-black">{value.text}</p>
                      </GlassCard>
                    }
                  />
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Founder's Story */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1, type: "spring", stiffness: 50 }}
          className="mb-20"
        >
          <TiltCard>
            <GlassCard variant="strong" className="p-0 overflow-hidden bg-white border border-slate-200 shadow-2xl rounded-[3rem]">
              <div className="flex flex-col lg:flex-row">
                <div className="lg:w-1/2 relative bg-slate-900 overflow-hidden group">
                  <motion.img
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                    alt="Founder Alex Rivera"
                    className="w-full h-full object-cover min-h-[500px] scale-110 group-hover:scale-100 transition-transform duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent" />
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-8 left-8 p-8 glass-strong backdrop-blur-xl rounded-[2rem] border border-white/30 shadow-2xl scale-90 sm:scale-100"
                  >
                    <div className="flex items-center gap-4 mb-2">
                      <div className="w-1 h-8 bg-blue-500 rounded-full" />
                      <h4 className="text-2xl font-black text-white tracking-widest">ALEX RIVERA</h4>
                    </div>
                    <p className="text-blue-300 font-black uppercase tracking-[0.4em] text-[10px] ml-5">Founder & Neighbor</p>
                  </motion.div>
                </div>
                <div className="lg:w-1/2 p-12 lg:p-20 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                    <Compass className="w-96 h-96 text-blue-900" />
                  </div>
                  <Quote className="w-16 h-16 text-blue-600 mb-8 opacity-20" />
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
          </TiltCard>
        </motion.div>

        {/* Journey removed by User Request */}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-12 sm:p-16 shadow-sm">
            <h2 className="text-3xl sm:text-4xl font-semibold mb-4 text-slate-900">
              Ready to help your neighborhood?
            </h2>
            <p className="text-lg mb-10 max-w-2xl mx-auto leading-relaxed text-slate-600 font-medium">
              Join the movement and help us bridge the gap between need and support. Every resource shared is a hand extended to someone in need.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/submit">
                <GlassButton variant="primary" className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors border-none">
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
