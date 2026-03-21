import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { Link } from 'react-router';
import { Compass, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import { useTranslation } from 'react-i18next';

export default function SignInPage() {
  const { t } = useTranslation();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // States: 'signin', 'forgot_password_email', 'forgot_password_code'
  const [flowState, setFlowState] = useState<'signin' | 'forgot_password_email' | 'forgot_password_code'>('signin');
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
        setError(t('auth.errorSignIn', 'Error during sign in.'));
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || t('auth.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    setLoading(true);

    try {
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: emailAddress,
      });
      setFlowState('forgot_password_code');
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Failed to send reset code.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;
    setError('');
    
    // Custom requirement checks before submitting to clerk
    if (newPassword.length < 8 || !/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/.test(newPassword)) {
      setError("New password must be at least 8 chars long with 1 number and 1 symbol.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password: newPassword,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        window.location.href = '/';
      } else {
        setError('Failed to reset password.');
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.errors?.[0]?.message || 'Invalid code or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center bg-background text-foreground transition-colors duration-300">
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
              <Compass className="w-10 h-10 text-emerald-500" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">{t('app.name')}</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-foreground mb-2 uppercase tracking-widest drop-shadow-sm">
            {flowState === 'signin' ? t('auth.welcomeBack', 'Welcome Back') : 'Reset Password'}
          </h1>
          <p className="text-lg text-muted-foreground font-bold">
            {flowState === 'signin' ? t('auth.signInSubtitle') : 'Follow the steps to recover your access.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard variant="strong" className="p-6 bg-card border-border">
            
            {/* Display error if present */}
            <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3 mb-6"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">{error}</p>
                  </motion.div>
                )}
            </AnimatePresence>

            {flowState === 'signin' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-black text-foreground uppercase tracking-widest">
                    {t('auth.emailLabel', 'Email')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <input
                      id="email"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      required
                      className="w-full bg-background border border-input rounded-lg px-12 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                      <label htmlFor="password" className="block text-sm font-black text-foreground uppercase tracking-widest">
                        {t('auth.passwordLabel', 'Password')}
                      </label>
                      <button 
                        type="button" 
                        onClick={() => { setError(''); setFlowState('forgot_password_email'); }}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                          Forgot password?
                      </button>
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      required
                      className="w-full bg-background border border-input rounded-lg px-12 py-3 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <GlassButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading || !isLoaded}
                >
                  {loading ? t('auth.signingIn', 'Signing In...') : t('auth.signInButton', 'Sign In')}
                </GlassButton>
              </form>
            )}

            {flowState === 'forgot_password_email' && (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="block text-sm font-black text-foreground uppercase tracking-widest">
                    Enter your email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                    <input
                      id="reset-email"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-background border border-input rounded-lg px-12 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium"
                    />
                  </div>
                </div>
                <GlassButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading || !isLoaded}>
                  {loading ? 'Sending Code...' : 'Send Recovery Code'}
                </GlassButton>
                <button
                  type="button"
                  onClick={() => { setFlowState('signin'); setError(''); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground font-bold"
                >
                  Back to Sign In
                </button>
              </form>
            )}

            {flowState === 'forgot_password_code' && (
              <form onSubmit={handleForgotPasswordReset} className="space-y-6">
                <div className="text-center mb-4">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                  <p className="text-foreground font-bold text-sm">Code sent to {emailAddress}</p>
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="reset-code" className="block text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    Verification Code
                  </label>
                  <input
                    id="reset-code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="123456"
                    required
                    maxLength={6}
                    className="w-full bg-background border border-input rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all text-center tracking-widest text-2xl font-bold"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="new-password" className="block text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    New Password
                  </label>
                  <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
                      <input
                        id="new-password"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="New Password"
                        required
                        className="w-full bg-background border border-input rounded-lg px-12 py-3 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-emerald-500 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                   </div>
                   <p className="text-xs text-muted-foreground font-bold">Must be at least 8 chars, 1 number, 1 symbol.</p>
                </div>

                <GlassButton type="submit" variant="primary" size="lg" className="w-full" disabled={loading || !isLoaded}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </GlassButton>
                <button
                  type="button"
                  onClick={() => { setFlowState('signin'); setError(''); setCode(''); }}
                  className="w-full text-sm text-muted-foreground hover:text-foreground font-bold"
                >
                  Back to Sign In
                </button>
              </form>
            )}

            {flowState === 'signin' && (
              <div className="mt-6 text-center">
                <Link
                  to="/sign-up"
                  className="text-sm text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold transition-colors uppercase tracking-widest"
                >
                  {t('auth.noAccount', "Don't have an account?")}
                </Link>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
