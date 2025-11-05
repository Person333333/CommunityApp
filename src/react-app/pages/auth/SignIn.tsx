import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { Link } from 'react-router';
import { Compass, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';

export default function SignInPage() {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingCode, setPendingCode] = useState(false);
  const [code, setCode] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError('');
    setLoading(true);

    try {
      const result = await signIn.create({
        identifier: emailAddress,
        password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
      } else {
        setError('Sign in incomplete. Please check your email for verification.');
      }
    } catch (err: any) {
      // Fallback to email code sign-in if password auth fails
      try {
        const start = await signIn.create({
          identifier: emailAddress,
          strategy: 'email_code',
        } as any);
        if (start.status === 'needs_first_factor') {
          setPendingCode(true);
          setError('We sent you a verification code. Please enter it below.');
        }
      } catch (e: any) {
        setError(e.errors?.[0]?.message || 'An error occurred during sign in');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setLoading(true);
    try {
      const attempt = await signIn.attemptFirstFactor({
        strategy: 'email_code',
        code,
      } as any);
      if (attempt.status === 'complete') {
        await setActive({ session: attempt.createdSessionId });
        window.location.href = '/';
      } else {
        setError('Verification incomplete. Please try again.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid code');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="container mx-auto max-w-md w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <Link to="/" className="inline-flex items-center space-x-2 group mb-4">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <Compass className="w-10 h-10 text-teal-400" />
            </motion.div>
            <span className="text-2xl font-bold gradient-text">Community Compass</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
            Welcome Back
          </h1>
          <p className="text-lg text-slate-300">
            Sign in to continue to your account
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard variant="strong" className="p-6">
            {pendingCode ? (
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="text-center">
                  <CheckCircle className="w-12 h-12 text-teal-400 mx-auto mb-2" />
                  <p className="text-slate-300 text-sm">Enter the verification code sent to {emailAddress}</p>
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-ochre border border-amber-400/30 rounded-lg p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-300">{error}</p>
                  </motion.div>
                )}
                <div className="space-y-2">
                  <label htmlFor="code" className="block text-sm font-medium text-slate-300">
                    Verification Code
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    required
                    maxLength={6}
                    className="w-full glass-teal border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-center tracking-widest text-2xl"
                  />
                </div>
                <GlassButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading || !isLoaded}>
                  {loading ? 'Verifying...' : 'Verify'}
                </GlassButton>
                <button
                  type="button"
                  onClick={() => { setPendingCode(false); setCode(''); setError(''); }}
                  className="w-full text-sm text-teal-300 hover:text-teal-200"
                >
                  Back to password sign-in
                </button>
              </form>
            ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-ochre border border-amber-400/30 rounded-lg p-4 flex items-start gap-3"
                >
                  <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-300">{error}</p>
                </motion.div>
              )}

              {/* Email Input */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                  <input
                    id="email"
                    type="email"
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full glass-teal border border-white/10 rounded-lg px-12 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full glass-teal border border-white/10 rounded-lg px-12 py-3 pr-12 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-teal-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <GlassButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full"
                disabled={loading || !isLoaded}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </GlassButton>
            </form>
            )}

            <div className="mt-6 text-center">
              <Link
                to="/sign-up"
                className="text-sm text-teal-300 hover:text-teal-200 font-medium transition-colors"
              >
                Don't have an account? Sign up
              </Link>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
