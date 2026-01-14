import { BrowserRouter as Router, Routes, Route } from "react-router";
import { useState, useEffect } from "react";
import './i18n'; // Initialize i18n
import HomePage from "@/react-app/pages/Home";
import DiscoverPage from "@/react-app/pages/Discover";
import SubmitPage from "@/react-app/pages/Submit";
import MapPage from "@/react-app/pages/Map";
import ReferencesPage from "@/react-app/pages/References";
import AboutPage from "@/react-app/pages/About";

import SignInPage from "@/react-app/pages/auth/SignIn";
import SignUpPage from "@/react-app/pages/auth/SignUp";
import AccountPage from "@/react-app/pages/auth/Account";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";
import UserTour from "@/react-app/components/UserTour";
import HelperButton from "@/react-app/components/HelperButton";

export default function App() {
  const [showTour, setShowTour] = useState(false);

  // Check for tour trigger in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const shouldShowTour = urlParams.get('tour') === 'true';
    const tourCompleted = localStorage.getItem('community-tour-completed');

    if (shouldShowTour && !tourCompleted) {
      setShowTour(true);
      // Clean up URL params
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/submit" element={<SubmitPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/references" element={<ReferencesPage />} />
        <Route path="/about" element={<AboutPage />} />

        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
      <Footer />
      <UserTour
        isOpen={showTour}
        onClose={() => setShowTour(false)}
        onComplete={() => setShowTour(false)}
      />
      <HelperButton onShowTour={() => setShowTour(true)} />
    </Router>
  );
}
