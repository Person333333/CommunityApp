import { motion, useScroll, useTransform } from 'framer-motion';
import { Link } from 'react-router';
import { Compass, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
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
            <NavLink to="/discover">Discover</NavLink>
            <NavLink to="/map">Map View</NavLink>
            <NavLink to="/submit">Add Resource</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/references">References</NavLink>
            
            {/* Authentication */}
            <div className="flex items-center gap-4">
              <SignedOut>
                <Link
                  to="/sign-in"
                  className="text-slate-100 hover:text-teal-300 transition-colors duration-200 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/sign-up"
                  className="glass-teal px-4 py-2 rounded-lg text-slate-100 hover:glass-strong transition-all font-medium"
                >
                  Sign Up
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9",
                      userButtonPopoverCard: "glass border border-white/10",
                      userButtonPopoverActions: "text-slate-300"
                    }
                  }}
                />
              </SignedIn>
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
                Discover
              </MobileNavLink>
              <MobileNavLink to="/map" onClick={() => setIsOpen(false)}>
                Map View
              </MobileNavLink>
              <MobileNavLink to="/submit" onClick={() => setIsOpen(false)}>
                Add Resource
              </MobileNavLink>
              <MobileNavLink to="/about" onClick={() => setIsOpen(false)}>
                About
              </MobileNavLink>
              <MobileNavLink to="/references" onClick={() => setIsOpen(false)}>
                References
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
                    <UserButton 
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8",
                          userButtonPopoverCard: "glass border border-white/10"
                        }
                      }}
                    />
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

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link
      to={to}
      className="text-slate-100 hover:text-teal-300 transition-colors duration-200 font-medium"
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
