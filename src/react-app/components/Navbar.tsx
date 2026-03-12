import { motion, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { Link, useLocation } from 'react-router';
import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import LanguageSelector from './LanguageSelector';
import LocationBar from './LocationBar';
import { useTranslation } from 'react-i18next';
import Translated from './Translated';
import ScrollProgress from './ScrollProgress';

export default function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { scrollY } = useScroll();
  const currentLocation = useLocation();

  const isHeroPage = currentLocation.pathname === '/' || currentLocation.pathname === '/about';

  useMotionValueEvent(scrollY, "change", () => {
    // Keep hook if needed for future logic
  });

  // Both hero pages are now light-themed, so text should always be dark.
  const isDark = false;

  const navBg = useTransform(
    scrollY,
    [0, 120],
    isHeroPage
      ? ['rgba(240, 238, 235, 0.50)', 'rgba(255, 255, 255, 0.95)']
      : ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0.95)']
  );

  const navBorderColor = useTransform(
    scrollY,
    [0, 120],
    isHeroPage
      ? ['rgba(255,255,255,0.08)', 'rgba(226,232,240,0.8)']
      : ['rgba(226,232,240,0.8)', 'rgba(226,232,240,0.8)']
  );

  return (
    <>
      <ScrollProgress />
      <motion.nav
        className="fixed top-0 left-0 right-0 z-50"
        style={{
          backgroundColor: navBg,
          borderBottom: '1px solid',
          borderColor: navBorderColor,
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div whileHover={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                <Compass className={`w-8 h-8 transition-colors duration-300 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
              </motion.div>
              <span className={`text-xl font-bold transition-colors duration-300 ${isDark ? 'text-white' : 'text-slate-900'}`}>Community Compass</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 ml-12 flex-nowrap min-w-max">
              <NavLink to="/discover" isDark={isDark}>{t('nav.discover')}</NavLink>
              <NavLink to="/submit" data-tour="add-resource" isDark={isDark}>{t('nav.addResource')}</NavLink>
              <NavLink to="/about" isDark={isDark}>{t('nav.about')}</NavLink>
              <NavLink to="/references" isDark={isDark}>{t('nav.references')}</NavLink>

              {/* Authentication & Selectors */}
              <div className="flex items-center gap-6 relative whitespace-nowrap">
                <SignedOut>
                  <Link
                    to="/sign-in"
                    className={`transition-colors duration-300 font-semibold text-sm ${isDark ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-blue-600'}`}
                  >
                    {t('nav.signIn')}
                  </Link>
                  <Link
                    to="/sign-up"
                    className={`px-4 py-2 rounded-lg font-semibold shadow-md transition-all text-sm ${isDark ? 'bg-blue-500 hover:bg-blue-400 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
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
                    <div className="absolute right-0 top-12 w-64 glass p-4 rounded-xl border border-white/10 shadow-xl backdrop-blur">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-medium flex items-center justify-center">
                          {user?.firstName?.[0]?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                          <div className="text-slate-900 font-medium leading-tight"><Translated text={user?.fullName || 'Your Account'} /></div>
                          <div className="text-slate-500 text-xs truncate"><Translated text={user?.primaryEmailAddress?.emailAddress} /></div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <Link to="/account" className="block w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium text-sm">{t('nav.account')}</Link>
                        <Link to="/my-submissions" className="block w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-slate-700 font-medium text-sm">{t('discover.mySubmissions')}</Link>
                        <button
                          onClick={() => signOut()}
                          className="block w-full text-left px-3 py-2 rounded-md hover:bg-slate-50 text-rose-600 font-medium text-sm"
                        >
                          {t('account.signOut')}
                        </button>
                      </div>
                    </div>
                  )}
                </SignedIn>

                {/* Location Selector */}
                <LocationBar variant="compact" />
                {/* Language Selector */}
                <div data-tour="language-selector">
                  <LanguageSelector />
                </div>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`md:hidden p-2 rounded-lg ${isDark ? 'text-white hover:bg-white/10' : 'glass'}`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
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
                      className="block w-full bg-blue-50 px-4 py-3 rounded-lg text-slate-900 border border-blue-100 hover:bg-blue-100 transition-all text-left font-bold"
                    >
                      Sign In
                    </Link>
                    <Link
                      to="/sign-up"
                      onClick={() => setIsOpen(false)}
                      className="block w-full bg-blue-600 px-4 py-3 rounded-lg text-white hover:bg-blue-700 transition-all text-left font-bold shadow-md"
                    >
                      Sign Up
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <div className="px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-800 text-white font-medium flex items-center justify-center">
                            {user?.firstName?.[0]?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'A'}
                          </div>
                          <div className="text-slate-900 font-medium"><Translated text={user?.firstName || 'Account'} /></div>
                        </div>
                        <button onClick={() => signOut()} className="text-rose-600 hover:text-rose-700 text-sm font-medium uppercase tracking-wider">{t('account.signOut')}</button>
                      </div>
                    </div>
                  </SignedIn>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.nav>
    </>
  );
}

function NavLink({ to, children, isDark = false, ...props }: { to: string; children: React.ReactNode; isDark?: boolean;[key: string]: any }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`relative py-4 text-sm transition-colors duration-300 font-semibold whitespace-nowrap ${isActive
        ? isDark ? 'text-blue-300' : 'text-blue-600'
        : isDark ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-blue-600'
        }`}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navbar-active"
          className={`absolute bottom-1 left-0 right-0 h-0.5 rounded-full ${isDark ? 'bg-blue-400' : 'bg-slate-800'}`}
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
    </Link>
  );
}

function MobileNavLink({
  to,
  children,
  onClick
}: {
  to: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      onClick={onClick}
      className={`block w-full px-4 py-3 rounded-lg transition-all border font-bold mb-2 ${isActive
        ? 'bg-blue-50 text-blue-600 border-blue-200'
        : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border-slate-100'
        }`}
    >
      {children}
    </Link>
  );
}
