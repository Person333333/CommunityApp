import { FileText, Download, Info } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-transparent pt-24 pb-12 px-3 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-black text-white drop-shadow-sm mb-4 uppercase tracking-tighter">
            {t('references.title')}
          </h1>
          <p className="text-xl text-blue-300 font-bold italic">
            {t('references.subtitle')}
          </p>
        </div>

        <div className="space-y-12 pb-10">
          {/* Professional Documents Section */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <GlassCard hover className="flex flex-col items-center text-center p-8 bg-blue-500/10 border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
              <FileText className="w-12 h-12 text-blue-400 mb-4" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm mb-4">{t('references.workLog')}</h2>
              <a
                href="/documents/work-log.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 rounded-xl text-white transition-all font-bold shadow-sm"
              >
                View PDF Work Log
              </a>
            </GlassCard>

            <GlassCard hover className="flex flex-col items-center text-center p-8 bg-amber-500/10 border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
              <Download className="w-12 h-12 text-amber-500 mb-4" />
              <h2 className="text-xl font-bold text-white drop-shadow-sm mb-4">{t('references.copyright')}</h2>
              <a
                href="/documents/copyright-checklist.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/40 border border-amber-500/30 rounded-xl text-white transition-all font-bold shadow-sm"
              >
                View PDF Checklist
              </a>
            </GlassCard>
          </section>

          {/* Project Information */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-md">
            <h2 className="text-2xl font-black text-white drop-shadow-sm mb-6 flex items-center gap-2 border-b border-white/10 pb-2 uppercase tracking-widest">
              <Info className="w-6 h-6 text-blue-400" /> Project Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-slate-300">
               <div>
                  <h3 className="font-bold text-blue-300 mb-2 uppercase tracking-wider text-xs">Event</h3>
                  <p className="font-bold text-lg text-white">Washington TSA Webmaster (HS)</p>
               </div>
               <div>
                  <h3 className="font-bold text-blue-300 mb-2 uppercase tracking-wider text-xs">Chapter</h3>
                  <p className="font-bold text-lg text-white">2139 (Kenmore Area)</p>
               </div>
               <div>
                  <h3 className="font-bold text-blue-300 mb-2 uppercase tracking-wider text-xs">Theme</h3>
                  <p className="font-bold text-lg text-white">Community Resource Hub</p>
               </div>
               <div>
                  <h3 className="font-bold text-blue-300 mb-2 uppercase tracking-wider text-xs">Team Members</h3>
                  <ul className="list-disc pl-5 font-bold space-y-1 mt-1 text-white">
                    <li>Nathan Choy</li>
                    <li>Nikhil Vincent</li>
                    <li>George Xu</li>
                  </ul>
               </div>
            </div>
          </div>

          {/* Other Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Tech Stack */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-md">
              <h2 className="text-2xl font-black text-white drop-shadow-sm mb-6 border-b border-white/10 pb-2 uppercase tracking-widest">Tech Stack</h2>
              <ul className="space-y-4">
                {techStack.map((item, i) => (
                  <li key={i} className="flex justify-between items-center text-slate-300">
                    <span className="text-white font-bold text-sm tracking-tight">{item.category}</span>
                    <span className="text-xs italic font-bold text-indigo-400 text-right ml-4">{item.tech}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Libraries */}
            <div className="bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-md">
              <h2 className="text-2xl font-black text-white drop-shadow-sm mb-6 border-b border-white/10 pb-2 uppercase tracking-widest">Libraries</h2>
              <ul className="space-y-4">
                {additionalLibraries.map((lib, i) => (
                  <li key={i} className="flex justify-between items-center text-slate-300">
                    <span className="text-indigo-300 font-mono text-xs font-bold">{lib.name}</span>
                    <span className="text-xs italic font-bold text-right ml-4">{lib.purpose}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Organization Links */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 backdrop-blur-md">
            <h2 className="text-2xl font-black text-white drop-shadow-sm mb-6 border-b border-white/10 pb-2 uppercase tracking-widest">Citations & Organizations</h2>
            <div className="grid grid-cols-1 gap-4">
              {resourceLinks.map((org, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <span className="text-white text-sm font-bold uppercase tracking-tight">{org.title}</span>
                  <a
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-200 transition-colors truncate font-black tracking-tighter"
                  >
                    {org.url}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
