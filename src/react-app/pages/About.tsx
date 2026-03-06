import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Heart, Users, Leaf, Lightbulb, Clock, Compass, Quote } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
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

        {/* Our Vision & Mission - Alternating */}
        <div className="space-y-24 mb-32">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="p-8 md:p-12 bg-white border border-slate-100 shadow-xl shadow-blue-500/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="order-2 md:order-1">
                  <h2 className="text-4xl font-bold text-blue-900 mb-6 flex items-center gap-3">
                    <Compass className="w-8 h-8 text-blue-500" /> {t('about.vision')}
                  </h2>
                  <p className="text-lg text-slate-900 leading-relaxed font-black">
                    {t('about.visionText')}
                  </p>
                </div>
                <div className="order-1 md:order-2 aspect-video rounded-3xl overflow-hidden shadow-2xl relative">
                  <img
                    src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=800"
                    alt="Vision"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-blue-600/10 mix-blend-multiply" />
                </div>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="p-8 md:p-12 bg-slate-50 border border-slate-100 shadow-xl shadow-emerald-500/5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                <div className="aspect-video rounded-3xl overflow-hidden shadow-2xl relative">
                  <img
                    src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=800"
                    alt="Mission"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-emerald-600/10 mix-blend-multiply" />
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <Heart className="w-8 h-8 text-emerald-500" /> {t('about.mission')}
                  </h2>
                  <p className="text-lg text-slate-900 leading-relaxed font-black">
                    {t('about.missionText')}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </div>

        {/* Our Values Section */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-blue-900 mb-4">Our Core Values</h2>
            <p className="text-slate-700 font-bold uppercase tracking-widest text-sm">The principles that guide everything we do</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Sustainability",
                icon: <Leaf className="w-10 h-10 text-emerald-500" />,
                text: "We prioritize the health of the planet and our community through eco-friendly practices and local partnerships.",
                delay: 0,
                bg: "bg-emerald-50/50"
              },
              {
                title: "Community",
                icon: <Users className="w-10 h-10 text-blue-500" />,
                text: "Building strong relationships with neighbors and organizations to uplift every member of our society.",
                delay: 0.2,
                bg: "bg-blue-50/50"
              },
              {
                title: "Innovation",
                icon: <Lightbulb className="w-10 h-10 text-amber-500" />,
                text: "Exploring tech solutions to create more accessible pathways for finding and sharing vital resources.",
                delay: 0.4,
                bg: "bg-amber-50/50"
              }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: value.delay, duration: 0.6 }}
              >
                <GlassCard className={`p-8 h-full text-center hover:shadow-2xl transition-all duration-500 border border-slate-100 ${value.bg}`}>
                  <div className="mb-6 flex justify-center">{value.icon}</div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">{value.title}</h3>
                  <p className="text-slate-900 text-sm leading-relaxed font-black">{value.text}</p>
                </GlassCard>
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

        {/* Journey / Timeline */}
        <section className="mb-32">
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="p-8 md:p-12 relative overflow-hidden bg-white border border-slate-100 shadow-xl">
              <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                <Clock className="w-64 h-64 text-blue-500" />
              </div>
              <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center uppercase tracking-widest">Our Journey</h2>

              <div className="space-y-12 relative">
                {[
                  { year: "2024", title: "The Humble Spark", desc: "Started as a small school project to map local food banks." },
                  { year: "2025", title: "TSA Webmaster Challenge", desc: "Developed into a full Community Resource Hub for the Washington TSA Webmaster competition by Chapter 2139 (Inglemoor High School)." },
                  { year: "2026", title: "Future Vision", desc: "Integrating AI-driven matching and global multi-language support." }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-8 items-start relative pb-12 last:pb-0">
                    {idx !== 2 && <div className="absolute left-6 top-12 bottom-0 w-px bg-slate-200" />}
                    <div className="w-12 h-12 rounded-full bg-blue-600 flex-shrink-0 flex items-center justify-center font-bold text-white z-10 shadow-lg shadow-blue-500/30">
                      {idx + 1}
                    </div>
                    <div>
                      <div className="text-blue-600 font-bold mb-1">{item.year}</div>
                      <h4 className="text-xl font-black text-slate-900 mb-2">{item.title}</h4>
                      <p className="text-slate-900 leading-relaxed font-black">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </section>

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
