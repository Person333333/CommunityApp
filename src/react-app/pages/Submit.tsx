import { motion } from 'framer-motion';
import { useState } from 'react';
import { Send, Sparkles, MapPin, Loader2, Info } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import { categories } from '@/shared/types';

import { useTranslation } from 'react-i18next';
import { aiSearchService } from '@/react-app/services/aiSearch';

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
    zip: '',
    audience: '',
    hours: '',
    services: '',
    tags: '',
    image_url: '',
    latitude: '',
    longitude: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);

  const handleGetLocation = () => {
    setLocating(true);
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      setLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString()
        }));
        setLocating(false);
      },
      () => {
        alert('Unable to retrieve your location');
        setLocating(false);
      }
    );
  };

  const geocodeAddress = async (address: string, city: string, state: string, zip: string) => {
    try {
      const fullAddress = `${address}, ${city}, ${state} ${zip}`.trim();
      if (!fullAddress) return null;

      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
      const data = await response.json();

      if (data && data.length > 0) {
        return {
          lat: data[0].lat,
          lon: data[0].lon
        };
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    return null;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const [validating, setValidating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.contact_email || !emailRegex.test(formData.contact_email)) {
      newErrors.contact_email = "Please enter a valid email address";
    }

    const isLikelyGibberish = (text: string): boolean => {
      const cleanText = text.trim().toLowerCase();
      const knownGibberish = ['ferferf', 'orejfr', 'asdf', 'qwerty', '0ijo9ij', 'vorjovrk'];
      if (knownGibberish.some(g => cleanText.includes(g))) return true;
      const consonantCluster = /[bcdfghjklmnpqrstvwxyz]{6,}/i;
      return consonantCluster.test(cleanText);
    };

    if (isLikelyGibberish(formData.title) || isLikelyGibberish(formData.description)) {
      setErrors({ general: "Please provide a more descriptive and readable title/description." });
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setValidating(true);
    try {
      const aiResponse = await aiSearchService.validateSubmission(formData);
      if (!aiResponse.isValid) {
        setErrors({ general: `AI Quality Check Failed: ${aiResponse.feedback}` });
        setValidating(false);
        return;
      }
    } catch (err) {
      console.error('AI validation error:', err);
      setErrors({ general: "Unable to verify content at this time. Please try again in 1 minute." });
      setValidating(false);
      return;
    }

    setValidating(false);
    setSubmitting(true);

    let finalLat = formData.latitude;
    let finalLng = formData.longitude;

    if (!finalLat || !finalLng) {
      const coords = await geocodeAddress(formData.address, formData.city, formData.state, formData.zip);
      if (coords) {
        finalLat = coords.lat.toString();
        finalLng = coords.lon.toString();
      }
    }

    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id,
          latitude: finalLat ? parseFloat(finalLat) : null,
          longitude: finalLng ? parseFloat(finalLng) : null,
          is_approved: true,
          is_featured: false,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({
          title: '', description: '', category: '', contact_name: '', contact_email: '',
          phone: '', website: '', address: '', city: '', state: '', zip: '',
          audience: '', hours: '', services: '', tags: '',
          image_url: '', latitude: '', longitude: '',
        });
      } else {
        setErrors(data.error?.issues?.reduce((acc: any, issue: any) => {
          acc[issue.path[0]] = issue.message;
          return acc;
        }, {}) || { general: data.error?.general || t('submit.form.errors.general') });
      }
    } catch (error) {
      setErrors({ general: t('submit.form.errors.network') });
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 bg-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          <GlassCard className="text-center p-12 bg-white border border-slate-100 shadow-2xl">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shadow-lg"
            >
              <Sparkles className="w-12 h-12" />
            </motion.div>

            <h2 className="text-4xl font-bold text-blue-900 mb-4">
              {t('submit.success.title')}
            </h2>

            <p className="text-xl text-slate-700 mb-10 font-bold">
              {t('submit.success.text')}
            </p>

            <div className="flex gap-4 justify-center flex-wrap">
              <GlassButton variant="primary" onClick={() => setSuccess(false)} className="px-8 h-14">
                {t('submit.success.submitAnother')}
              </GlassButton>
              <GlassButton variant="secondary" onClick={() => window.location.href = '/discover'} className="px-8 h-14">
                {t('submit.success.browse')}
              </GlassButton>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto max-w-4xl text-slate-100">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-5xl font-bold text-blue-900 mb-4">
            {t('submit.title')}
          </h1>
          <p className="text-xl text-slate-800 font-bold max-w-2xl mx-auto leading-relaxed">
            {t('submit.subtitle')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <GlassCard className="bg-white border border-slate-100 shadow-xl overflow-hidden p-0">
            <div className="bg-blue-700 p-8 flex items-center gap-6 text-white text-lg font-black">
              <Info className="w-8 h-8" />
              <p className="uppercase tracking-widest">{t('submit.form.resourceInfo')}</p>
            </div>
            <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-10">
              {errors.general && (
                <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-r-lg text-red-800 font-medium shadow-sm">
                  {errors.general}
                </div>
              )}

              <div className="space-y-8">
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-3 uppercase tracking-widest">
                      {t('submit.form.category')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-medium appearance-none"
                    >
                      <option value="" disabled>{t('submit.form.selectCategory')}</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>
                          {t(`categories.${cat}`, cat)}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-2 text-sm text-red-500 font-medium">{errors.category}</p>
                    )}
                  </div>

                  <FormField
                    label={t('submit.form.audience')}
                    name="audience"
                    value={formData.audience}
                    onChange={handleChange}
                    error={errors.audience}
                    placeholder={t('submit.form.audiencePlaceholder')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <FormField
                    label={t('submit.form.hours')}
                    name="hours"
                    value={formData.hours}
                    onChange={handleChange}
                    error={errors.hours}
                    placeholder={t('submit.form.hoursPlaceholder')}
                  />
                  <FormField
                    label={t('submit.form.services')}
                    name="services"
                    value={formData.services}
                    onChange={handleChange}
                    error={errors.services}
                    placeholder={t('submit.form.servicesPlaceholder')}
                  />
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100 space-y-8">
                <h3 className="text-lg font-bold text-blue-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">02</span>
                  {t('submit.form.contactInfo')}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
              </div>

              <div className="pt-10 border-t border-slate-100 space-y-8">
                <h3 className="text-lg font-bold text-blue-900 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">03</span>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
                  <FormField
                    label={t('submit.form.zip')}
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    error={errors.zip}
                    placeholder="98101"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={locating}
                    className="text-sm text-blue-700 hover:text-blue-900 font-black flex items-center gap-2 transition-colors bg-blue-100 px-6 py-3 rounded-full shadow-sm"
                  >
                    {locating ? <Loader2 className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                    {locating ? t('submit.form.locating') : t('submit.form.useMyLocation')}
                  </button>
                </div>
              </div>

              <div className="pt-12">
                <GlassButton
                  variant="primary"
                  size="lg"
                  type="submit"
                  disabled={submitting || validating}
                  className="w-full h-16 text-xl rounded-2xl shadow-xl shadow-blue-600/20"
                >
                  {validating ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                      />
                      {t('submit.form.verifying')}
                    </span>
                  ) : submitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-6 h-6 border-3 border-white border-t-transparent rounded-full"
                      />
                      {t('submit.form.submitting')}
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-3">
                      <Send className="w-6 h-6" />
                      {t('submit.form.button')}
                    </span>
                  )}
                </GlassButton>
              </div>
            </form>
          </GlassCard>
        </motion.div>
      </div>
    </div >
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
  step,
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
  step?: string;
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div className="space-y-3">
      <label className={`block text-sm font-black uppercase tracking-widest transition-colors ${focused ? 'text-blue-600' : 'text-slate-800'}`}>
        {label} {required && <span className="text-red-600">*</span>}
      </label>
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
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-4 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-slate-500"
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
          step={step}
          className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-4 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 transition-all font-bold placeholder:text-slate-500"
        />
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-sm text-red-500 font-bold"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
