import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, Loader2, Search } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/react-app/constants/languages';
import { TranslateService } from '@/react-app/services/translateService';
import enTranslations from '@/react-app/i18n/locales/en.json';

export default function LanguageSelector() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === i18n.language) ||
    { code: i18n.language, name: i18n.language.toUpperCase() };

  const handleLanguageChange = async (langCode: string) => {
    // Check if translation already exists
    if (i18n.hasResourceBundle(langCode, 'translation')) {
      i18n.changeLanguage(langCode);
      setIsOpen(false);
      return;
    }

    // If not, we need to translate 'en' resources
    try {
      setIsTranslating(true);
      const translatedResources = await TranslateService.translateJSON(enTranslations, langCode);
      i18n.addResourceBundle(langCode, 'translation', translatedResources, true, true);
      i18n.changeLanguage(langCode);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to translate:", error);
      alert("Failed to load translation. Please try again.");
    } finally {
      setIsTranslating(false);
    }
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          // Focus search input when opening? 
          // We can't easily ref it here without more code, but standard behavior usually fine.
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass-morphism hover:bg-white/10 transition-colors"
        disabled={isTranslating}
      >
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
        <span className="text-sm hidden md:inline">{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 glass-morphism rounded-lg shadow-lg z-50 overflow-hidden flex flex-col">
          {/* Search Header */}
          <div className="p-2 border-b border-white/10 bg-black/20 backdrop-blur-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable Language List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/10 transition-colors flex items-center justify-between ${i18n.language === lang.code ? 'bg-blue-500/20 text-blue-100' : 'text-slate-200'
                    }`}
                >
                  <span className="truncate">{lang.name}</span>
                  {i18n.language === lang.code && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-xs text-slate-500">
                No languages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
