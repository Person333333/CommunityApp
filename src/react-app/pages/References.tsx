import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import { useTranslation } from 'react-i18next';

export default function References() {
  const { t } = useTranslation();
  const workLog = [
    { date: '2026-01-05', task: 'Project kickoff', details: 'Initial planning, IA, and visual direction for glassmorphism theme' },
    { date: '2026-01-06', task: 'Scaffold React app', details: 'Vite + React + TS, Tailwind CSS configured with custom glass utilities' },
    { date: '2026-01-07', task: 'Core UI components', details: 'Navbar, GlassCard, GlassButton, animated hero and compass' },
    { date: '2026-01-08', task: 'Neon DB setup', details: 'Provision Neon Postgres and add resources/submissions tables + migration' },
    { date: '2026-01-09', task: 'Discover & Map pages', details: 'Search, category filters, Leaflet map with OSM tiles and custom markers' },
    { date: '2026-01-10', task: 'Auth integration', details: 'Clerk auth with custom Sign In/Up forms (email code + password)' },
    { date: '2026-01-11', task: 'Resource details & About', details: 'Detailed modal with contact info, About page with vision/mission/values' },
    { date: '2026-01-12', task: 'Internationalization', details: 'Complete multi-language support with i18next and dynamic content translation' },
    { date: '2026-01-13', task: 'Polish & optimization', details: 'User tour, helper button, translation fixes, and final UI refinements' }
  ];

  const copyrightChecklist = [
    { item: 'OpenStreetMap tile attribution', status: 'completed', note: 'Attribution included in map component' },
    { item: 'Leaflet library license', status: 'completed', note: 'BSD 2-Clause license compatible' },
    { item: 'React and related libraries', status: 'completed', note: 'MIT licensed dependencies' },
    { item: 'Lucide React icons', status: 'completed', note: 'ISC license for icon library' },
    { item: 'Google Fonts usage', status: 'completed', note: 'Open Font License compliance' },
    { item: 'Clerk authentication service', status: 'completed', note: 'Commercial service with proper API usage' }
  ];

  const techStack = [
    { category: 'Frontend Framework', tech: 'React 19 with TypeScript', version: '19.0.0' },
    { category: 'Build Tool', tech: 'Vite', version: '7.x' },
    { category: 'Styling', tech: 'Tailwind CSS', version: '3.4.x' },
    { category: 'Animation', tech: 'Framer Motion', version: '12.x' },
    { category: 'Routing', tech: 'React Router', version: '7.x' },
    { category: 'Database', tech: 'Neon (Postgres serverless)', version: 'Latest' },
    { category: 'Authentication', tech: 'Clerk', version: '5.x' },
    { category: 'Maps', tech: 'Leaflet + React Leaflet', version: '1.9.x / 5.0.x' },
    { category: 'Validation', tech: 'Zod', version: '3.24.x' },
    { category: 'I18n', tech: 'i18next + react-i18next', version: '25.x / 16.x' },
    { category: 'Translation API', tech: 'Python Flask + deep-translator', version: 'Latest' }
  ];

  const additionalLibraries = [
    { name: '@clerk/clerk-react', purpose: 'Authentication and user management', license: 'MIT' },
    { name: 'leaflet', purpose: 'Interactive mapping functionality', license: 'BSD 2-Clause' },
    { name: 'react-leaflet', purpose: 'React components for Leaflet maps', license: 'Hippocratic License' },
    { name: '@types/leaflet', purpose: 'TypeScript definitions for Leaflet', license: 'MIT' },
    { name: 'lucide-react', purpose: 'Icon library for UI components', license: 'ISC' },
    { name: 'i18next', purpose: 'Internationalization framework', license: 'MIT' },
    { name: 'react-i18next', purpose: 'React bindings for i18next', license: 'MIT' }
  ];

  const imageLinks = [
    { source: 'OpenStreetMap', url: 'https://www.openstreetmap.org/', usage: 'Map tile data and imagery' },
    { source: 'Unsplash', url: 'https://unsplash.com/', usage: 'Potential stock photography (as needed)' },
    { source: 'Custom Generated', url: 'Internal', usage: 'App-specific graphics and assets' }
  ];

  const researchLinks = [
    { title: 'Leaflet Documentation', url: 'https://leafletjs.com/reference.html', topic: 'Interactive mapping' },
    { title: 'React Leaflet Documentation', url: 'https://react-leaflet.js.org/', topic: 'React map components' },
    { title: 'Clerk Documentation', url: 'https://clerk.com/docs', topic: 'Authentication implementation' },
    { title: 'OpenStreetMap', url: 'https://wiki.openstreetmap.org/', topic: 'Map data and attribution' },
    { title: 'Cloudflare Workers Docs', url: 'https://developers.cloudflare.com/workers/', topic: 'Serverless backend' },
    { title: 'Hono Documentation', url: 'https://hono.dev/', topic: 'Web framework for Workers' },
    { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', topic: 'Utility-first CSS framework' },
    { title: 'i18next Documentation', url: 'https://www.i18next.com/', topic: 'Internationalization' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-normal text-slate-300 mb-4">
            {t('references.title')}
          </h1>
          <p className="text-xl text-slate-400">
            {t('references.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Work Log */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-normal text-slate-300">{t('references.workLog')}</h2>
              </div>

              <div className="space-y-4">
                {workLog.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="border-l-2 border-slate-600 pl-4 pb-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-slate-400">{entry.date}</span>
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    </div>
                    <h3 className="font-normal text-slate-300 mb-1">{entry.task}</h3>
                    <p className="text-sm text-slate-400">{entry.details}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.section>

          {/* Copyright Checklist */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-normal text-slate-300">{t('references.copyright')}</h2>
              </div>

              <div className="grid gap-3">
                {copyrightChecklist.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + index * 0.05 }}
                    className="flex items-start gap-3 p-3 glass rounded-lg"
                  >
                    <div className="flex-shrink-0 mt-1">
                      <div className="w-2 h-2 bg-slate-500 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-normal text-slate-300">{item.item}</h3>
                      <p className="text-sm text-slate-400 mt-1">{item.note}</p>
                    </div>
                    <span className="text-xs text-slate-400 px-2 py-1 bg-slate-700 rounded-full">
                      {item.status}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.section>

          {/* Tech Stack */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-normal text-slate-300">{t('references.techStack')}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {techStack.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.03 }}
                    className="glass p-4 rounded-lg"
                  >
                    <span className="text-sm text-slate-400">{item.category}</span>
                    <h3 className="font-normal text-slate-300 mt-1">{item.tech}</h3>
                    <p className="text-xs text-slate-500 mt-1">{item.version}</p>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.section>

          {/* Additional Libraries */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-normal text-slate-300">{t('references.libraries')}</h2>
              </div>

              <div className="space-y-3">
                {additionalLibraries.map((lib, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.05 }}
                    className="flex items-center justify-between p-3 glass rounded-lg"
                  >
                    <div>
                      <h3 className="font-normal text-slate-300">{lib.name}</h3>
                      <p className="text-slate-400 text-sm">{lib.purpose}</p>
                    </div>
                    <span className="text-xs text-slate-300 px-2 py-1 glass-ochre rounded-full">
                      {lib.license}
                    </span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.section>

          {/* Image Links */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-normal text-slate-300">{t('references.images')}</h2>
              </div>

              <div className="grid gap-3">
                {imageLinks.map((link, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-center justify-between p-3 glass rounded-lg"
                  >
                    <div>
                      <h3 className="font-medium text-slate-100">{link.source}</h3>
                      <p className="text-slate-400 text-sm">{link.usage}</p>
                    </div>
                    {link.url !== 'Internal' && (
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-teal-300 hover:text-teal-200 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.section>

          {/* Research Links */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GlassCard>
              <div className="mb-6">
                <h2 className="text-xl font-normal text-slate-300">{t('references.research')}</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {researchLinks.map((link, index) => (
                  <motion.a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.05 }}
                    className="block p-4 glass rounded-lg hover:glass-strong transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-normal text-slate-300 group-hover:text-slate-200 transition-colors">
                        {link.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-slate-400 transition-colors" />
                    </div>
                    <p className="text-sm text-slate-400">{link.topic}</p>
                  </motion.a>
                ))}
              </div>
            </GlassCard>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
