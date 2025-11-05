import { motion } from 'framer-motion';
import { Book, Code, Copyright, Clock, ExternalLink, GitBranch } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';

export default function References() {
  const workLog = [
    { date: '2024-09-10', task: 'Project kickoff', details: 'Initial planning, IA, and visual direction for glassmorphism theme' },
    { date: '2024-09-18', task: 'Scaffold React app', details: 'Vite + React + TS, Tailwind CSS configured with custom glass utilities' },
    { date: '2024-09-27', task: 'Core UI components', details: 'Navbar, GlassCard, GlassButton, animated hero and compass' },
    { date: '2024-10-05', task: 'Neon DB setup', details: 'Provision Neon Postgres and add resources/submissions tables + migration' },
    { date: '2024-10-12', task: 'API with Hono', details: 'Resources list/detail and stats endpoints served via Workers' },
    { date: '2024-10-19', task: 'Discover page', details: 'Search, category filters, and glassy layout for resource grid' },
    { date: '2024-10-27', task: 'Map integration', details: 'Leaflet map with OSM tiles, custom markers, and selection' },
    { date: '2024-11-05', task: 'Auth integration', details: 'Clerk auth with custom Sign In/Up forms (email code + password)' },
    { date: '2024-11-06', task: 'Resource modal', details: 'Detailed modal with contact info, tags, and actions' },
    { date: '2024-11-07', task: 'Favorites', details: 'Favorites table, API endpoints, and UI with filter' },
    { date: '2024-11-08', task: 'Geocoding and density view', details: 'Lat/lng columns, real coordinates for map and zoom-aware density circles' },
    { date: '2024-11-09', task: 'Footer & About', details: 'Company-style footer and About page with vision/mission/values' }
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
    { category: 'Frontend Framework', tech: 'React 18 with TypeScript', version: 'Latest' },
    { category: 'Build Tool', tech: 'Vite', version: '5.x' },
    { category: 'Styling', tech: 'Tailwind CSS', version: '3.x' },
    { category: 'Animation', tech: 'Framer Motion', version: '11.x' },
    { category: 'Routing', tech: 'React Router', version: '7.x' },
    { category: 'Backend Runtime', tech: 'Cloudflare Workers', version: 'Latest' },
    { category: 'Backend Framework', tech: 'Hono', version: '4.x' },
    { category: 'Database', tech: 'Neon (Postgres serverless)', version: 'Latest' },
    { category: 'Authentication', tech: 'Clerk', version: 'Latest' },
    { category: 'Maps', tech: 'Leaflet + React Leaflet', version: 'Latest' },
    { category: 'Validation', tech: 'Zod', version: '3.x' }
  ];

  const additionalLibraries = [
    { name: '@clerk/clerk-react', purpose: 'Authentication and user management', license: 'MIT' },
    { name: 'leaflet', purpose: 'Interactive mapping functionality', license: 'BSD 2-Clause' },
    { name: 'react-leaflet', purpose: 'React components for Leaflet maps', license: 'Hippocratic License' },
    { name: '@types/leaflet', purpose: 'TypeScript definitions for Leaflet', license: 'MIT' },
    { name: 'lucide-react', purpose: 'Icon library for UI components', license: 'ISC' }
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
    { title: 'Tailwind CSS Docs', url: 'https://tailwindcss.com/docs', topic: 'Utility-first CSS framework' }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            References & Documentation
          </h1>
          <p className="text-xl text-slate-300">
            Complete development documentation and attribution
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
              <div className="flex items-center gap-3 mb-6">
                <Clock className="w-6 h-6 text-teal-400" />
                <h2 className="text-2xl font-bold text-slate-100">Work Log</h2>
              </div>
              
              <div className="space-y-4">
                {workLog.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + index * 0.1 }}
                    className="border-l-2 border-teal-400/30 pl-4 pb-4"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm text-teal-300 font-mono">{entry.date}</span>
                      <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                    </div>
                    <h3 className="font-semibold text-slate-100 mb-1">{entry.task}</h3>
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
              <div className="flex items-center gap-3 mb-6">
                <Copyright className="w-6 h-6 text-teal-400" />
                <h2 className="text-2xl font-bold text-slate-100">Copyright Checklist</h2>
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
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-slate-100">{item.item}</h3>
                      <p className="text-sm text-slate-400 mt-1">{item.note}</p>
                    </div>
                    <span className="text-xs text-green-300 px-2 py-1 bg-green-400/20 rounded-full">
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
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-6 h-6 text-teal-400" />
                <h2 className="text-2xl font-bold text-slate-100">Code Stack</h2>
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
                    <h3 className="font-medium text-slate-100 mb-1">{item.category}</h3>
                    <p className="text-teal-300">{item.tech}</p>
                    <span className="text-xs text-slate-400">{item.version}</span>
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
              <div className="flex items-center gap-3 mb-6">
                <GitBranch className="w-6 h-6 text-teal-400" />
                <h2 className="text-2xl font-bold text-slate-100">Additional Libraries Utilized</h2>
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
                      <h3 className="font-mono text-teal-300 text-sm">{lib.name}</h3>
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
              <div className="flex items-center gap-3 mb-6">
                <ExternalLink className="w-6 h-6 text-teal-400" />
                <h2 className="text-2xl font-bold text-slate-100">Image Links</h2>
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
              <div className="flex items-center gap-3 mb-6">
                <Book className="w-6 h-6 text-teal-400" />
                <h2 className="text-2xl font-bold text-slate-100">Research Links</h2>
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
                      <h3 className="font-medium text-slate-100 group-hover:text-teal-300 transition-colors">
                        {link.title}
                      </h3>
                      <ExternalLink className="w-4 h-4 text-teal-400 group-hover:text-teal-300 transition-colors" />
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
