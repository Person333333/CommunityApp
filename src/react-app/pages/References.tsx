import { motion } from 'framer-motion';
import { ExternalLink, FileText, Download } from 'lucide-react';
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
    { category: 'Translation API', tech: 'Python Flask + deep-translator' }
  ];

  const additionalLibraries = [
    { name: '@clerk/clerk-react', purpose: 'Authentication and user management' },
    { name: 'leaflet', purpose: 'Interactive mapping functionality' },
    { name: 'react-leaflet', purpose: 'React components for Leaflet maps' },
    { name: 'lucide-react', purpose: 'Icon library for UI components' },
    { name: 'i18next', purpose: 'Internationalization framework' },
    { name: 'framer-motion', purpose: 'Smooth UI animations and transitions' }
  ];

  const resourceImages = [
    { title: 'Ballard Food Bank', url: 'https://nfg-sofun.s3.amazonaws.com/uploads/project/photo/47515/poster_board_21BFBext-002__1_.jpg' },
    { title: 'Carolyn Downs Family Medical Center', url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgaXbt6ak400M-jeYQpT1Dr8F22NWEywpRoQ&s' },
    { title: 'Sound Health - Capitol Hill', url: 'https://www.rehab.com/wp-content/uploads/2024/09/sound-capitol-hill-seattle-wa-98122-front-entrance-696x392.webp' },
    { title: 'DC Central Kitchen', url: 'https://dccentralkitchen.org/wp-content/uploads/2022/03/DCCentralKitchen_logo-hi-res.png' },
    { title: 'Coalition for the Homeless', url: 'https://www.coalitionforthehomeless.org/wp-content/uploads/2023/08/site_logo.svg' },
    { title: 'Boston Medical Center', url: 'https://www.bmc.org/sites/default/files/styles/hospital_full_image/public/2018-05/Boston_Medical_Center_Menino_Building_0.jpg' },
    { title: 'Pine Street Inn', url: 'https://www.pinestreetinn.org/sites/default/files/styles/hero_image/public/2020-05/PineStreetInn_Building_Exterior.jpg' },
    { title: 'Rosie\'s Place', url: 'https://www.rosiesplace.org/assets/images/home-hero.jpg' },
    { title: 'Greater Boston Food Bank', url: 'https://www.gbfb.org/wp-content/themes/gbfb/assets/img/gbfb-logo-color.svg' },
    { title: 'Martha\'s Table', url: 'https://marthastable.org/wp-content/themes/marthastable/assets/img/logo.png' }
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
          <h1 className="text-4xl sm:text-5xl font-light text-slate-100 mb-4">
            {t('references.title')}
          </h1>
          <p className="text-xl text-slate-400">
            {t('references.subtitle')}
          </p>
        </motion.div>

        <div className="space-y-12">
          {/* Professional Documents Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard variant="teal" hover className="flex flex-col items-center text-center p-8">
              <FileText className="w-12 h-12 text-teal-400 mb-4" />
              <h2 className="text-xl font-medium text-slate-200 mb-4">{t('references.workLog')}</h2>
              <a
                href="/documents/work-log.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 glass rounded-xl text-teal-300 hover:text-teal-200 transition-all font-medium"
              >
                View PDF Work Log
              </a>
            </GlassCard>

            <GlassCard variant="teal" hover className="flex flex-col items-center text-center p-8">
              <Download className="w-12 h-12 text-amber-400 mb-4" />
              <h2 className="text-xl font-medium text-slate-200 mb-4">{t('references.copyright')}</h2>
              <a
                href="/documents/copyright-checklist.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 glass rounded-xl text-amber-300 hover:text-amber-200 transition-all font-medium"
              >
                View PDF Checklist
              </a>
            </GlassCard>
          </section>

          {/* Clean Lists */}
          <GlassCard className="p-8 space-y-10">
            {/* Tech Stack */}
            <div>
              <h2 className="text-2xl font-light text-slate-200 mb-6 border-b border-white/10 pb-2">Tech Stack</h2>
              <ul className="space-y-3">
                {techStack.map((item, i) => (
                  <li key={i} className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-300">{item.category}</span>
                    <span className="text-sm italic">{item.tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Libraries */}
            <div>
              <h2 className="text-2xl font-light text-slate-200 mb-6 border-b border-white/10 pb-2">Additional Libraries</h2>
              <ul className="space-y-3">
                {additionalLibraries.map((lib, i) => (
                  <li key={i} className="flex justify-between items-center text-slate-400">
                    <span className="text-slate-300 font-mono text-sm">{lib.name}</span>
                    <span className="text-sm italic text-right">{lib.purpose}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Image Links */}
            <div>
              <h2 className="text-2xl font-light text-slate-200 mb-6 border-b border-white/10 pb-2">Resource Image Sources</h2>
              <ul className="space-y-3">
                {resourceImages.map((img, i) => (
                  <li key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 overflow-hidden">
                    <span className="text-slate-300 text-sm whitespace-nowrap">{img.title}</span>
                    <a
                      href={img.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-teal-400 hover:text-teal-300 transition-colors truncate sm:max-w-[60%]"
                    >
                      {img.url}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Research Links */}
            <div>
              <h2 className="text-2xl font-light text-slate-200 mb-6 border-b border-white/10 pb-2">Research & Documentation</h2>
              <ul className="space-y-3">
                {researchLinks.map((link, i) => (
                  <li key={i} className="flex justify-between items-center">
                    <span className="text-slate-300 text-sm">{link.title}</span>
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-teal-400 hover:text-teal-300"
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
