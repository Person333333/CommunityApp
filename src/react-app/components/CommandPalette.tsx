import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ArrowRight, Compass, MapPin, FileText, Users, Moon, Sun, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router';
import { categoryHierarchy } from '@/shared/categoryHierarchy';

interface CommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  keywords: string[];
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery('');
    setSelectedIndex(0);
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setQuery('');
        setSelectedIndex(0);
      }
      if (e.key === 'Escape' && isOpen) {
        close();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, close]);

  const commands: CommandItem[] = useMemo(() => {
    const nav: CommandItem[] = [
      { id: 'home', label: 'Go to Home', description: 'Return to the homepage', icon: <Compass className="w-4 h-4" />, action: () => { navigate('/'); close(); }, keywords: ['home', 'main', 'start'] },
      { id: 'discover', label: 'Go to Discover', description: 'Browse community resources', icon: <Search className="w-4 h-4" />, action: () => { navigate('/discover'); close(); }, keywords: ['discover', 'browse', 'search', 'resources', 'find'] },
      { id: 'submit', label: 'Submit a Resource', description: 'Add a new community resource', icon: <FileText className="w-4 h-4" />, action: () => { navigate('/submit'); close(); }, keywords: ['submit', 'add', 'new', 'resource', 'contribute'] },
      { id: 'about', label: 'About Us', description: 'Learn about Community Compass', icon: <Users className="w-4 h-4" />, action: () => { navigate('/about'); close(); }, keywords: ['about', 'team', 'mission', 'story'] },
      { id: 'references', label: 'References', description: 'Documentation and credits', icon: <FileText className="w-4 h-4" />, action: () => { navigate('/references'); close(); }, keywords: ['references', 'docs', 'credits', 'tech'] },
    ];

    const toggles: CommandItem[] = [
      { id: 'dark-mode', label: 'Toggle Dark Mode', description: 'Switch between light and dark themes', icon: document.documentElement.classList.contains('dark') ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />, action: () => { document.documentElement.classList.toggle('dark'); localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light'); close(); }, keywords: ['dark', 'light', 'theme', 'mode', 'toggle'] },
      { id: 'high-contrast', label: 'Toggle High Contrast', description: 'Increase visual contrast', icon: <HelpCircle className="w-4 h-4" />, action: () => { document.documentElement.classList.toggle('high-contrast'); close(); }, keywords: ['contrast', 'accessibility', 'vision'] },
    ];

    // Build category shortcuts from categoryHierarchy
    const categoryShortcuts: CommandItem[] = Object.keys(categoryHierarchy).slice(0, 8).map(cat => ({
      id: `cat-${cat}`,
      label: `Find ${cat}`,
      description: `Browse ${cat} resources`,
      icon: <MapPin className="w-4 h-4" />,
      action: () => { navigate(`/discover?category=${encodeURIComponent(cat)}`); close(); },
      keywords: [cat.toLowerCase(), ...cat.toLowerCase().split(/[\s&]+/)],
    }));

    return [...nav, ...toggles, ...categoryShortcuts];
  }, [navigate, close]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands.slice(0, 8);
    const q = query.toLowerCase();
    return commands.filter(cmd =>
      cmd.label.toLowerCase().includes(q) ||
      cmd.description.toLowerCase().includes(q) ||
      cmd.keywords.some(k => k.includes(q))
    ).slice(0, 8);
  }, [query, commands]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleNav = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter' && filteredCommands[selectedIndex]) {
        e.preventDefault();
        filteredCommands[selectedIndex].action();
      }
    };
    document.addEventListener('keydown', handleNav);
    return () => document.removeEventListener('keydown', handleNav);
  }, [isOpen, selectedIndex, filteredCommands]);

  // Reset selection when query changes
  useEffect(() => { setSelectedIndex(0); }, [query]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="fixed top-[20%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
          >
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  autoFocus
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="flex-1 bg-transparent outline-none text-slate-900 dark:text-slate-100 placeholder-slate-400 text-sm font-medium"
                />
                <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold text-slate-500 dark:text-slate-400">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div className="max-h-80 overflow-y-auto p-2">
                {filteredCommands.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-sm font-medium">
                    No results found for "{query}"
                  </div>
                ) : (
                  filteredCommands.map((cmd, i) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                        i === selectedIndex
                          ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                      }`}
                    >
                      <span className={`p-2 rounded-lg ${i === selectedIndex ? 'bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{cmd.label}</div>
                        <div className="text-xs text-slate-400 truncate">{cmd.description}</div>
                      </div>
                      {i === selectedIndex && <ArrowRight className="w-4 h-4 text-blue-500 flex-shrink-0" />}
                    </button>
                  ))
                )}
              </div>

              {/* Footer hint */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>↑↓ Navigate</span>
                <span>↵ Select</span>
                <span>ESC Close</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
