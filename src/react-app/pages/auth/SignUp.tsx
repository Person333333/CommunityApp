import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { Link, useNavigate } from 'react-router';
import { Compass, Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import { useTranslation } from 'react-i18next';

export default function SignUpPage() {
  const { t } = useTranslation();
  const { isLoaded, signUp, setActive } = useSignUp();
  const navigate = useNavigate();
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  // Check if user should see tour after signup
  useEffect(() => {
    const tourCompleted = localStorage.getItem('community-tour-completed');
    const shouldShowTour = new URLSearchParams(window.location.search).get('tour');

    if (!tourCompleted && shouldShowTour === 'true') {
      // Redirect to home with tour trigger
      navigate('/?tour=true');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) return;

    setError('');
    setLoading(true);

    try {
      await signUp.create({
        emailAddress,
        password,
        firstName,
        lastName,
      });

      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setPendingVerification(true);
    } catch (err: any) {
      setError(err.errors?.[0]?.message || t('auth.errorGeneric'));
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
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        // Redirect to home with tour trigger for new users
        window.location.href = '/?tour=true';
      } else {
        setError(t('auth.errorVerify'));
      }
    } catch (err: any) {
      setError(err.errors?.[0]?.message || 'Invalid verification code');
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
            <span className="text-2xl font-bold gradient-text">{t('app.name')}</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold gradient-text mb-2">
            {t('auth.joinCommunity')}
          </h1>
          <p className="text-lg text-slate-300">
            {pendingVerification ? t('auth.verifyEmailTitle') : t('auth.createAccount')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <GlassCard variant="strong" className="p-6">
            {pendingVerification ? (
              <form onSubmit={handleVerify} className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center mb-6"
                >
                  <CheckCircle className="w-16 h-16 text-teal-400 mx-auto mb-4" />
                  <p className="text-slate-300">
                    {t('auth.codeSentTo')} <span className="text-teal-300 font-medium">{emailAddress}</span>
                  </p>
                </motion.div>

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
                    {t('auth.verificationCode')}
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t('auth.codePlaceholder')}
                    required
                    className="w-full glass-teal border border-white/10 rounded-lg px-4 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all text-center text-2xl tracking-widest"
                    maxLength={6}
                  />
                </div>

                <GlassButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading || !isLoaded}
                >
                  {loading ? t('auth.verifying') : t('auth.verifyEmail')}
                </GlassButton>

                <button
                  type="button"
                  onClick={() => {
                    setPendingVerification(false);
                    setCode('');
                    setError('');
                  }}
                  className="w-full text-sm text-teal-300 hover:text-teal-200 transition-colors"
                >
                  {t('auth.changeEmail')}
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

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-medium text-slate-300">
                      {t('auth.firstName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t('auth.firstPlaceholder')}
                        required
                        className="w-full glass-teal border border-white/10 rounded-lg px-12 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-medium text-slate-300">
                      {t('auth.lastName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t('auth.lastPlaceholder')}
                        required
                        className="w-full glass-teal border border-white/10 rounded-lg px-12 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300">
                    {t('auth.emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                    <input
                      id="email"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      required
                      className="w-full glass-teal border border-white/10 rounded-lg px-12 py-3 text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300">
                    {t('auth.passwordLabel')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.createPasswordPlaceholder')}
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
                  <p className="text-xs text-slate-400">
                    {t('auth.mustBe8Chars')}
                  </p>
                </div>

                {/* Submit Button */}
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full"
                  disabled={loading || !isLoaded}
                >
                  {loading ? t('auth.creatingAccount') : t('auth.signUpButton')}
                </GlassButton>
              </form>
            )}

            {!pendingVerification && (
              <div className="mt-6 text-center">
                <Link
                  to="/sign-in"
                  className="text-sm text-teal-300 hover:text-teal-200 font-medium transition-colors"
                >
                  {t('auth.alreadyHaveAccount')}
                </Link>
              </div>
            )}
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
