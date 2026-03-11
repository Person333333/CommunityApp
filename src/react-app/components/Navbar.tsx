import { motion, useScroll, useTransform } from 'framer-motion';
import { Link, useLocation } from 'react-router';
import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import LanguageSelector from './LanguageSelector';
import LocationSelector from './LocationSelector';
import { useTranslation } from 'react-i18next';
import Translated from './Translated';

export default function Navbar() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const { user } = useUser();
  const { signOut } = useClerk();
  const { scrollY } = useScroll();

  const backgroundColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.8)']
  );

  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ['blur(10px)', 'blur(30px)']
  );

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50"
      style={{
        backgroundColor,
        backdropFilter: backdropBlur,
        WebkitBackdropFilter: backdropBlur,
      }}
    >
      {/* Removed gradient top bar for cleaner minimalist look */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Compass className="w-8 h-8 text-blue-600" />
            </motion.div>
            <span className="text-xl font-bold text-slate-900">Community Compass</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 ml-12 flex-nowrap min-w-max">
            <NavLink to="/discover">{t('nav.discover')}</NavLink>

            <NavLink to="/submit" data-tour="add-resource">{t('nav.addResource')}</NavLink>
            <NavLink to="/about">{t('nav.about')}</NavLink>
            <NavLink to="/references">{t('nav.references')}</NavLink>

            {/* Authentication & Selectors */}
            <div className="flex items-center gap-6 relative whitespace-nowrap">
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="text-slate-700 hover:text-blue-600 transition-colors duration-200 font-semibold"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/sign-up"
                  className="bg-blue-600 px-4 py-2 rounded-lg text-white hover:bg-blue-700 transition-all font-semibold shadow-md"
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
            className="md:hidden glass p-2 rounded-lg"
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
  );
}

function NavLink({ to, children, ...props }: { to: string; children: React.ReactNode;[key: string]: any }) {
  const location = useLocation();
  const isActive = location.pathname === to || (to !== '/' && location.pathname.startsWith(to));

  return (
    <Link
      to={to}
      className={`relative py-4 text-sm transition-colors duration-200 font-semibold whitespace-nowrap ${
        isActive ? 'text-blue-600' : 'text-slate-700 hover:text-blue-600'
      }`}
      {...props}
    >
      {children}
      {isActive && (
        <motion.div
          layoutId="navbar-active"
          className="absolute bottom-1 left-0 right-0 h-0.5 bg-slate-800 rounded-full"
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
      className={`block w-full px-4 py-3 rounded-lg transition-all border font-bold mb-2 ${
        isActive 
          ? 'bg-blue-50 text-blue-600 border-blue-200' 
          : 'bg-slate-50 text-slate-900 hover:bg-slate-100 border-slate-100'
      }`}
    >
      {children}
    </Link>
  );
}
