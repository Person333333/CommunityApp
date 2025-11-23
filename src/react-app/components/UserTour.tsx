import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Compass, Search, MapPin, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import GlassCard from './GlassCard';

interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string; // CSS selector for the target element
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const tourSteps: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Community Compass! 🎉',
    content: 'Let us show you around to help you find the resources you need. This quick tour will take just a minute.',
    position: 'center'
  },
  {
    id: 'discover',
    title: 'Discover Resources',
    content: 'This is where you can search and filter through hundreds of community resources. Try selecting multiple categories to narrow your search!',
    target: '[data-tour="discover"]',
    position: 'bottom'
  },
  {
    id: 'search',
    title: 'Smart Search',
    content: 'Use the search bar to find specific resources by name, description, or tags. We\'ll be adding AI-powered search soon!',
    target: '[data-tour="search"]',
    position: 'bottom'
  },
  {
    id: 'map',
    title: 'Interactive Map',
    content: 'View resources on an interactive map with heatmap views to see resource density in your area.',
    target: '[data-tour="map"]',
    position: 'left'
  },
  {
    id: 'favorites',
    title: 'Save Favorites',
    content: 'Click the heart icon to save resources for quick access later. Your favorites sync across devices!',
    target: '[data-tour="favorites"]',
    position: 'left'
  },
  {
    id: 'complete',
    title: 'All Set! 🚀',
    content: 'You\'re ready to explore. Remember to use the helper button if you have any questions. Happy resource hunting!',
    position: 'center'
  }
];

interface UserTourProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

export default function UserTour({ isOpen, onClose, onComplete }: UserTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<Element | null>(null);

  useEffect(() => {
    if (!isOpen) {
      // Clean up highlight when tour is closed
      if (highlightedElement) {
        highlightedElement.removeAttribute('data-tour-highlighted');
        setHighlightedElement(null);
      }
      return;
    }

    const step = tourSteps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target);
      if (element) {
        // Remove previous highlight
        if (highlightedElement) {
          highlightedElement.removeAttribute('data-tour-highlighted');
        }
        
        // Add highlight to new element
        element.setAttribute('data-tour-highlighted', 'true');
        setHighlightedElement(element);
        
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      // Remove highlight if no target
      if (highlightedElement) {
        highlightedElement.removeAttribute('data-tour-highlighted');
        setHighlightedElement(null);
      }
    }
  }, [currentStep, isOpen, highlightedElement]);

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
    // Mark tour as completed in localStorage
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
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />
      
      {/* Tour Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="fixed z-50 max-w-md"
          style={{
            top: step.position === 'center' ? '50%' : step.target ? 'auto' : '20%',
            left: step.position === 'center' ? '50%' : step.target ? 'auto' : '50%',
            transform: step.position === 'center' ? 'translate(-50%, -50%)' : 'translate(-50%, 0)',
            bottom: step.position === 'bottom' ? '20px' : 'auto'
          }}
        >
          <GlassCard variant="strong" className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-teal-500 to-amber-500 rounded-full flex items-center justify-center">
                  {currentStep === 0 && <Compass className="w-5 h-5 text-white" />}
                  {currentStep === 1 && <Search className="w-5 h-5 text-white" />}
                  {currentStep === 2 && <Search className="w-5 h-5 text-white" />}
                  {currentStep === 3 && <MapPin className="w-5 h-5 text-white" />}
                  {currentStep === 4 && <Heart className="w-5 h-5 text-white" />}
                  {currentStep === 5 && <Compass className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-100">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-400">
                    Step {currentStep + 1} of {tourSteps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <p className="text-slate-300 mb-6">
              {step.content}
            </p>

            {/* Progress */}
            <div className="flex gap-1 mb-6">
              {tourSteps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-1 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-gradient-to-r from-teal-500 to-amber-500' : 'bg-slate-600'
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleSkip}
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Skip tour
              </button>
              
              <div className="flex gap-2">
                {!isFirstStep && (
                  <button
                    onClick={handlePrevious}
                    className="flex items-center gap-2 px-4 py-2 glass border border-white/10 text-slate-300 hover:border-teal-400/30 transition-all rounded-lg"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
                
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-600 to-amber-600 text-white rounded-lg hover:from-teal-700 hover:to-amber-700 transition-all"
                >
                  {isLastStep ? 'Get Started' : 'Next'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </AnimatePresence>

      {/* Tour Styles */}
      <style>{`
        [data-tour-highlighted="true"] {
          position: relative;
          z-index: 45;
          box-shadow: 0 0 0 4px rgba(20, 184, 166, 0.3), 0 0 0 8px rgba(20, 184, 166, 0.1);
          border-radius: 8px;
          transition: all 0.3s ease;
        }
        
        [data-tour-highlighted="true"]::before {
          content: '';
          position: absolute;
          inset: -8px;
          border: 2px dashed rgb(20, 184, 166);
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
