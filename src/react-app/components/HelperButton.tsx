import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleQuestion, X, Send, Bot, BookOpen, Compass, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { aiSearchService } from '@/react-app/services/aiSearch';
import { useTranslation } from 'react-i18next';

interface HelperButtonProps {
  onShowTour?: () => void;
}

export default function HelperButton({ onShowTour }: HelperButtonProps) {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: t('helper.greeting')
    }
  ]);

  // Update greeting when language changes
  useEffect(() => {
    setChatHistory(prev => {
      if (prev.length === 1 && prev[0].role === 'assistant') {
        return [{ role: 'assistant', content: t('helper.greeting') }];
      }
      return prev;
    });
  }, [i18n.language, t]);

  const quickActions = [
    {
      icon: <Compass className="w-4 h-4" />,
      label: t('helper.startTour'),
      action: () => {
        onShowTour?.();
        setIsOpen(false);
      }
    },
    {
      icon: <Search className="w-4 h-4" />,
      label: t('helper.howToSearch'),
      action: () => {
        handleHelperResponse(t('helper.searchQuestion'));
      }
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: t('helper.categoriesGuide'),
      action: () => {
        handleHelperResponse(t('helper.categoriesQuestion'));
      }
    }
  ];

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setChatHistory(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      // Use AI service if available, otherwise fallback to rule-based responses
      if (aiSearchService.isAvailable()) {
        let response = await aiSearchService.generateHelpMessage(userMessage, chatHistory);

        // Translate response if not in English
        if (i18n.language !== 'en') {
          try {
            const { TranslateService } = await import('@/react-app/services/translateService');
            const translated = await TranslateService.translateText(response, i18n.language);
            response = Array.isArray(translated) ? translated[0] : translated;
          } catch (err) {
            console.error('Translation failed:', err);
          }
        }

        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
      } else {
        // Fallback to rule-based responses (already translated via t())
        const response = generateHelperResponse(userMessage);
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      console.error('Helper message failed:', error);
      // Fallback response
      const response = generateHelperResponse(userMessage);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleHelperResponse = async (question: string) => {
    setChatHistory(prev => [...prev, { role: 'user', content: question }]);
    setIsTyping(true);

    try {
      if (aiSearchService.isAvailable()) {
        let response = await aiSearchService.generateHelpMessage(question, chatHistory);

        // Translate response if not in English
        if (i18n.language !== 'en') {
          try {
            const { TranslateService } = await import('@/react-app/services/translateService');
            const translated = await TranslateService.translateText(response, i18n.language);
            response = Array.isArray(translated) ? translated[0] : translated;
          } catch (err) {
            console.error('Translation failed:', err);
          }
        }

        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
      } else {
        const response = generateHelperResponse(question);
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
      }
    } catch (error) {
      const response = generateHelperResponse(question);
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
    } finally {
      setIsTyping(false);
    }
  };

  const generateHelperResponse = (question: string): string => {
    const lowerQuestion = question.toLowerCase();

    if (lowerQuestion.includes('search') || lowerQuestion.includes('find')) {
      return t('helper.searchResponse');
    }

    if (lowerQuestion.includes('category') || lowerQuestion.includes('type') || lowerQuestion.includes('what')) {
      return t('helper.categoriesResponse');
    }

    if (lowerQuestion.includes('map') || lowerQuestion.includes('location')) {
      return t('helper.mapResponse');
    }

    if (lowerQuestion.includes('favorite') || lowerQuestion.includes('save')) {
      return t('helper.favoritesResponse');
    }

    if (lowerQuestion.includes('submit') || lowerQuestion.includes('add') || lowerQuestion.includes('suggest')) {
      return t('helper.submitResponse');
    }

    return t('helper.defaultResponse');
  };

  return (
    <>
      {/* Helper Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        data-tour="helper-button"
        className="fixed bottom-6 right-6 w-16 h-16 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg hover:shadow-blue-600/30 z-40 transition-all"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X className="w-6 h-6 text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 180, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -180, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageCircleQuestion className="w-6 h-6 text-white" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 right-6 w-96 max-h-[600px] z-40"
          >
            <GlassCard variant="strong" className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-white drop-shadow-sm text-sm">{t('helper.title')}</h3>
                  <p className="text-xs text-slate-400 font-medium">{t('helper.subtitle')}</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-3 border-b border-white/10">
                <div className="flex gap-2">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={action.action}
                      className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs text-slate-300 font-bold transition-all shadow-sm"
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-80">
                {chatHistory.map((msg, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-4 rounded-xl text-sm shadow-sm ${msg.role === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-white/5 border border-white/10 text-slate-300 rounded-tl-none font-medium'
                        }`}
                    >
                      {msg.content.split('\n').map((line, i) => (
                        <div key={i}>
                          {line.startsWith('•') ? (
                            <div className="flex items-start gap-2">
                              <span>{line}</span>
                            </div>
                          ) : line.startsWith('**') ? (
                            <div className="font-semibold mt-2">{line.replace(/\*\*/g, '')}</div>
                          ) : (
                            <div>{line}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                  >
                    <div className="bg-white/5 border border-white/10 p-3 rounded-2xl rounded-tl-none shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2.5 h-2.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Input */}
              <div className="p-4 border-t border-white/10">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={t('helper.inputPlaceholder')}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-400/50 focus:bg-white/10 font-bold transition-all"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center justify-center disabled:opacity-50 shadow-sm transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </motion.button>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
