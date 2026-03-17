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
    { code: i18n.language || 'en', name: (i18n.language || 'en').toUpperCase() };

  const handleLanguageChange = async (langCode: string) => {
    // If switching to English, do it immediately
    if (langCode === 'en') {
      i18n.changeLanguage('en');
      setIsOpen(false);
      return;
    }

    // Cache busting check
    const currentVersion = enTranslations.app.version;
    const cachedVersion = localStorage.getItem(`translation_version_${langCode}`);

    // Check if translation already exists and is up to date
    if (i18n.hasResourceBundle(langCode, 'translation') && cachedVersion === currentVersion) {
      i18n.changeLanguage(langCode);
      setIsOpen(false);
      return;
    }

    // Clear existing bundle if version mismatch to force re-translation
    if (cachedVersion !== currentVersion && i18n.hasResourceBundle(langCode, 'translation')) {
      console.log(`Refreshing translations for ${langCode} (version ${cachedVersion} -> ${currentVersion})`);
    }

    // If not, we need to translate 'en' resources
    try {
      setIsTranslating(true);
      const translatedResources = await TranslateService.translateJSON(enTranslations, langCode);
      i18n.addResourceBundle(langCode, 'translation', translatedResources, true, true);
      localStorage.setItem(`translation_version_${langCode}`, currentVersion);
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
        }}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass-layer hover:bg-white/10 transition-all shadow-sm font-bold text-white border border-white/10"
        disabled={isTranslating}
      >
        {isTranslating ? (
          <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
        ) : (
          <Globe className="w-4 h-4" />
        )}
        <span className="text-sm hidden md:inline">{currentLanguage.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 glass-layer border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col transform origin-top-right motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in backdrop-blur">
          {/* Search Header */}
          <div className="p-3 border-b border-white/10 bg-white/5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium"
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
                  className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between font-bold ${i18n.language === lang.code ? 'bg-blue-600/30 text-white hover:bg-blue-600/40 border-l-2 border-blue-400' : 'text-slate-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  <span className="truncate">{lang.name}</span>
                  {i18n.language === lang.code && <Check className="w-4 h-4 text-blue-400 flex-shrink-0" />}
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
