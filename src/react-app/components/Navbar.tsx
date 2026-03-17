import { motion, useScroll, useMotionValueEvent, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router';
import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import LanguageSelector from './LanguageSelector';
import LocationSelector from './LocationSelector';
import { useTranslation } from 'react-i18next';
import Translated from './Translated';
import ScrollProgress from './ScrollProgress';

// Main Navigation Component
export default function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", () => {
    // Keep hook if needed for future logic
  });

  // Removed unused useTransform navBg and navBorderColor as the Navbar now statically uses the glass-layer token.

  return (
    <>
      <ScrollProgress />
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50 glass-layer border-b border-white/10"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                <Compass className={`w-8 h-8 transition-colors duration-300 text-blue-400`} />
              </motion.div>
              <span className={`text-xl font-bold transition-colors duration-300 text-white`}>Community Compass</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 ml-12 flex-nowrap min-w-max text-slate-300">
              <NavLink to="/discover">{t('nav.discover')}</NavLink>
              <NavLink to="/submit" data-tour="add-resource">{t('nav.addResource')}</NavLink>
              <NavLink to="/about">{t('nav.about')}</NavLink>
              <NavLink to="/references">{t('nav.references')}</NavLink>

              {/* Authentication & Selectors */}
              <div className="flex items-center gap-6 relative whitespace-nowrap">
                <SignedOut>
                  <Link
                    to="/sign-in"
                    className="text-white/70 hover:text-blue-400 transition-colors duration-200 font-semibold"
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    to="/sign-up"
                    className="glass-layer px-4 py-2 rounded-lg text-white hover:bg-white/10 transition-all font-semibold shadow-md"
                  >
                    {t('nav.signUp')}
                  </Link>
                </SignedOut>
                <SignedIn>
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="w-8 h-8 rounded-full bg-slate-800 text-white font-medium flex items-center justify-center shadow-sm hover:opacity-90"
                    aria-label="Account menu"
                  >
                    {user?.firstName?.[0]?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'A'}
                  </button>
                  {showAccountMenu && (
                    <div className="absolute right-0 top-12 w-64 bg-slate-900/90 p-4 rounded-xl border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)] backdrop-blur-md">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-medium flex items-center justify-center border border-white/10">
                          {user?.firstName?.[0]?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="text-white font-medium leading-tight"><Translated text={user?.fullName || 'Your Account'} /></div>
                          <div className="text-slate-400 text-xs truncate"><Translated text={user?.primaryEmailAddress?.emailAddress} /></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Link to="/account" className="block w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-slate-300 font-medium text-sm transition-colors">{t('nav.account')}</Link>
                        <Link to="/my-submissions" className="block w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-slate-300 font-medium text-sm transition-colors">{t('discover.mySubmissions')}</Link>
                        <button
                          onClick={() => signOut()}
                          className="block w-full text-left px-3 py-2 rounded-md hover:bg-white/10 text-blue-400 font-medium text-sm transition-colors"
                        >
                          {t('account.signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </SignedIn>

                {/* Location Selector */}
                <LocationSelector />

                {/* Language Selector */}
                <div data-tour="language-selector">
                  <LanguageSelector />
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 glass-layer"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden pb-4"
              >
                <div className="flex flex-col space-y-2">
                  <MobileNavLink to="/discover" onClick={() => setIsOpen(false)}>
                    {t('nav.discover')}
                  </MobileNavLink>
                  <MobileNavLink to="/submit" onClick={() => setIsOpen(false)}>
                    {t('nav.addResource')}
                  </MobileNavLink>
                  <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>
                    {t('nav.about')}
                  </MobileNavLink>
                  <MobileNavLink to="/references" onClick={() => setIsOpen(false)}>
                    {t('nav.references')}
                  </MobileNavLink>

                  {/* Mobile Authentication */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <SignedOut>
                      <Link
                        to="/sign-in"
                        onClick={() => setIsOpen(false)}
                        className="block w-full glass-layer px-4 py-3 rounded-lg text-white border border-white/20 hover:bg-white/10 transition-all text-left font-bold"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/sign-up"
                        onClick={() => setIsOpen(false)}
                        className="block w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-500 transition-all text-left font-bold shadow-md shadow-blue-500/20"
                      >
                        Sign Up
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <div className="px-4 py-3 glass-layer border border-white/10 rounded-xl shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white/20 text-white font-medium flex items-center justify-center border border-white/10">
                              {user?.firstName?.[0]?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="text-white font-medium"><Translated text={user?.firstName || 'Account'} /></div>
                          </div>
                          <button onClick={() => signOut()} className="text-blue-300 hover:text-blue-200 text-sm font-medium uppercase tracking-wider">{t('account.signOut')}</button>
                        </div>
                      </div>
                    </SignedIn>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>
    </>
  );
}

function NavLink({ to, children, ...props }: { to: string; children: React.ReactNode; 'data-tour'?: string; isDark?: boolean }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      className={`relative py-2 text-sm font-bold uppercase tracking-widest transition-colors duration-300
        ${isActive
          ? 'text-white'
          : 'text-white/60 hover:text-white'
        }
      `}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navbar-indicator"
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}

function MobileNavLink({ to, children, onClick }: { to: string; children: React.ReactNode; onClick?: () => void }) {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block px-4 py-3 rounded-lg text-base font-bold uppercase tracking-wider transition-colors duration-200 ${isActive
        ? 'bg-white/10 text-white border-l-4 border-blue-400'
        : 'text-white/70 hover:bg-white/5 hover:text-white'
        }`}
    >
      {children}
    </Link>
  );
}
