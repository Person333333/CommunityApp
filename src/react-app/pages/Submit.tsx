import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send, Sparkles, Lock, User } from 'lucide-react';
import { SignedIn, SignedOut, useUser } from '@clerk/clerk-react';
import { Link } from 'react-router';
import confetti from 'canvas-confetti';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import { categories } from '@/shared/types';

import { useTranslation } from 'react-i18next';

export default function Submit() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    contact_name: '',
    contact_email: '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // ... (keep handleChange and celebration code same until render) ...

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const triggerCelebration = () => {
    // ... (same implementation)
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#0f766e', '#f59e0b', '#06b6d4'] });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#0f766e', '#f59e0b', '#06b6d4'] });
    }, 250);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        triggerCelebration();
        setFormData({
          title: '', description: '', category: '', contact_name: '', contact_email: '',
          phone: '', website: '', address: '', city: '', state: '',
        });
      } else {
        setErrors(data.error?.issues?.reduce((acc: any, issue: any) => {
          acc[issue.path[0]] = issue.message;
          return acc;
        }, {}) || { general: t('submit.form.errors.general') });
      }
    } catch (error) {
      setErrors({ general: t('submit.form.errors.network') });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          <GlassCard variant="strong" className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-teal-500 to-amber-500 flex items-center justify-center"
            >
              <Sparkles className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-3xl sm:text-4xl font-bold gradient-text mb-4">
              {t('submit.success.title')}
            </h2>

            <p className="text-lg text-slate-300 mb-8">
              {t('submit.success.text')}
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <GlassButton
                variant="primary"
                onClick={() => setSuccess(false)}
              >
                {t('submit.success.submitAnother')}
              </GlassButton>
              <GlassButton
                variant="secondary"
                onClick={() => window.location.href = '/discover'}
              >
                {t('submit.success.browse')}
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            {t('submit.title')}
          </h1>
          <p className="text-xl text-slate-300">
            {t('submit.subtitle')}
          </p>
        </motion.div>

        <SignedOut>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-2xl mx-auto"
          >
            <GlassCard className="text-center">
              <div className="py-12">
                <Lock className="w-16 h-16 mx-auto text-teal-400 mb-6" />
                <h2 className="text-2xl font-bold text-slate-100 mb-4">
                  {t('submit.signInRequired.title')}
                </h2>
                <p className="text-lg text-slate-300 mb-8">
                  {t('submit.signInRequired.text')}
                </p>
                <Link to="/sign-in">
                  <GlassButton size="lg" className="inline-flex items-center gap-2">
                    <User className="w-5 h-5" />
                    {t('submit.signInRequired.button')}
                  </GlassButton>
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        </SignedOut>

        <SignedIn>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 max-w-2xl mx-auto"
          >
            <GlassCard variant="teal" className="text-center">
              <div className="flex items-center gap-3 justify-center">
                <User className="w-5 h-5 text-teal-300" />
                <span className="text-slate-100">
                  {t('submit.signInRequired.signedInAs')} <span className="text-teal-300 font-medium">{user?.primaryEmailAddress?.emailAddress}</span>
                </span>
              </div>
            </GlassCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <GlassCard variant="strong">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <div className="glass-ochre p-4 rounded-lg text-red-300">
                    {errors.general}
                  </div>
                )}

                {/* Resource Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-100 border-b border-white/10 pb-2">
                    {t('submit.form.resourceInfo')}
                  </h3>

                  <FormField
                    label={t('submit.form.title')}
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    error={errors.title}
                    required
                    placeholder={t('submit.form.titlePlaceholder')}
                  />

                  <FormField
                    label={t('submit.form.description')}
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    required
                    multiline
                    rows={4}
                    placeholder={t('submit.form.descriptionPlaceholder')}
                  />

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      {t('submit.form.category')} <span className="text-red-400">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full glass-teal rounded-lg px-4 py-3 text-slate-100 bg-transparent border-none outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="" disabled>{t('submit.form.selectCategory')}</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-800">
                          {t(`categories.${cat}`, cat)}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-400">{errors.category}</p>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-100 border-b border-white/10 pb-2">
                    {t('submit.form.contactInfo')}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label={t('submit.form.contactName')}
                      name="contact_name"
                      value={formData.contact_name}
                      onChange={handleChange}
                      error={errors.contact_name}
                      required
                      placeholder={t('submit.form.contactNamePlaceholder')}
                    />

                    <FormField
                      label={t('submit.form.email')}
                      name="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={handleChange}
                      error={errors.contact_email}
                      required
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label={t('submit.form.phone')}
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      error={errors.phone}
                      placeholder="(555) 123-4567"
                    />

                    <FormField
                      label={t('submit.form.website')}
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleChange}
                      error={errors.website}
                      placeholder="https://example.com"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-slate-100 border-b border-white/10 pb-2">
                    {t('submit.form.location')}
                  </h3>

                  <FormField
                    label={t('submit.form.address')}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    error={errors.address}
                    placeholder="123 Main Street"
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      label={t('submit.form.city')}
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      error={errors.city}
                      placeholder="Seattle"
                    />

                    <FormField
                      label={t('submit.form.state')}
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      error={errors.state}
                      placeholder="WA"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
                  <GlassButton
                    variant="primary"
                    size="lg"
                    type="submit"
                    disabled={submitting}
                    className="w-full"
                  >
                    {submitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                        />
                        {t('submit.form.submitting')}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <Send className="w-5 h-5" />
                        {t('submit.form.button')}
                      </span>
                    )}
                  </GlassButton>
                </div>
              </form>
            </GlassCard>
          </motion.div>
        </SignedIn>
      </div>
    </div>
  );
}

function FormField({
  label,
  name,
  value,
  onChange,
  error,
  required,
  multiline,
  rows = 3,
  type = 'text',
  placeholder,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (e: any) => void;
  error?: string;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  type?: string;
  placeholder?: string;
}) {
  const [focused, setFocused] = useState(false);

  const inputClasses = "w-full glass-teal rounded-lg px-4 py-3 text-slate-100 bg-transparent border-none outline-none focus:ring-2 focus:ring-teal-500 transition-all";

  return (
    <div>
      <motion.label
        className="block text-sm font-medium text-slate-300 mb-2"
        animate={{ color: focused ? '#5eead4' : '#cbd5e1' }}
      >
        {label} {required && <span className="text-red-400">*</span>}
      </motion.label>
      {multiline ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          rows={rows}
          placeholder={placeholder}
          className={inputClasses}
        />
      ) : (
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          placeholder={placeholder}
          className={inputClasses}
        />
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-400"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
