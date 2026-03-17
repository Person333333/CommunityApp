import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Compass, Search, Sparkles, Globe, Bot, PlusCircle, FolderHeart, MapPinned, Star } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import GlassCard from './GlassCard';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router';

interface TourStep {
  id: string;
  titleKey: string;
  contentKey: string;
  target?: string;
  path?: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface UserTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function UserTour({ isOpen, onClose, onComplete }: UserTourProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  const tourSteps: TourStep[] = useMemo(() => [
    {
      id: 'welcome',
      titleKey: 'tour.welcome.title',
      contentKey: 'tour.welcome.content',
      path: '/',
      position: 'center'
    },
    {
      id: 'discover',
      titleKey: 'tour.discover.title',
      contentKey: 'tour.discover.content',
      target: '[data-tour="search"]',
      path: '/discover',
      position: 'bottom'
    },
    {
      id: 'explorer',
      titleKey: 'tour.explorer.title',
      contentKey: 'tour.explorer.content',
      target: '[data-tour="category-explorer"]',
      path: '/discover',
      position: 'bottom'
    },
    {
      id: 'highlights',
      titleKey: 'tour.highlights.title',
      contentKey: 'tour.highlights.content',
      target: '[data-tour="highlights-sidebar"]',
      path: '/discover',
      position: 'left'
    },
    {
      id: 'ai-search',
      titleKey: 'tour.aiSearch.title',
      contentKey: 'tour.aiSearch.content',
      target: '[data-tour="ai-search"]',
      path: '/discover',
      position: 'bottom'
    },
    {
      id: 'my-resources',
      titleKey: 'tour.myResources.title',
      contentKey: 'tour.myResources.content',
      target: '[data-tour="my-resources"]',
      path: '/discover',
      position: 'bottom'
    },
    {
      id: 'translation',
      titleKey: 'tour.translation.title',
      contentKey: 'tour.translation.content',
      target: '[data-tour="language-selector"]',
      position: 'bottom'
    },
    {
      id: 'unified-map',
      titleKey: 'tour.unifiedMap.title',
      contentKey: 'tour.unifiedMap.content',
      target: '[data-tour="map-toggle"]',
      path: '/discover',
      position: 'bottom'
    },
    {
      id: 'add-resource',
      titleKey: 'tour.addResource.title',
      contentKey: 'tour.addResource.content',
      target: '[data-tour="add-resource"]',
      path: '/submit',
      position: 'bottom'
    },
    {
      id: 'board',
      titleKey: 'tour.board.title',
      contentKey: 'tour.board.content',
      target: '[data-tour="bulletin-board"]',
      path: '/',
      position: 'bottom'
    },
    {
      id: 'helper',
      titleKey: 'tour.helper.title',
      contentKey: 'tour.helper.content',
      target: '[data-tour="helper-button"]',
      position: 'top'
    },
    {
      id: 'complete',
      titleKey: 'tour.complete.title',
      contentKey: 'tour.complete.content',
      position: 'center'
    }
  ], []);

  useEffect(() => {
    if (!isOpen) return;
    const step = tourSteps[currentStep];
    if (step.path && location.pathname !== step.path) {
      navigate(step.path);
    }
  }, [currentStep, isOpen, navigate, location.pathname, tourSteps]);

  useEffect(() => {
    if (!isOpen) {
      if (highlightedElement) {
        highlightedElement.removeAttribute('data-tour-highlighted');
        setHighlightedElement(null);
      }
      return;
    }

    const step = tourSteps[currentStep];
    let pollTimer: NodeJS.Timeout;
    let attempts = 0;
    const maxAttempts = 20;

    const findAndHighlight = () => {
      if (step.target) {
        const element = document.querySelector(step.target);

        if (element) {
          if (highlightedElement) {
            highlightedElement.removeAttribute('data-tour-highlighted');
          }

          element.setAttribute('data-tour-highlighted', 'true');
          setHighlightedElement(element);

          const style = window.getComputedStyle(element);
          if (style.position !== 'fixed') {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        } else {
          attempts++;
          if (attempts < maxAttempts) {
            pollTimer = setTimeout(findAndHighlight, 250);
          } else {
            console.warn(`Tour step ${step.id}: Target ${step.target} not found.`);
            if (highlightedElement) {
              highlightedElement.removeAttribute('data-tour-highlighted');
              setHighlightedElement(null);
            }
          }
        }
      } else {
        if (highlightedElement) {
          highlightedElement.removeAttribute('data-tour-highlighted');
          setHighlightedElement(null);
        }
      }
    };

    findAndHighlight();

    return () => {
      clearTimeout(pollTimer);
    };
  }, [currentStep, isOpen, tourSteps, highlightedElement, location.pathname]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('community-tour-completed', 'true');
    onComplete?.();
    onClose();
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  const step = tourSteps[currentStep];
  const isLastStep = currentStep === tourSteps.length - 1;
  const isFirstStep = currentStep === 0;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed z-50 max-w-md w-full px-4"
          style={{
            top: step.position === 'center' ? '50%' : step.position === 'top' ? '80px' : (step.target ? 'auto' : '20%'),
            left: '50%',
            transform: step.position === 'center' ? 'translate(-50%, -50%)' : 'translate(-50%, 0)',
            bottom: step.position === 'bottom' ? '80px' : 'auto',
          }}
        >
          <GlassCard variant="strong" className="p-6 glass-layer border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(59,130,246,0.5)]">
                  {step.id === 'welcome' && <Compass className="w-5 h-5 text-white" />}
                  {step.id === 'discover' && <Search className="w-5 h-5 text-white" />}
                  {step.id === 'explorer' && <Compass className="w-5 h-5 text-white" />}
                  {step.id === 'highlights' && <Star className="w-5 h-5 text-white" />}
                  {step.id === 'ai-search' && <Sparkles className="w-5 h-5 text-white" />}
                  {step.id === 'my-resources' && <FolderHeart className="w-5 h-5 text-white" />}
                  {step.id === 'translation' && <Globe className="w-5 h-5 text-white" />}
                  {step.id === 'unified-map' && <MapPinned className="w-5 h-5 text-white" />}
                  {step.id === 'add-resource' && <PlusCircle className="w-5 h-5 text-white" />}
                  {step.id === 'board' && <Compass className="w-5 h-5 text-white" />}
                  {step.id === 'helper' && <Bot className="w-5 h-5 text-white" />}
                  {step.id === 'complete' && <Compass className="w-5 h-5 text-white" />}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white uppercase tracking-widest drop-shadow-sm">
                    {t(step.titleKey)}
                  </h3>
                  <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mt-1">
                    {t('tour.step', { current: currentStep + 1, total: tourSteps.length })}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-slate-300 mb-8 leading-relaxed font-medium text-sm">
              {t(step.contentKey)}
            </p>

            <div className="flex gap-1 mb-6">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${index <= currentStep ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-[0_0_10px_rgba(79,70,229,0.5)]' : 'bg-white/10'}`}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
              >
                {t('tour.skip')}
              </button>

              <div className="flex gap-2">
                {!isFirstStep && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white hover:bg-white/10 transition-all rounded-lg text-sm font-bold uppercase tracking-wide"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('tour.previous')}
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all text-sm font-black shadow-lg shadow-blue-500/20"
                >
                  {isLastStep ? t('tour.complete.getStarted') : t('tour.next')}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      <style>{`
        [data-tour-highlighted="true"] {
          position: relative !important;
          z-index: 45 !important;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.3), 0 0 0 8px rgba(37, 99, 235, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
        }

        .fixed[data-tour-highlighted="true"] {
          position: fixed !important;
        }
        
        [data-tour-highlighted="true"]::before {
          content: '';
          position: absolute;
          inset: -8px;
          border: 2px dashed rgb(37, 99, 235);
          border-radius: 12px;
          pointer-events: none;
          animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </>
  );
}
