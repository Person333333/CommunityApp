import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Sparkles, MapPin, Loader2, Upload, Image as ImageIcon, ChevronRight, ChevronLeft, Eye, CheckCircle2, ShieldCheck, User as UserIcon, Compass, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

import { Card, CardContent } from '@/react-app/components/ui/card';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { categories } from '@/shared/types';

import { useTranslation } from 'react-i18next';
import { aiSearchService } from '@/react-app/services/aiSearch';

export default function Submit() {
  const { t } = useTranslation();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    contact_name: user?.fullName || '',
    contact_email: user?.primaryEmailAddress?.emailAddress || '',
    phone: '',
    website: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    audience: '',
    hours: '',
    schedule: '',
    services: '',
    tags: '',
    image_url: '',
    latitude: '',
    longitude: '',
    auto_assign_tags: false,
    action_urls: [] as { label: string, url: string }[],
    donation_url: '',
    website_action_label: t('submit.form.defaultActionLabel', 'Visit Website'),
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locating, setLocating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [validating, setValidating] = useState(false);
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, image_url: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file);
    }
  };

  const nextStep = () => {
    const stepErrors: Record<string, string> = {};
    if (currentStep === 1) {
      if (!formData.title) stepErrors.title = "Title is required";
      if (!formData.description) stepErrors.description = "Description is required";
      if (!formData.category) stepErrors.category = "Category is required";
    } else if (currentStep === 2) {
      if (!formData.contact_name) stepErrors.contact_name = "Contact name is required";
      if (!formData.contact_email) stepErrors.contact_email = "Email is required";
      if (!formData.address) stepErrors.address = "Address is required";
      if (!formData.city) stepErrors.city = "City is required";
      if (!formData.state) stepErrors.state = "State is required";
      if (!formData.zip) stepErrors.zip = "ZIP code is required";
    }

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCurrentStep(prev => prev + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setValidating(true);
    setErrors({});

    try {
      // 🤖 AI Validation Step
      const aiResponse = await aiSearchService.validateSubmission(formData);
      if (!aiResponse.isValid) {
        setErrors({ general: `AI Quality Check Failed: ${aiResponse.feedback}` });
        setValidating(false);
        setSubmitting(false);
        return;
      }

      setValidating(false);

      // Auto-geocode if needed
      const coords = await geocodeAddress(formData.address, formData.city, formData.state, formData.zip);
      const finalLat = coords ? coords.lat : formData.latitude;
      const finalLng = coords ? coords.lon : formData.longitude;

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          user_id: user?.id,
          latitude: finalLat ? parseFloat(String(finalLat)) : null,
          longitude: finalLng ? parseFloat(String(finalLng)) : null,
          is_approved: true,
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setErrors({ general: data.error?.general || "Submission failed. Please try again." });
      }
    } catch (error) {
      console.error('Submission error:', error);
      setErrors({ general: "A network error occurred. Please check your connection." });
    } finally {
      setSubmitting(false);
      setValidating(false);
    }
  };

  const geocodeAddress = async (address: string, city: string, state: string, zip: string) => {
    try {
      const fullAddress = `${address}, ${city}, ${state} ${zip}`.trim();
      if (!fullAddress) return null;
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1`);
      const data = await res.json();
      return data?.[0] ? { lat: data[0].lat, lon: data[0].lon } : null;
    } catch { return null; }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const handleGetLocation = () => {
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos: GeolocationPosition) => {
        setFormData(prev => ({ ...prev, latitude: pos.coords.latitude.toString(), longitude: pos.coords.longitude.toString() }));
        setLocating(false);
      },
      () => { alert('Location access denied.'); setLocating(false); }
    );
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-16 bg-transparent">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.6 }}
          className="max-w-2xl w-full"
        >
          <Card className="text-center p-12 bg-black/40 backdrop-blur-xl border border-white/10 rounded-none relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent opacity-50" />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="w-24 h-24 mx-auto mb-8 rounded-none bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)] relative z-10"
            >
              <Sparkles className="w-12 h-12" />
            </motion.div>
Page
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter relative z-10">
              {t('submit.success.title')}
            </h2>

            <p className="text-xl text-slate-400 mb-10 font-bold uppercase tracking-widest text-xs relative z-10">
              {t('submit.success.text')}
            </p>

            <div className="flex gap-4 justify-center flex-wrap relative z-10">
              <Button onClick={() => setSuccess(false)} className="px-10 py-7 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-none shadow-xl shadow-emerald-500/20">
                {t('submit.success.submitAnother')}
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/discover'} className="px-10 py-7 bg-white/5 border-white/10 text-white hover:bg-white/10 rounded-none uppercase font-black tracking-widest">
                {t('submit.success.browse')}
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-transparent overflow-hidden">
      <div className="container mx-auto max-w-4xl">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              {t('submit.title')}
            </h1>
            <div className="text-sm font-black text-slate-400 uppercase tracking-widest">
              Step {currentStep} / 3
            </div>
          </div>

          <div className="flex gap-2 h-2">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`flex-1 rounded-none transition-all duration-500 ${currentStep >= s ? 'bg-emerald-500 shadow-lg shadow-emerald-500/30' : 'bg-white/10'
                  }`}
              />
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${currentStep === 1 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <ImageIcon className="w-4 h-4" /> {t('submit.steps.resourceInfo', 'Resource Info')}
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${currentStep === 2 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <UserIcon className="w-4 h-4" /> {t('submit.steps.yourInfo', 'Your Info')}
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${currentStep === 3 ? 'text-emerald-400' : 'text-slate-500'}`}>
              <Eye className="w-4 h-4" /> {t('submit.steps.review', 'Review')}
            </div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none overflow-hidden p-0 shadow-2xl">
                <div className="bg-emerald-500/10 p-6 flex items-center gap-4 text-white border-b border-white/10">
                  <ImageIcon className="w-6 h-6 text-emerald-400" />
                  <p className="font-black uppercase tracking-widest text-sm">{t('submit.step1.header', 'Step 1: Resource Core Details')}</p>
                </div>
                <div className="p-8 space-y-8">
                  <FormField label={t('submit.form.title', 'Resource Title')} name="title" value={formData.title} onChange={handleChange} error={errors.title} required placeholder={t('submit.form.titlePlaceholder', 'Name of organization or service...')} />

                  <FormField label={t('submit.form.description', 'Full Description')} name="description" value={formData.description} onChange={handleChange} error={errors.description} required multiline rows={4} placeholder={t('submit.form.descriptionPlaceholder', 'Describe the services and impact...')} />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-black text-slate-300 mb-3 uppercase tracking-widest">{t('submit.form.category', 'Category')} *</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer">
                        <option value="" disabled className="bg-black text-slate-400">{t('submit.form.selectCategory', 'Select a category...')}</option>
                        {categories.map(cat => <option key={cat} value={cat} className="bg-black text-white">{t(`category.${cat}`, cat)}</option>)}
                      </select>
                      {errors.category && <p className="mt-2 text-xs text-emerald-500 font-bold">{errors.category}</p>}
                    </div>
                    <FormField label={t('submit.form.schedule', 'Specific Schedule')} name="schedule" value={formData.schedule} onChange={handleChange} placeholder={t('submit.form.schedulePlaceholder', 'e.g. Every 2nd Tuesday at 5pm...')} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-black text-slate-300 mb-3 uppercase tracking-widest">{t('submit.form.websiteAction', 'Website Action Button')}</label>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('submit.form.websiteActionHint', 'This will show as a button on your published resource')}</p>
                      <div className="flex gap-2">
                        <select
                          value={(formData as any).website_action_label || t('submit.form.defaultActionLabel', 'Visit Website')}
                          onChange={(e) => setFormData(prev => ({ ...prev, website_action_label: e.target.value }))}
                          className="bg-white/5 border border-white/10 rounded-none px-3 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all appearance-none cursor-pointer text-sm w-44 shrink-0"
                        >
                          <option value="Visit Website" className="bg-black text-white">{t('submit.action.visit', 'Visit Website')}</option>
                          <option value="Register" className="bg-black text-white">{t('submit.action.register', 'Register')}</option>
                          <option value="Learn More" className="bg-black text-white">{t('submit.action.learnMore', 'Learn More')}</option>
                          <option value="Donate" className="bg-black text-white">{t('submit.action.donate', 'Donate')}</option>
                          <option value="Volunteer" className="bg-black text-white">{t('submit.action.volunteer', 'Volunteer')}</option>
                          <option value="Apply Now" className="bg-black text-white">{t('submit.action.applyNow', 'Apply Now')}</option>
                          <option value="Get Help" className="bg-black text-white">{t('submit.action.getHelp', 'Get Help')}</option>
                        </select>
                        <Input
                          type="url"
                          name="website"
                          value={formData.website}
                          onChange={handleChange}
                          placeholder="https://..."
                          className={`flex-1 bg-white/5 border ${errors.website ? 'border-emerald-500 ring-1 ring-emerald-500' : 'border-white/10'} rounded-none px-4 py-7 font-bold text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all`}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-300 mb-3 uppercase tracking-widest">Donation Link (Optional)</label>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Shows as a "Donate" button on your resource</p>
                      <input
                        type="url"
                        name="donation_url"
                        value={formData.donation_url}
                        onChange={handleChange}
                        placeholder="https://donate..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 font-bold text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2 drop-shadow-sm">
                        <Compass className="w-4 h-4 text-indigo-400" /> {t('submit.form.additionalActions', 'Additional Action Buttons')}
                      </h4>
                      <div className="text-[10px] font-black uppercase text-slate-400">{t('submit.form.maxActions', 'Max 2 custom actions')}</div>
                    </div>

                    <div className="space-y-4">
                      {formData.action_urls.map((action, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 bg-white/5 rounded-2xl border border-white/10 relative group">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Action Type</label>
                            <select
                              value={action.label}
                              onChange={(e) => {
                                const next = [...formData.action_urls];
                                next[idx].label = e.target.value;
                                setFormData(prev => ({ ...prev, action_urls: next }));
                              }}
                              className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none"
                            >
                              {["Register", "Learn More", "Visit Website", "Donate", "Volunteer"].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                          </div>
                          <div className="flex-[2]">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Destination URL</label>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={action.url}
                              onChange={(e) => {
                                const next = [...formData.action_urls];
                                next[idx].url = e.target.value;
                                setFormData(prev => ({ ...prev, action_urls: next }));
                              }}
                              className="w-full bg-slate-900 border border-white/20 rounded-lg px-3 py-2 text-sm font-bold text-white outline-none"
                            />
                          </div>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, action_urls: prev.action_urls.filter((_, i) => i !== idx) }))}
                            className="bg-red-500/10 border border-red-500/20 p-2 rounded-lg text-red-400 hover:bg-red-500/20 transition-colors self-end"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {formData.action_urls.length < 2 && (
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, action_urls: [...prev.action_urls, { label: 'Learn More', url: '' }] }))}
                          className="w-full py-4 border-2 border-dashed border-white/20 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-xs hover:border-blue-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" /> {t('submit.form.addAction', 'Add Action Button')}
                        </button>
                      )}
                    </div>
                  </div>

                  {!formData.auto_assign_tags && (
                    <div className="space-y-4">
                      <FormField
                        label={t('submit.form.tags', 'Additional Tags / Keywords')}
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder={t('submit.form.tagsPlaceholder', 'e.g. wheelchair-accessible, pets-welcome, free-parking...')}
                      />
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t('submit.form.tagsHint', 'Separate tags with commas')}</p>
                    </div>
                  )}

                  <div className="flex flex-col justify-center py-4 border-y border-white/10">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          className="sr-only p-4"
                          checked={formData.auto_assign_tags}
                          onChange={(e) => setFormData(prev => ({ ...prev, auto_assign_tags: e.target.checked }))}
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${formData.auto_assign_tags ? 'bg-blue-600' : 'bg-white/10 border border-white/20'}`} />
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.auto_assign_tags ? 'translate-x-6' : ''}`} />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white uppercase tracking-tight">{t('submit.form.autoTags', 'Auto-assign Smart Tags')}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase">{t('submit.form.autoTagsHint', 'AI will suggest tags based on your description')}</p>
                      </div>
                    </label>
                  </div>

                  {/* Image Drag/Drop */}
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-slate-300 uppercase tracking-widest">Resource Image</label>
                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => document.getElementById('fileInput')?.click()}
                      className={`relative border-2 border-dashed rounded-chromic-card p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-white/20 bg-white/5 hover:border-blue-400'
                        } ${formData.image_url ? 'bg-slate-900 border-none' : ''}`}
                    >
                      <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }} />

                      {formData.image_url ? (
                        <>
                          <img src={formData.image_url} className="absolute inset-0 w-full h-full object-cover opacity-60 rounded-chromic-card" alt="Preview" />
                          <div className="relative z-10 text-white flex flex-col items-center gap-2">
                            <Upload className="w-10 h-10" />
                            <p className="font-black uppercase tracking-widest text-xs shadow-md">{t('submit.form.changeImage', 'Click or drag to change image')}</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-slate-300 shadow-sm backdrop-blur-sm">
                            <Upload className="w-8 h-8" />
                          </div>
                          <div className="text-center">
                            <p className="font-black text-white uppercase tracking-tight text-lg drop-shadow-md">{t('submit.form.dropImage', 'Drop your image here')}</p>
                            <p className="text-slate-400 font-bold text-sm">{t('submit.form.browseFiles', 'or click to browse local files')}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-end">
                <Button onClick={nextStep} className="px-10 py-8 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-none shadow-xl shadow-emerald-500/20 group">
                  <span className="flex items-center gap-2">{t('submit.navigation.nextContact', 'Next: Contact Info')} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></span>
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none overflow-hidden p-0 shadow-2xl">
                <div className="bg-emerald-500/10 p-6 flex items-center gap-4 text-white border-b border-white/10">
                  <UserIcon className="w-6 h-6 text-emerald-400" />
                  <p className="font-black uppercase tracking-widest text-sm">{t('submit.step2.header', 'Step 2: Your & Location Details')}</p>
                </div>
                <div className="p-8 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label={t('submit.form.contactName', 'Your Name / Org Contact')} name="contact_name" value={formData.contact_name} onChange={handleChange} required placeholder={t('submit.form.contactNamePlaceholder', 'Full name...')} />
                    <FormField label={t('submit.form.contactEmail', 'Contact Email')} name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} required placeholder={t('submit.form.contactEmailPlaceholder', 'For verification updates...')} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label={t('submit.form.phone', 'Phone Number')} name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" />
                    <FormField label={t('submit.form.audience', 'Target Audience')} name="audience" value={formData.audience} onChange={handleChange} placeholder={t('submit.form.audiencePlaceholder', 'e.g. Seniors, Families, Veterans...')} />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-white uppercase tracking-widest text-sm flex items-center gap-2 drop-shadow-sm">
                        <MapPin className="w-4 h-4 text-blue-400" /> {t('submit.form.addressTitle', 'Physical Address (Required)')}
                      </h4>
                      <Button onClick={handleGetLocation} variant="outline" className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/5 border-emerald-500/20 px-3 py-1 rounded-none hover:bg-emerald-500/10 hover:text-emerald-300 transition-all h-auto flex items-center gap-2">
                        {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
                        {t('submit.form.useGPS', 'Use GPS Coordinates')}
                      </Button>
                      <Button
                        onClick={async () => {
                          setLocating(true);
                          const coords = await geocodeAddress(formData.address, formData.city, formData.state, formData.zip);
                          if (coords) {
                            setFormData(prev => ({ ...prev, latitude: coords.lat.toString(), longitude: coords.lon.toString() }));
                            alert(t('submit.form.addressVerified', "Location verified and coordinates captured!"));
                          } else {
                            alert(t('submit.form.addressVerifyFailed', "Could not verify this address. Please check and try again."));
                          }
                          setLocating(false);
                        }}
                        variant="outline"
                        className="text-[10px] font-black uppercase text-cyan-400 bg-cyan-500/5 border-cyan-500/20 px-3 py-1 rounded-none hover:bg-cyan-500/10 hover:text-cyan-300 transition-all h-auto flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3 h-3" /> {t('submit.form.verifyAddress', 'Verify Address')}
                      </Button>
                    </div>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2">{t('submit.form.addressHint', 'We use the address to accurately place your resource on the map.')}</p>
                    <FormField label={t('submit.form.streetAddress', 'Street Address')} name="address" value={formData.address} onChange={handleChange} required placeholder="123 Community St." error={errors.address} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField label={t('submit.form.city', 'City')} name="city" value={formData.city} onChange={handleChange} required error={errors.city} />
                      <FormField label={t('submit.form.state', 'State')} name="state" value={formData.state} onChange={handleChange} required error={errors.state} />
                      <FormField label={t('submit.form.zip', 'ZIP')} name="zip" value={formData.zip} onChange={handleChange} required error={errors.zip} />
                    </div>
                  </div>


                </div>
              </Card>

              <div className="flex justify-between">
                <button onClick={prevStep} className="px-8 font-black uppercase text-xs text-slate-500 hover:text-white flex items-center gap-2 transition-colors">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <Button onClick={nextStep} className="px-10 py-8 bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-none shadow-xl shadow-emerald-500/20 group">
                  Final Review <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Preview Card */}
                <div className="space-y-4">
                  <p className="font-black uppercase tracking-widest text-[10px] text-emerald-500 ml-2">{t('submit.step3.previewHint', 'How it will look')}</p>
                  <Card className="p-0 overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 rounded-none shadow-2xl group/preview">
                    <div className="h-48 bg-slate-950 relative">
                      {formData.image_url ? (
                        <img src={formData.image_url} className="w-full h-full object-cover opacity-80" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-16 h-16 text-slate-400" /></div>
                      )}
                      <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-none text-[10px] font-black text-emerald-400 border border-emerald-500/20 uppercase tracking-widest shadow-xl">
                        {t(`category.${formData.category}`, formData.category || 'Category')}
                      </div>
                    </div>
                    <CardContent className="p-6 space-y-3">
                      <h3 className="text-2xl font-black text-white uppercase tracking-tighter line-clamp-1 group-hover/preview:text-emerald-400 transition-colors">{formData.title || t('submit.preview.untitled', 'Untitled Resource')}</h3>
                      <p className="text-sm text-slate-400 font-medium line-clamp-3 leading-relaxed">{formData.description || t('submit.preview.noDescription', 'No description provided yet...')}</p>
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-none"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-slate-300">{formData.city || t('submit.preview.remote', 'Remote')}</span></div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-white/5 border border-white/10 rounded-none"><UserIcon className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-slate-300">{formData.audience || t('submit.preview.everyone', 'Everyone')}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Final Verification Details */}
                <div className="space-y-6">
                  <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none overflow-hidden p-6 shadow-2xl">
                    <h4 className="font-black text-white uppercase tracking-tight mb-4 flex items-center gap-2 drop-shadow-sm">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" /> {t('submit.policy.title', 'Submission Policy')}
                    </h4>
                    <ul className="space-y-4">
                      {[
                        t('submit.policy.item1', 'Verified for accuracy by our community lead.'),
                        t('submit.policy.item2', 'AI analysis for quality and helpfulness check.'),
                        t('submit.policy.item3', 'Instantly live after passing automated review.')
                      ].map((text, i) => (
                        <li key={i} className="flex gap-3 text-sm font-bold text-slate-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-5 rounded-none text-sm font-bold flex gap-4 cursor-pointer transition-all border ${errors.general.includes('AI Quality Check Failed')
                        ? 'bg-red-500/10 border-red-500/20 text-red-300 hover:bg-red-500/20 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'bg-white/5 border-white/10 text-slate-400'
                        }`}
                      onClick={() => {
                        if (errors.general.includes('AI Quality Check Failed')) {
                          alert(`🤖 DETAILED AI AUDIT REPORT:\n\n${errors.general.replace('AI Quality Check Failed: ', '')}\n\nTip: Make sure your description is professional and doesn't contain placeholders like [Link Here] or [Phone].`);
                        }
                      }}
                    >
                      <div className={`w-10 h-10 rounded-none flex items-center justify-center flex-shrink-0 ${errors.general.includes('AI Quality Check Failed') ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-slate-500'
                        }`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="uppercase tracking-widest text-[10px] mb-1 opacity-60">{t('submit.error.verificationReport', 'Verification Report')}</p>
                        <p className="leading-relaxed font-black uppercase text-[11px] tracking-tight">{errors.general}</p>
                        {errors.general.includes('AI Quality Check Failed') && (
                          <p className="mt-2 text-red-400 text-[10px] uppercase font-black flex items-center gap-1 tracking-widest">
                            {t('submit.error.reviewDetailed', 'Review detailed reasoning')} <ChevronRight className="w-3 h-3" />
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || validating}
                      className="w-full h-20 text-xl bg-emerald-500 hover:bg-emerald-400 text-black rounded-none shadow-2xl shadow-emerald-500/20 font-black uppercase tracking-[0.2em] relative overflow-hidden"
                    >
                      {validating ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>{t('submit.status.auditing', 'AI Auditing...')}</span>
                          </div>
                          <span className="text-[10px] mt-1 opacity-60">{t('submit.status.qualityControl', 'Quality Control in progress')}</span>
                        </div>
                      ) : submitting ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>{t('submit.status.deploying', 'Deploying...')}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6" />
                          {t('submit.form.submitNetwork', 'Submit to Network')}
                        </div>
                      )}
                    </Button>
                    <button onClick={prevStep} className="w-full py-4 text-[10px] font-black uppercase text-slate-500 hover:text-white transition-colors tracking-widest">
                      Need to edit something? Go back
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
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
      <label className={`block text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${focused ? 'text-emerald-400' : 'text-slate-500'}`}>
        {label} {required && <span className="text-emerald-500">*</span>}
      </label>
      {multiline ? (
        <Textarea
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          rows={rows}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-white outline-none focus-visible:ring-emerald-500 transition-all font-bold placeholder:text-slate-600 min-h-[120px]"
        />
      ) : (
        <Input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          required={required}
          placeholder={placeholder}
          step={step}
          className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-7 text-white outline-none focus-visible:ring-emerald-500 transition-all font-bold placeholder:text-slate-600 h-auto"
        />
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 text-[10px] text-emerald-500 font-black uppercase tracking-widest"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
