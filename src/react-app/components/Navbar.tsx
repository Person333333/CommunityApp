import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router';
import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import LanguageSelector from './LanguageSelector';
import { useTranslation } from 'react-i18next';

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
    ['rgba(248, 250, 252, 0.05)', 'rgba(248, 250, 252, 0.15)']
  );

  const backdropBlur = useTransform(
    scrollY,
    [0, 100],
    ['blur(10px)', 'blur(30px)']
  );

  return (
    <motion.nav
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/10"
      style={{
        backgroundColor,
        backdropFilter: backdropBlur,
        WebkitBackdropFilter: backdropBlur,
      }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Compass className="w-8 h-8 text-teal-400" />
            </motion.div>
            <span className="text-xl font-bold gradient-text">Community Compass</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <NavLink to="/discover" data-tour="discover">{t('nav.discover')}</NavLink>
            <NavLink to="/map" data-tour="map">{t('nav.map')}</NavLink>

            <NavLink to="/submit">{t('nav.addResource')}</NavLink>
            <NavLink to="/about">{t('nav.about')}</NavLink>
            <NavLink to="/references">{t('nav.references')}</NavLink>

            {/* Authentication */}
            <div className="flex items-center gap-4 relative">
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="text-slate-100 hover:text-teal-300 transition-colors duration-200 font-medium"
                >
                  {t('nav.signIn')}
                </Link>
                <Link
                  to="/sign-up"
                  className="glass-teal px-4 py-2 rounded-lg text-slate-100 hover:glass-strong transition-all font-medium"
                >
                  {t('nav.signUp')}
                </Link>
              </SignedOut>
              <SignedIn>
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className="w-9 h-9 rounded-full bg-gradient-to-r from-teal-600 to-amber-600 text-white font-semibold flex items-center justify-center shadow hover:opacity-90"
                  aria-label="Account menu"
                >
                  {user?.firstName?.[0]?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'A'}
                </button>
                {showAccountMenu && (
                  <div className="absolute right-0 top-12 w-64 glass p-4 rounded-xl border border-white/10 shadow-xl backdrop-blur">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-teal-600 to-amber-600 text-white font-semibold flex items-center justify-center">
                        {user?.firstName?.[0]?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'A'}
                      </div>
                      <div>
                        <div className="text-slate-100 font-semibold leading-tight">{user?.fullName || 'Your Account'}</div>
                        <div className="text-slate-400 text-sm truncate">{user?.primaryEmailAddress?.emailAddress}</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Link to="/account" className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-slate-100">Account</Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-3 py-2 rounded-lg hover:bg-white/5 text-rose-300"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </SignedIn>

              {/* Language Selector */}
              <LanguageSelector />
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
              <MobileNavLink to="/map" onClick={() => setIsOpen(false)}>
                {t('nav.map')}
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
                    className="block w-full glass-teal px-4 py-3 rounded-lg text-slate-100 hover:glass-strong transition-all text-left"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/sign-up"
                    onClick={() => setIsOpen(false)}
                    className="block w-full glass px-4 py-3 rounded-lg text-slate-100 hover:glass-strong transition-all text-left"
                  >
                    Sign Up
                  </Link>
                </SignedOut>
                <SignedIn>
                  <div className="px-4 py-3 glass rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-teal-600 to-amber-600 text-white font-semibold flex items-center justify-center">
                          {user?.firstName?.[0]?.toUpperCase() || user?.primaryEmailAddress?.emailAddress?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div className="text-slate-100 font-medium">{user?.firstName || 'Account'}</div>
                      </div>
                      <button onClick={() => signOut()} className="text-rose-300 hover:text-rose-200 text-sm">Sign out</button>
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
  return (
    <Link
      to={to}
      className="text-slate-100 hover:text-teal-300 transition-colors duration-200 font-medium"
      {...props}
    >
      {children}
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
  return (
    <Link
      to={to}
      onClick={onClick}
      className="glass-teal px-4 py-3 rounded-lg text-slate-100 hover:glass-strong transition-all"
    >
      {children}
    </Link>
  );
}
