import { BrowserRouter as Router, Routes, Route, useLocation as useRouterLocation } from "react-router";
import { useState, useEffect, useLayoutEffect } from "react";
import './i18n'; // Initialize i18n
import HomePage from "@/react-app/pages/Home";
import DiscoverPage from "@/react-app/pages/Discover";
import SubmitPage from "@/react-app/pages/Submit";
import ReferencesPage from "@/react-app/pages/References";
import AboutPage from "@/react-app/pages/About";

import SignInPage from "@/react-app/pages/auth/SignIn";
import SignUpPage from "@/react-app/pages/auth/SignUp";
import AccountPage from "@/react-app/pages/auth/Account";
import MySubmissionsPage from "@/react-app/pages/MySubmissions";
import NotFoundPage from "@/react-app/pages/NotFound";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import UserTour from "@/react-app/components/UserTour";
import HelperButton from "@/react-app/components/HelperButton";
import NeedHelpNow from "@/react-app/components/NeedHelpNow";
import CommandPalette from "@/react-app/components/CommandPalette";
import KeyboardShortcutsGuide from "@/react-app/components/KeyboardShortcutsGuide";
import { useLocation } from "@/react-app/context/LocationContext";
import CinematicIntro from "@/react-app/components/CinematicIntro";
import { AnimatePresence, motion } from "framer-motion";


function ScrollToTop() {
  const { pathname } = useRouterLocation();
  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
}

function AppRoutes() {
  const location = useRouterLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/submit" element={<SubmitPage />} />
          <Route path="/references" element={<ReferencesPage />} />
          <Route path="/about" element={<AboutPage />} />

          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/my-submissions" element={<MySubmissionsPage />} />

          {/* Catch-all Route for 404 Page Not Found */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  const [showTour, setShowTour] = useState(false);
  const [showIntro, setShowIntro] = useState(() => {
    // Check ifintro has been shown in this session
    if (typeof window !== 'undefined') {
      return !sessionStorage.getItem('community-intro-seen');
    }
    return false;
  });
  const { location, loading: locationLoading } = useLocation();

  // Check for tour trigger (URL param or first-time visit)
  useEffect(() => {
    // Only proceed if location is set and we're not loading location
    if (locationLoading || !location) return;

    const urlParams = new URLSearchParams(window.location.search);
    const forceTour = urlParams.get('tour') === 'true';
    const tourCompleted = localStorage.getItem('community-tour-completed');
    const tourShownThisSession = sessionStorage.getItem('tour-shown-session');

    // Show tour if forced via URL or if it's a first-time visitor
    if ((forceTour || !tourCompleted) && !tourShownThisSession) {
      // Delay slightly to ensure layout is ready
      const timer = setTimeout(() => {
        setShowTour(true);
        sessionStorage.setItem('tour-shown-session', 'true');
      }, 1500);

      // Clean up URL params if forced
      if (forceTour) {
        window.history.replaceState({}, '', window.location.pathname);
      }

      return () => clearTimeout(timer);
    }
  }, [location, locationLoading]);

  const handleIntroComplete = () => {
    setShowIntro(false);
    sessionStorage.setItem('community-intro-seen', 'true');
  };

  return (
    <Router>
      <AnimatePresence mode="wait">
        {showIntro && (
          <CinematicIntro key="intro" onComplete={handleIntroComplete} />
        )}
      </AnimatePresence>

      <div className="relative min-h-screen w-full overflow-hidden bg-deep text-core font-sans">
        {/* Ambient Floating Gradient Blobs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden mix-blend-screen opacity-15">
          <div className="absolute top-[-10%] left-[-10%] h-[50vh] w-[50vh] rounded-full bg-blue-600 blur-[120px] animate-blob-1" />
          <div className="absolute top-[20%] right-[-10%] h-[40vh] w-[40vh] rounded-full bg-purple-600 blur-[120px] animate-blob-2" />
          <div className="absolute bottom-[-10%] left-[20%] h-[60vh] w-[60vh] rounded-full bg-pink-600 blur-[140px] animate-blob-3" />
        </div>

        {/* Base Grid Pattern */}
        <div className="pointer-events-none fixed inset-0 opacity-[0.03] dot-grid-pattern" />

        <div className="relative z-10 flex flex-col min-h-screen">

          <ScrollToTop />
          <Navbar />
          <main id="main-content" className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
          <BackToTop />
          <UserTour
            isOpen={showTour}
            onClose={() => setShowTour(false)}
            onComplete={() => setShowTour(false)}
          />
          <NeedHelpNow />
          <CommandPalette />
          <KeyboardShortcutsGuide />
          <HelperButton onShowTour={() => setShowTour(true)} />
        </div>
      </div>
    </Router>
  );
}

function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!visible) return null;

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-24 right-6 z-[60] p-3 rounded-full bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 border border-emerald-400/50 hover:bg-emerald-400 hover:scale-110 transition-all flex items-center justify-center sm:p-4"
      aria-label="Back to top"
    >
      <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6" />
    </motion.button>
  );
}

import { ArrowUp } from "lucide-react";
