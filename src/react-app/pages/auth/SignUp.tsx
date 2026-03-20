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
              <Compass className="w-10 h-10 text-blue-600" />
            </motion.div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{t('app.name')}</span>
          </Link>
          <h1 className="text-3xl sm:text-4xl font-black text-black mb-2 uppercase tracking-widest drop-shadow-sm">
            {t('auth.joinCommunity')}
          </h1>
          <p className="text-lg text-foreground/80 font-bold">
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
                  <CheckCircle className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                  <p className="text-foreground font-bold text-center mb-6">
                    {t('auth.codeSentTo')} <span className="text-blue-600 font-black">{emailAddress}</span>
                  </p>
                </motion.div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-300">{error}</p>
                  </motion.div>
                )}

                <div className="space-y-2">
                  <label htmlFor="code" className="block text-sm font-bold text-muted-foreground uppercase tracking-widest">
                    {t('auth.verificationCode')}
                  </label>
                  <input
                    id="code"
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder={t('auth.codePlaceholder')}
                    required
                    className="w-full bg-background border border-border rounded-lg px-4 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-bold"
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
                  className="w-full text-sm text-blue-600 hover:text-blue-800 font-bold transition-colors uppercase tracking-widest"
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
                    className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-amber-300">{error}</p>
                  </motion.div>
                )}

                {/* Name Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="block text-sm font-black text-foreground uppercase tracking-widest">
                      {t('auth.firstName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder={t('auth.firstPlaceholder')}
                        required
                        className="w-full bg-background border border-border rounded-lg px-12 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="lastName" className="block text-sm font-black text-foreground uppercase tracking-widest">
                      {t('auth.lastName')}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder={t('auth.lastPlaceholder')}
                        required
                        className="w-full bg-background border border-border rounded-lg px-12 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-black text-foreground uppercase tracking-widest">
                    {t('auth.emailLabel')}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      id="email"
                      type="email"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      placeholder={t('auth.emailPlaceholder')}
                      required
                      className="w-full bg-background border border-border rounded-lg px-12 py-3 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-black text-foreground uppercase tracking-widest">
                    {t('auth.passwordLabel')}
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-400" />
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.createPasswordPlaceholder')}
                      required
                      className="w-full bg-background border border-border rounded-lg px-12 py-3 pr-12 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 font-bold">
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
                  className="text-sm text-blue-600 hover:text-blue-800 font-bold transition-colors uppercase tracking-widest"
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
