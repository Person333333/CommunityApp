import { BrowserRouter as Router, Routes, Route, useLocation as useRouterLocation } from "react-router";
import { useState, useEffect } from "react";
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

function ScrollToTop() {
  const { pathname } = useRouterLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/discover" element={<DiscoverPage />} />
      <Route path="/submit" element={<SubmitPage />} />
      <Route path="/references" element={<ReferencesPage />} />
      <Route path="/about" element={<AboutPage />} />

      <Route path="/sign-in" element={<SignInPage />} />
      <Route path="/sign-up" element={<SignUpPage />} />
      <Route path="/account" element={<AccountPage />} />
      <Route path="/my-submissions" element={<MySubmissionsPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default function App() {
  const [showTour, setShowTour] = useState(false);
  const { location, loading: locationLoading } = useLocation();

  useEffect(() => {
    if (locationLoading || !location) return;

    const urlParams = new URLSearchParams(window.location.search);
    const forceTour = urlParams.get('tour') === 'true';
    const tourCompleted = localStorage.getItem('community-tour-completed');
    const tourShownThisSession = sessionStorage.getItem('tour-shown-session');

    if ((forceTour || !tourCompleted) && !tourShownThisSession) {
      const timer = setTimeout(() => {
        setShowTour(true);
        sessionStorage.setItem('tour-shown-session', 'true');
      }, 1500);

      if (forceTour) {
        window.history.replaceState({}, '', window.location.pathname);
      }

      return () => clearTimeout(timer);
    }
  }, [location, locationLoading]);

  return (
    <Router>
      <div className="relative min-h-screen w-full overflow-hidden bg-deep text-core font-sans">
        <div className="pointer-events-none fixed inset-0 opacity-[0.03] dot-grid-pattern" />
        <div className="relative z-10 flex flex-col min-h-screen">
          <ScrollToTop />
          <Navbar />
          <main id="main-content" className="flex-grow">
            <AppRoutes />
          </main>
          <Footer />
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
