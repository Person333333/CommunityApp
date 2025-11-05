import { BrowserRouter as Router, Routes, Route } from "react-router";
import HomePage from "@/react-app/pages/Home";
import DiscoverPage from "@/react-app/pages/Discover";
import SubmitPage from "@/react-app/pages/Submit";
import MapPage from "@/react-app/pages/Map";
import ReferencesPage from "@/react-app/pages/References";
import AboutPage from "@/react-app/pages/About";
import SignInPage from "@/react-app/pages/auth/SignIn";
import SignUpPage from "@/react-app/pages/auth/SignUp";
import Navbar from "@/react-app/components/Navbar";
import Footer from "@/react-app/components/Footer";

export default function App() {
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
      </Routes>
      <Footer />
    </Router>
  );
}
