import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Heart, Users, Leaf, Lightbulb, Compass, Quote } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import FlipCard from '@/react-app/components/FlipCard';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 overflow-x-hidden bg-white">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-blue-900 mb-8">
            {t('about.title')}
          </h1>
          <p className="text-xl sm:text-2xl text-black max-w-3xl mx-auto leading-relaxed italic font-black">
            "From a simple idea to a neighborhood movement."
          </p>
          <div className="mt-12 aspect-video rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white max-w-4xl mx-auto">
            <img
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200"
              alt="Community Gathering"
              className="w-full h-full object-cover"
            />
          </div>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100px" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="h-1 bg-blue-500 mx-auto mt-8 rounded-full"
          />
        </motion.div>

        {/* Our Vision & Mission - 3D Flip Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <FlipCard
              front={
                <GlassCard className="p-0 h-full overflow-hidden relative shadow-xl shadow-blue-500/10 border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                    alt="Vision"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-blue-900/60 flex flex-col items-center justify-center">
                    <Compass className="w-16 h-16 text-blue-300 mb-4" />
                    <h2 className="text-4xl font-bold text-white uppercase tracking-widest">{t('about.vision')}</h2>
                    <p className="text-blue-200 mt-2 font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Click to Reveal</p>
                  </div>
                </GlassCard>
              }
              back={
                <GlassCard className="p-8 h-full bg-blue-50 border border-blue-100 flex flex-col justify-center items-center text-center shadow-xl shadow-blue-500/10">
                  <Compass className="w-12 h-12 text-blue-500 mb-6" />
                  <p className="text-xl text-blue-950 leading-relaxed font-black">
                    {t('about.visionText')}
                  </p>
                </GlassCard>
              }
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <FlipCard
              front={
                <GlassCard className="p-0 h-full overflow-hidden relative shadow-xl shadow-emerald-500/10 border border-slate-200">
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                    alt="Mission"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-emerald-900/60 flex flex-col items-center justify-center">
                    <Heart className="w-16 h-16 text-emerald-300 mb-4" />
                    <h2 className="text-4xl font-bold text-white uppercase tracking-widest">{t('about.mission')}</h2>
                    <p className="text-emerald-200 mt-2 font-black text-sm uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Click to Reveal</p>
                  </div>
                </GlassCard>
              }
              back={
                <GlassCard className="p-8 h-full bg-emerald-50 border border-emerald-100 flex flex-col justify-center items-center text-center shadow-xl shadow-emerald-500/10">
                  <Heart className="w-12 h-12 text-emerald-500 mb-6" />
                  <p className="text-xl text-emerald-950 leading-relaxed font-black">
                    {t('about.missionText')}
                  </p>
                </GlassCard>
              }
            />
          </motion.div>
        </div>

        {/* Research & Community Need Section */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Community Need & Research</h2>
            <p className="text-slate-700 font-bold uppercase tracking-widest text-sm">Data-driven approach to solving local challenges</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-slate-900 leading-relaxed font-black">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-10 h-full bg-blue-50/50 border border-blue-100 shadow-xl">
                <h3 className="text-2xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                  <span className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  The Challenge
                </h3>
                <p className="mb-4">
                  According to our community assessment research, <strong>68% of local residents</strong> reported difficulty finding reliable, up-to-date information regarding food pantries and support services. Disjointed communications and scattered directories were identified as the primary barriers.
                </p>
                <p>
                  As part of the TSA Webmaster challenge, we recognized that existing solutions lacked interactivity, real-time updates, and broad accessibility.
                </p>
              </GlassCard>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <GlassCard className="p-10 h-full bg-indigo-50/50 border border-indigo-100 shadow-xl">
                <h3 className="text-2xl font-bold text-indigo-900 mb-6 flex items-center gap-3">
                  <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Our Methodology
                </h3>
                <p className="mb-4">
                  We conducted robust research by reviewing over 50 regional resource boards and analyzing common user pain points: <em>navigational complexity, mobile incompatibility, and language access</em>.
                </p>
                <p>
                  <strong className="text-indigo-700">Community Compass</strong> was designed directly from this feedback, implementing an interactive Leaflet map, a user-driven submission system, and automated multilingual translation to serve a diverse population effectively.
                </p>
              </GlassCard>
            </motion.div>
          </div>
        </section>

        {/* Our Values Section */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Our Core Values</h2>
            <p className="text-slate-700 font-bold uppercase tracking-widest text-sm">Hover or tap to flip</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Sustainability",
                icon: <Leaf className="w-16 h-16 text-emerald-500" />,
                frontText: "Green practices for a healthier tomorrow.",
                text: "We prioritize the health of the planet and our community through eco-friendly practices and local partnerships.",
                delay: 0,
                bg: "bg-emerald-50/50",
                backBg: "bg-emerald-600",
                textColor: "text-emerald-900"
              },
              {
                title: "Community",
                icon: <Users className="w-16 h-16 text-blue-500" />,
                frontText: "Uplifting neighbors through genuine connection.",
                text: "Building strong relationships with neighbors and organizations to uplift every member of our society.",
                delay: 0.2,
                bg: "bg-blue-50/50",
                backBg: "bg-blue-600",
                textColor: "text-blue-900"
              },
              {
                title: "Innovation",
                icon: <Lightbulb className="w-16 h-16 text-amber-500" />,
                frontText: "Tech solutions for accessible resources.",
                text: "Exploring tech solutions to create more accessible pathways for finding and sharing vital resources.",
                delay: 0.4,
                bg: "bg-amber-50/50",
                backBg: "bg-amber-600",
                textColor: "text-amber-900"
              }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: value.delay, duration: 0.6 }}
              >
                <FlipCard
                  heightClass="h-[320px]"
                  front={
                    <GlassCard className={`p-8 h-full text-center border border-slate-100 flex flex-col items-center justify-center ${value.bg}`}>
                      <div className="mb-4">{value.icon}</div>
                      <h3 className={`text-2xl font-black mb-2 ${value.textColor}`}>{value.title}</h3>
                      <p className={`text-sm font-bold ${value.textColor} opacity-80 mb-4 px-2`}>{value.frontText}</p>
                      <p className={`mt-auto pt-2 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity ${value.textColor}`}>Tap to Reveal</p>
                    </GlassCard>
                  }
                  back={
                    <GlassCard className={`p-8 h-full flex items-center justify-center text-center ${value.backBg} shadow-2xl border-none`}>
                      <p className="text-white text-lg leading-relaxed font-black">{value.text}</p>
                    </GlassCard>
                  }
                />
              </motion.div>
            ))}
          </div>
        </section>

        {/* Founder's Story */}
        <motion.div
          initial={{ opacity: 0, x: -100 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="mb-32"
        >
          <GlassCard className="p-0 overflow-hidden bg-white border border-slate-100 shadow-2xl">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2 relative bg-slate-900 overflow-hidden group">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                  alt="Founder Alex Rivera"
                  className="w-full h-full object-cover min-h-[400px] scale-105 group-hover:scale-100 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent" />
                <div className="absolute bottom-8 left-8 p-6 glass backdrop-blur-md rounded-2xl border border-white/20">
                  <h4 className="text-xl font-bold text-white">Alex Rivera</h4>
                  <p className="text-blue-300 font-bold uppercase tracking-widest text-xs mt-1">Founder & Neighbor</p>
                </div>
              </div>
              <div className="lg:w-1/2 p-12 flex flex-col justify-center">
                <Quote className="w-12 h-12 text-blue-100 mb-6" />
                <h3 className="text-4xl font-bold text-blue-900 mb-8">Inspired by Tradition, Driven by Need</h3>
                <div className="space-y-6 text-slate-900 leading-relaxed text-lg font-black">
                  <p>
                    Community Compass began with a simple observation: many of our neighbors were struggling to find help even when resources were right around the corner.
                  </p>
                  <p>
                    I grew up believing that a community is only as strong as its most vulnerable member. After seeing the power of teamwork during local projects, I knew we needed a digital "compass" to point people toward support.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Journey removed by User Request */}

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] p-16 text-white shadow-2xl">
            <h2 className="text-4xl sm:text-5xl font-black mb-6 uppercase tracking-tight">
              Ready to help your neighborhood?
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed font-black text-blue-50">
              Join the movement and help us bridge the gap between need and support. Every resource shared is a hand extended to someone in need.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/submit">
                <GlassButton variant="secondary" size="lg" className="bg-white !text-slate-950 border-none px-12 h-16 text-lg font-black shadow-xl uppercase tracking-widest transition-all hover:bg-slate-50">
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
