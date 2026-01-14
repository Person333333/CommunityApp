import { motion } from 'framer-motion';
import { Heart, Users, Target, Compass, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import { useTranslation } from 'react-i18next';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold gradient-text mb-6">
            {t('about.title')}
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
            {t('about.subtitle')}
          </p>
        </motion.div>

        {/* Our Vision */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <GlassCard variant="strong" className="p-8 md:p-12">
            <div className="flex items-start gap-6 mb-6">
              <div className="glass-teal p-4 rounded-full">
                <Target className="w-8 h-8 text-teal-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-100 mb-4">{t('about.vision')}</h2>
                <p className="text-lg text-slate-300 leading-relaxed mb-4">
                  {t('about.visionText')}
                </p>
                <p className="text-lg text-slate-300 leading-relaxed">
                  {t('about.visionText2')}
                </p>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Our Mission */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <GlassCard variant="teal" className="p-8 md:p-12">
            <div className="flex items-start gap-6 mb-6">
              <div className="glass-ochre p-4 rounded-full">
                <Compass className="w-8 h-8 text-amber-400" />
              </div>
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-slate-100 mb-4">{t('about.mission')}</h2>
                <p className="text-lg text-slate-300 leading-relaxed mb-4">
                  {t('about.missionText')}
                </p>
                <ul className="space-y-3 text-lg text-slate-300">
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                    <span>{t('about.missionItem1')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                    <span>{t('about.missionItem2')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                    <span>{t('about.missionItem3')}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <ArrowRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-1" />
                    <span>{t('about.missionItem4')}</span>
                  </li>
                </ul>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <GlassCard variant="teal" className="p-6 h-full text-center">
              <div className="glass-ochre p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Heart className="w-8 h-8 text-amber-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">{t('about.compassion')}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t('about.compassionText')}
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <GlassCard variant="teal" className="p-6 h-full text-center">
              <div className="glass-teal p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">{t('about.community')}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t('about.communityText')}
              </p>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <GlassCard variant="teal" className="p-6 h-full text-center">
              <div className="glass-strong p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Target className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-100 mb-3">{t('about.accessibility')}</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {t('about.accessibilityText')}
              </p>
            </GlassCard>
          </motion.div>
        </div>

        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center"
        >
          <GlassCard variant="strong" className="p-8 md:p-12">
            <h2 className="text-3xl font-bold text-slate-100 mb-4">
              {t('about.joinUs')}
            </h2>
            <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto">
              {t('about.joinUsText')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/submit">
                <GlassButton variant="primary" size="lg">
                  {t('about.submitResource')}
                </GlassButton>
              </Link>
              <Link to="/discover">
                <GlassButton variant="secondary" size="lg">
                  {t('about.exploreResources')}
                </GlassButton>
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}

