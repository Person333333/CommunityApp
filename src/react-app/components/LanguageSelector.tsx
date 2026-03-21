import { useState, useEffect } from 'react';
import { Globe, Check, Search } from 'lucide-react';
import { useClickOutside } from '@/react-app/hooks/useClickOutside';
import { SUPPORTED_LANGUAGES } from '@/react-app/constants/languages';

export default function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLang, setCurrentLang] = useState('en');
  
  const languageSelectorRef = useClickOutside<HTMLDivElement>(() => setIsOpen(false));

  const mapCode = (code: string) => code === 'zh-cn' ? 'zh-CN' : code === 'zh-tw' ? 'zh-TW' : code;

  const currentLanguageObj = SUPPORTED_LANGUAGES.find(l => mapCode(l.code) === currentLang) ||
    { code: currentLang, name: currentLang.toUpperCase() };

  useEffect(() => {
    // Inject the native Google Translate script silently
    if (!document.getElementById('google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      
      // @ts-ignore
      window.googleTranslateElementInit = () => {
        // @ts-ignore
        new window.google.translate.TranslateElement(
          { pageLanguage: 'en', autoDisplay: false },
          'google_translate_element'
        );
      };

      document.body.appendChild(script);
    }

    // Brutal MutationObserver to permanently eradicate Google's injected banner and body shifts
    const observer = new MutationObserver(() => {
        // Kill the banner iframe instantly
        const banner = document.querySelector('.goog-te-banner-frame');
        if (banner) banner.remove();
        
        const skiptransDiv = document.querySelector('.skiptranslate > iframe.goog-te-banner-frame')?.parentElement;
        if (skiptransDiv && skiptransDiv.id !== 'google_translate_element') {
            skiptransDiv.remove();
        }

        // Forcefully clamp document body to top 0
        if (document.body.style.top && document.body.style.top !== '0px') {
            document.body.style.top = '0px';
        }
        if (document.documentElement.style.top && document.documentElement.style.top !== '0px') {
            document.documentElement.style.top = '0px';
        }
    });

    observer.observe(document.body, { 
        childList: true, 
        subtree: true, 
        attributes: true, 
        attributeFilter: ['style', 'class'] 
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });
    
    // Periodically sync our UI state with the hidden Google Translate dropdown
    const interval = setInterval(() => {
        const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
        if (select && select.value && select.value !== currentLang) {
            setCurrentLang(select.value || 'en');
        } else if (select && !select.value && currentLang !== 'en') {
            setCurrentLang('en');
        }
        
        // Redundant cleanup just in case
        const banner = document.querySelector('.goog-te-banner-frame');
        if (banner) banner.remove();
        if (document.body.style.top !== '0px' && document.body.style.top !== '') document.body.style.top = '0px';
    }, 500);

    return () => {
        clearInterval(interval);
        observer.disconnect();
    };
  }, [currentLang]);

  const handleLanguageChange = (rawCode: string) => {
    const langCode = mapCode(rawCode);
    setCurrentLang(langCode);
    setIsOpen(false);
    
    // Find the hidden Google Translate dropdown and force a DOM change event
    const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (select) {
        select.value = langCode;
        select.dispatchEvent(new Event('change'));
    }
  };

  const filteredLanguages = SUPPORTED_LANGUAGES.filter(lang =>
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div ref={languageSelectorRef} className="relative notranslate">
      {/* Hidden Google Translate Target */}
      <div id="google_translate_element" className="hidden"></div>
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg glass-layer hover:bg-muted/80 transition-all shadow-sm font-bold text-foreground border border-border"
      >
        <Globe className="w-4 h-4 text-emerald-500" />
        <span className="text-sm hidden md:inline">{currentLanguageObj.name === 'EN' ? 'English' : currentLanguageObj.name}</span>
      </button>

      {isOpen && (
        <div className="absolute top-12 right-0 mt-2 w-[280px] glass-layer border border-border rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col transform origin-top-right motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in backdrop-blur">
          {/* Search Header */}
          <div className="p-3 border-b border-border bg-muted/50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search languages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-lg pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium"
                autoFocus
              />
            </div>
          </div>

          {/* Scrollable Language List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredLanguages.length > 0 ? (
              filteredLanguages.map((lang) => {
                const isSelected = currentLang === mapCode(lang.code) || (currentLang === 'en' && lang.code === 'en');
                return (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageChange(lang.code)}
                    className={`w-full text-left px-5 py-3 text-sm transition-colors flex items-center justify-between font-bold ${isSelected ? 'bg-emerald-600/30 text-foreground hover:bg-emerald-600/40 border-l-2 border-emerald-400' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                  >
                    <span className="truncate">{lang.name}</span>
                    {isSelected && <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />}
                  </button>
                );
              })
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
