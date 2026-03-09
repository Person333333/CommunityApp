import { motion } from 'framer-motion';
import { ExternalLink, FileText, Download, Info } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import { useTranslation } from 'react-i18next';

export default function References() {
  const { t } = useTranslation();

  const techStack = [
    { category: 'Frontend Framework', tech: 'React 19 with TypeScript (19.0.0)' },
    { category: 'Build Tool', tech: 'Vite (7.x)' },
    { category: 'Styling', tech: 'Tailwind CSS (3.4.x)' },
    { category: 'Animation', tech: 'Framer Motion (12.x)' },
    { category: 'Routing', tech: 'React Router (7.x)' },
    { category: 'Database', tech: 'Neon Postgres Serverless' },
    { category: 'Authentication', tech: 'Clerk (5.x)' },
    { category: 'Maps', tech: 'Leaflet + React Leaflet (1.9.x)' },
    { category: 'Validation', tech: 'Zod (3.24.x)' },
    { category: 'I18n', tech: 'i18next + react-i18next' },
    { category: 'Translation API', tech: 'Python Flask + deep-translator' },
    { category: 'AI Processing', tech: 'Google Gemini API (used for NLP search & content validation)' }
  ];

  const additionalLibraries = [
    { name: '@clerk/clerk-react', purpose: 'Authentication and user management' },
    { name: 'leaflet', purpose: 'Interactive mapping functionality' },
    { name: 'react-leaflet', purpose: 'React components for Leaflet maps' },
    { name: 'lucide-react', purpose: 'Icon library for UI components' },
    { name: 'i18next', purpose: 'Internationalization framework' },
    { name: 'framer-motion', purpose: 'Smooth UI animations and transitions' }
  ];

  const resourceLinks = [
    { title: 'Ballard Food Bank', url: 'https://www.ballardfoodbank.org/' },
    { title: 'Carolyn Downs Family Medical Center', url: 'https://neighborcare.org/clinics/carolyn-downs/' },
    { title: 'Sound Health', url: 'https://www.sound.health/' },
    { title: 'DC Central Kitchen', url: 'https://dccentralkitchen.org/' },
    { title: 'Coalition for the Homeless', url: 'https://www.coalitionforthehomeless.org/' },
    { title: 'Boston Medical Center', url: 'https://www.bmc.org/' },
    { title: 'Pine Street Inn', url: 'https://www.pinestreetinn.org/' },
    { title: 'Rosie\'s Place', url: 'https://www.rosiesplace.org/' },
    { title: 'Greater Boston Food Bank', url: 'https://www.gbfb.org/' },
    { title: 'Martha\'s Table', url: 'https://marthastable.org/' }
  ];

  const researchLinks = [
    { title: 'Leaflet Documentation', url: 'https://leafletjs.com/reference.html' },
    { title: 'Clerk Documentation', url: 'https://clerk.com/docs' },
    { title: 'OpenStreetMap Wiki', url: 'https://wiki.openstreetmap.org/' },
    { title: 'i18next Documentation', url: 'https://www.i18next.com/' },
    { title: 'Vite Guide', url: 'https://vitejs.dev/guide/' },
    { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
            {t('references.title')}
          </h1>
          <p className="text-xl text-slate-800 font-bold">
            {t('references.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Professional Documents Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard hover className="flex flex-col items-center text-center p-8 bg-blue-50 border-blue-100 shadow-xl">
              <FileText className="w-12 h-12 text-blue-600 mb-4" />
              <h2 className="text-xl font-bold text-blue-900 mb-4">{t('references.workLog')}</h2>
              <a
                href="/documents/work-log.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white hover:bg-slate-50 border border-blue-200 rounded-xl text-blue-700 transition-all font-bold shadow-sm"
              >
                View PDF Work Log
              </a>
            </GlassCard>

            <GlassCard hover className="flex flex-col items-center text-center p-8 bg-amber-50 border-amber-100 shadow-xl">
              <Download className="w-12 h-12 text-amber-600 mb-4" />
              <h2 className="text-xl font-bold text-amber-900 mb-4">{t('references.copyright')}</h2>
              <a
                href="/documents/copyright-checklist.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-white hover:bg-slate-50 border border-amber-200 rounded-xl text-amber-700 transition-all font-bold shadow-sm"
              >
                View PDF Checklist
              </a>
            </GlassCard>
          </section>

          {/* Clean Lists */}
          <GlassCard className="p-8 space-y-10 bg-white border-slate-100 shadow-2xl">
            {/* Project Information */}
            <div>
              <h2 className="text-2xl font-black text-blue-900 mb-6 flex items-center gap-2 border-b border-slate-100 pb-2 uppercase tracking-widest">
                <Info className="w-6 h-6 text-blue-500" /> Project Information
              </h2>
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Event</h3>
                    <p className="font-bold text-lg">Washington TSA Webmaster (HS)</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Chapter</h3>
                    <p className="font-bold text-lg">2139 (Inglemoor High School)</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Theme</h3>
                    <p className="font-bold text-lg">Community Resource Hub</p>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-2 uppercase tracking-wider text-xs">Team Members</h3>
                    <ul className="list-disc pl-5 font-bold space-y-1 mt-1">
                      <li>Nathan Choy</li>
                      <li>Nikhil Vincent</li>
                      <li>George Xu</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Tech Stack */}
            <div>
              <h2 className="text-2xl font-black text-blue-900 mb-6 border-b border-slate-100 pb-2 uppercase tracking-widest">Tech Stack</h2>
              <ul className="space-y-3">
                {techStack.map((item, i) => (
                  <li key={i} className="flex justify-between items-center text-slate-700">
                    <span className="text-slate-900 font-bold">{item.category}</span>
                    <span className="text-sm italic font-bold text-indigo-700">{item.tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Libraries */}
            <div>
              <h2 className="text-2xl font-black text-blue-900 mb-6 border-b border-slate-100 pb-2 uppercase tracking-widest">Additional Libraries</h2>
              <ul className="space-y-3">
                {additionalLibraries.map((lib, i) => (
                  <li key={i} className="flex justify-between items-center text-slate-700">
                    <span className="text-indigo-900 font-mono text-sm font-bold">{lib.name}</span>
                    <span className="text-sm italic font-bold text-right">{lib.purpose}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Organization Links */}
            <div>
              <h2 className="text-2xl font-black text-blue-900 mb-6 border-b border-slate-100 pb-2 uppercase tracking-widest">Inspiration & Organizations</h2>
              <ul className="space-y-3">
                {resourceLinks.map((org, i) => (
                  <li key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 overflow-hidden">
                    <span className="text-slate-900 text-sm font-bold whitespace-nowrap">{org.title}</span>
                    <a
                      href={org.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors truncate sm:max-w-[60%] font-bold"
                    >
                      {org.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Research Links */}
            <div>
              <h2 className="text-2xl font-black text-blue-900 mb-6 border-b border-slate-100 pb-2 uppercase tracking-widest">Research & Documentation</h2>
              <ul className="space-y-3">
                {researchLinks.map((link, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="text-slate-900 text-sm font-bold">{link.title}</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-bold"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
