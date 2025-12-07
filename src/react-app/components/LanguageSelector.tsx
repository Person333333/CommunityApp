import { useTranslation } from '@/react-app/contexts/LanguageProvider';
import { Globe } from 'lucide-react';

export default function LanguageSelector() {
  const { language, setLanguage } = useTranslation();

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'zh', name: '中文' }
  ];

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 px-3 py-2 rounded-lg glass-morphism hover:bg-white/10 transition-colors">
        <Globe className="w-4 h-4" />
        <span className="text-sm">{languages.find(l => l.code === language)?.name}</span>
      </button>
      
      <div className="absolute top-full right-0 mt-2 w-48 glass-morphism rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => setLanguage(lang.code as any)}
            className={`w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg ${
              language === lang.code ? 'bg-white/20' : ''
            }`}
          >
            {lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}
