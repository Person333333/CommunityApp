import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleQuestion, X, Send, Bot, BookOpen, Compass, Search } from 'lucide-react';
import { useState } from 'react';
import GlassCard from './GlassCard';
import { aiSearchService } from '@/react-app/services/aiSearch';

interface HelperButtonProps {
  onShowTour?: () => void;
}

export default function HelperButton({ onShowTour }: HelperButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([
    {
      role: 'assistant',
      content: 'Hi! I\'m your Community Compass helper. How can I assist you today? You can ask me about finding resources, using the map, or getting help with any feature!'
    }
  ]);

  const quickActions = [
    {
      icon: <Compass className="w-4 h-4" />,
      label: 'Start Tour',
      action: () => {
        onShowTour?.();
        setIsOpen(false);
      }
    },
    {
      icon: <Search className="w-4 h-4" />,
      label: 'How to Search',
      action: () => {
        handleHelperResponse('How do I search for resources effectively?');
      }
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      label: 'Categories Guide',
      action: () => {
        handleHelperResponse('What types of resources can I find?');
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
        const response = await aiSearchService.generateHelpMessage(userMessage);
        setChatHistory(prev => [...prev, { role: 'assistant', content: response }]);
      } else {
        // Fallback to rule-based responses
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
        const response = await aiSearchService.generateHelpMessage(question);
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
      return `You can search for resources in several ways:\n\n• **Keyword Search**: Use the search bar to find specific resources by name, description, or tags\n• **Category Filters**: Select multiple categories to filter results (you can choose more than one!)\n• **Location Filter**: Toggle between local resources (within ~200 miles) or all resources\n• **Favorites**: Save frequently used resources for quick access\n\nPro tip: Try combining search terms with category filters for the best results!`;
    }

    if (lowerQuestion.includes('category') || lowerQuestion.includes('type') || lowerQuestion.includes('what')) {
      return `Community Compass includes these resource categories:\n\n• **Food Assistance** - Food banks, meal programs, nutrition help\n• **Healthcare** - Clinics, medical services, health programs\n• **Housing** - Shelter, rental assistance, housing support\n• **Employment** - Job training, career services, employment help\n• **Education** - Tutoring, GED programs, educational resources\n• **Senior Services** - Programs for older adults\n• **Mental Health** - Counseling, therapy, mental health support\n• **Legal Aid** - Legal assistance, court help\n• **Transportation** - Ride services, transit help\n• **Child Care** - Daycare, after-school programs\n• **Veterans Services** - Programs for veterans\n• **Financial Assistance** - Money help, financial aid\n\nSelect multiple categories in the filter to see all relevant resources!`;
    }

    if (lowerQuestion.includes('map') || lowerQuestion.includes('location')) {
      return `The interactive map helps you visualize resource locations:\n\n• **Map View**: See all resources plotted on an interactive map\n• **Density View**: Toggle heatmap to see resource concentration\n• **Local Filter**: Focus on resources within ~200 miles\n• **Click Resources**: Select any map pin to see detailed information\n• **Zoom & Pan**: Navigate the map to explore different areas\n\nThe map is especially helpful for planning visits to multiple resources!`;
    }

    if (lowerQuestion.includes('favorite') || lowerQuestion.includes('save')) {
      return `Favorites help you keep track of useful resources:\n\n• **Save Resources**: Click the heart icon on any resource to save it\n• **Quick Access**: Your favorites appear in a special filtered view\n• **Sync Across Devices**: Favorites are tied to your account\n• **Remove Favorites**: Click the heart again to remove from favorites\n\nPerfect for resources you use regularly or want to remember!`;
    }

    if (lowerQuestion.includes('submit') || lowerQuestion.includes('add') || lowerQuestion.includes('suggest')) {
      return `Know a resource that should be listed? Submit it!\n\n• **Add Resource**: Use the "Add Resource" page to submit new listings\n• **Review Process**: All submissions are reviewed before being published\n• **Required Info**: Include contact details, services offered, and location\n• **Help Community**: Your submissions help others find needed resources\n\nWe appreciate community contributions to keep our database comprehensive!`;
    }

    return `I can help you with:\n\n• 🔍 Finding and searching resources\n• 📍 Using the interactive map\n• ❤️ Managing favorites\n• 📝 Submitting new resources\n• 🎯 Understanding different categories\n• 🚀 Taking a guided tour\n\nTry asking me about any of these topics, or click one of the quick action buttons above!`;
  };

  return (
    <>
      {/* Helper Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-teal-600 to-amber-600 rounded-full flex items-center justify-center shadow-lg z-40 hover:shadow-xl transition-shadow"
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
                <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-amber-500 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-100">Community Helper</h3>
                  <p className="text-xs text-slate-400">Ask me anything!</p>
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
                      className="flex items-center gap-2 px-3 py-2 glass-teal rounded-lg text-xs text-slate-200 hover:glass-strong transition-all"
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
                      className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        msg.role === 'user'
                          ? 'bg-gradient-to-r from-teal-600 to-amber-600 text-white'
                          : 'glass-teal text-slate-200'
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
                    <div className="glass-teal p-3 rounded-lg">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                    placeholder="Ask a question..."
                    className="flex-1 glass-teal border border-white/10 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    className="w-8 h-8 bg-gradient-to-r from-teal-600 to-amber-600 rounded-lg flex items-center justify-center disabled:opacity-50"
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
