import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Heart, Users, Leaf, Lightbulb, Compass, Quote } from 'lucide-react';
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-24"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 mb-6">
            {t('about.title')}
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed font-medium">
            From a simple idea to a neighborhood movement.
          </p>
          <div className="mt-12 aspect-[21/9] rounded-2xl overflow-hidden shadow-sm border border-slate-200 max-w-5xl mx-auto">
            <img
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200"
              alt="Community Gathering"
              className="w-full h-full object-cover"
            />
          </div>
        </motion.div>

        {/* Our Vision & Mission - Clean Static Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <GlassCard className="p-10 h-full bg-white border border-slate-200 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
              <Compass className="w-10 h-10 text-blue-600 mb-6" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t('about.vision')}</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                {t('about.visionText')}
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <GlassCard className="p-10 h-full bg-white border border-slate-200 flex flex-col items-start shadow-sm hover:shadow-md transition-shadow">
              <Heart className="w-10 h-10 text-rose-600 mb-6" />
              <h2 className="text-2xl font-semibold text-slate-900 mb-4">{t('about.mission')}</h2>
              <p className="text-slate-600 leading-relaxed font-medium">
                {t('about.missionText')}
              </p>
            </GlassCard>
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
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Community Need & Research</h2>
            <p className="text-slate-500 font-medium tracking-wider text-sm uppercase">Data-driven approach to solving local challenges</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-600 leading-relaxed font-medium">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <GlassCard className="p-8 h-full bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3 relative z-10">
                  <span className="bg-slate-100 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border border-slate-200">1</span>
                  The Challenge
                </h3>
                <p className="mb-4 relative z-10">
                  According to our community assessment research, <strong className="font-semibold text-slate-900">68% of local residents</strong> reported difficulty finding reliable, up-to-date information regarding food pantries and support services. Disjointed communications and scattered directories were identified as the primary barriers.
                </p>
                <p className="relative z-10">
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
              <GlassCard className="p-8 h-full bg-white border border-slate-200 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-110" />
                <h3 className="text-2xl font-semibold text-slate-900 mb-6 flex items-center gap-3 relative z-10">
                  <span className="bg-slate-100 text-slate-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border border-slate-200">2</span>
                  Our Methodology
                </h3>
                <p className="mb-4 relative z-10">
                  We conducted robust research by reviewing over 50 regional resource boards and analyzing common user pain points: <em className="text-slate-700 not-italic font-medium">navigational complexity, mobile incompatibility, and language access</em>.
                </p>
                <p className="relative z-10">
                  <strong className="font-semibold text-blue-600">Community Compass</strong> was designed directly from this feedback, implementing an interactive Leaflet map, a user-driven submission system, and automated multilingual translation to serve a diverse population effectively.
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
            <h2 className="text-3xl font-semibold text-slate-900 mb-4">Our Core Values</h2>
            <p className="text-slate-500 font-medium tracking-wider text-sm uppercase">Guiding principles for community impact</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Sustainability",
                icon: <Leaf className="w-10 h-10 text-emerald-600 mb-4" />,
                frontText: "Green practices for a healthier tomorrow.",
                text: "We prioritize the health of the planet and our community through eco-friendly practices and local partnerships.",
                delay: 0,
              },
              {
                title: "Community",
                icon: <Users className="w-10 h-10 text-blue-600 mb-4" />,
                frontText: "Uplifting neighbors through genuine connection.",
                text: "Building strong relationships with neighbors and organizations to uplift every member of our society.",
                delay: 0.2,
              },
              {
                title: "Innovation",
                icon: <Lightbulb className="w-10 h-10 text-amber-500 mb-4" />,
                frontText: "Tech solutions for accessible resources.",
                text: "Exploring tech solutions to create more accessible pathways for finding and sharing vital resources.",
                delay: 0.4,
              }
            ].map((value, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: value.delay, duration: 0.6 }}
              >
                <GlassCard className="p-8 h-full bg-white border border-slate-200 shadow-sm flex flex-col hover:shadow-md transition-shadow">
                  {value.icon}
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{value.title}</h3>
                  <p className="text-sm font-medium text-slate-600 mb-4">{value.frontText}</p>
                  <p className="text-slate-500 text-sm leading-relaxed mt-auto pt-4 border-t border-slate-100">{value.text}</p>
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
          <GlassCard className="p-0 overflow-hidden bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-2/5 relative bg-slate-100 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800"
                  alt="Founder Alex Rivera"
                  className="w-full h-full object-cover min-h-[400px]"
                />
                <div className="absolute bottom-6 left-6 p-4 bg-white/95 backdrop-blur-md rounded-xl border border-slate-200 shadow-sm">
                  <h4 className="text-lg font-semibold text-slate-900">Alex Rivera</h4>
                  <p className="text-slate-500 font-medium uppercase tracking-wider text-xs mt-1">Founder</p>
                </div>
              </div>
              <div className="lg:w-3/5 p-10 lg:p-16 flex flex-col justify-center">
                <Quote className="w-10 h-10 text-slate-300 mb-6" />
                <h3 className="text-3xl font-semibold text-slate-900 mb-8">Inspired by Tradition, Driven by Need</h3>
                <div className="space-y-6 text-slate-600 leading-relaxed text-lg font-medium">
                  <p>
                    Community Compass began with a simple observation: many of our neighbors were struggling to find help even when resources were right around the corner.
                  </p>
                  <p>
                    I grew up believing that a community is only as strong as its most vulnerable member. After seeing the power of teamwork during local projects, I knew we needed a digital compass to point people toward support.
                  </p>
                </div>
              </div>
            </div>
          </GlassCard>
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
