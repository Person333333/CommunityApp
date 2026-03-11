import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Sparkles, MapPin, Loader2, Upload, Image as ImageIcon, ChevronRight, ChevronLeft, Eye, CheckCircle2, ShieldCheck, User as UserIcon, Compass, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
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
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="container mx-auto max-w-4xl">
        {/* Progress Header */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-black text-slate-800 uppercase tracking-tight">
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
                className={`flex-1 rounded-full transition-all duration-500 ${currentStep >= s ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-slate-100'
                  }`}
              />
            ))}
          </div>

          <div className="flex justify-between mt-4">
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${currentStep === 1 ? 'text-blue-600' : 'text-slate-400'}`}>
              <ImageIcon className="w-4 h-4" /> Resource Info
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${currentStep === 2 ? 'text-blue-600' : 'text-slate-400'}`}>
              <UserIcon className="w-4 h-4" /> Your Info
            </div>
            <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest ${currentStep === 3 ? 'text-blue-600' : 'text-slate-400'}`}>
              <Eye className="w-4 h-4" /> Review
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
              <GlassCard className="bg-white border-slate-100 shadow-xl overflow-hidden p-0">
                <div className="bg-slate-800 p-6 flex items-center gap-4 text-white">
                  <ImageIcon className="w-6 h-6" />
                  <p className="font-black uppercase tracking-widest text-sm">Step 1: Resource Core Details</p>
                </div>
                <div className="p-8 space-y-8">
                  <FormField label="Resource Title" name="title" value={formData.title} onChange={handleChange} error={errors.title} required placeholder="Name of organization or service..." />

                  <FormField label="Full Description" name="description" value={formData.description} onChange={handleChange} error={errors.description} required multiline rows={4} placeholder="Describe the services and impact..." />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-black text-slate-800 mb-3 uppercase tracking-widest">Category *</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-4 font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all appearance-none cursor-pointer">
                        <option value="" disabled>Select a category...</option>
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                      {errors.category && <p className="mt-2 text-xs text-rose-500 font-bold">{errors.category}</p>}
                    </div>
                    <FormField label="Website (Optional)" name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="Specific Schedule (Weekly/Monthly)" name="schedule" value={formData.schedule} onChange={handleChange} placeholder="e.g. Every 2nd Tuesday at 5pm..." />
                    <div className="flex flex-col justify-center">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <div className="relative">
                          <input
                            type="checkbox"
                            className="sr-only p-4"
                            checked={formData.auto_assign_tags}
                            onChange={(e) => setFormData(prev => ({ ...prev, auto_assign_tags: e.target.checked }))}
                          />
                          <div className={`w-12 h-6 rounded-full transition-colors ${formData.auto_assign_tags ? 'bg-blue-600' : 'bg-slate-200'}`} />
                          <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.auto_assign_tags ? 'translate-x-6' : ''}`} />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-800 uppercase tracking-tight">Auto-assign Smart Tags</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase">AI will suggest tags based on your description</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Image Drag/Drop */}
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-slate-800 uppercase tracking-widest">Resource Image</label>
                    <div
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => document.getElementById('fileInput')?.click()}
                      className={`relative border-2 border-dashed rounded-[2rem] p-10 transition-all cursor-pointer flex flex-col items-center justify-center gap-4 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'
                        } ${formData.image_url ? 'bg-slate-900 border-none' : ''}`}
                    >
                      <input id="fileInput" type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }} />

                      {formData.image_url ? (
                        <>
                          <img src={formData.image_url} className="absolute inset-0 w-full h-full object-cover opacity-60 rounded-[2rem]" alt="Preview" />
                          <div className="relative z-10 text-white flex flex-col items-center gap-2">
                            <Upload className="w-10 h-10" />
                            <p className="font-black uppercase tracking-widest text-xs">Click or drag to change image</p>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                            <Upload className="w-8 h-8" />
                          </div>
                          <div className="text-center">
                            <p className="font-black text-slate-900 uppercase tracking-tight text-lg">Drop your image here</p>
                            <p className="text-slate-500 font-bold text-sm">or click to browse local files</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="flex justify-end">
                <GlassButton variant="primary" onClick={nextStep} className="px-12 h-16 rounded-2xl shadow-xl shadow-blue-500/20 group">
                  Next: Contact Info <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </GlassButton>
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
              <GlassCard className="bg-white border-slate-100 shadow-xl overflow-hidden p-0">
                <div className="bg-indigo-700 p-6 flex items-center gap-4 text-white">
                  <UserIcon className="w-6 h-6" />
                  <p className="font-black uppercase tracking-widest text-sm">Step 2: Your & Location Details</p>
                </div>
                <div className="p-8 space-y-10">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="Your Name / Org Contact" name="contact_name" value={formData.contact_name} onChange={handleChange} required placeholder="Full name..." />
                    <FormField label="Contact Email" name="contact_email" type="email" value={formData.contact_email} onChange={handleChange} required placeholder="For verification updates..." />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <FormField label="Phone Number" name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" />
                    <FormField label="Target Audience" name="audience" value={formData.audience} onChange={handleChange} placeholder="e.g. Seniors, Families, Veterans..." />
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-blue-600" /> Physical Address
                      </h4>
                      <button onClick={handleGetLocation} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors flex items-center gap-2">
                        {locating ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
                        Use My Current Lat/Long
                      </button>
                    </div>
                    <FormField label="Street Address" name="address" value={formData.address} onChange={handleChange} placeholder="123 Community St." />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <FormField label="City" name="city" value={formData.city} onChange={handleChange} />
                      <FormField label="State" name="state" value={formData.state} onChange={handleChange} />
                      <FormField label="ZIP" name="zip" value={formData.zip} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-6 pt-6 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <h4 className="font-black text-slate-900 uppercase tracking-widest text-sm flex items-center gap-2">
                        <Compass className="w-4 h-4 text-indigo-600" /> Additional Action Buttons
                      </h4>
                      <div className="text-[10px] font-black uppercase text-slate-400">Max 2 custom actions</div>
                    </div>

                    <div className="space-y-4">
                      {formData.action_urls.map((action, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 relative group">
                          <div className="flex-1">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Action Type</label>
                            <select
                              value={action.label}
                              onChange={(e) => {
                                const next = [...formData.action_urls];
                                next[idx].label = e.target.value;
                                setFormData(prev => ({ ...prev, action_urls: next }));
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none"
                            >
                              {["Register", "Learn More", "Visit Website", "Donate", "Volunteer"].map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                          </div>
                          <div className="flex-[2]">
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Destination URL</label>
                            <input
                              type="url"
                              placeholder="https://..."
                              value={action.url}
                              onChange={(e) => {
                                const next = [...formData.action_urls];
                                next[idx].url = e.target.value;
                                setFormData(prev => ({ ...prev, action_urls: next }));
                              }}
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold outline-none"
                            />
                          </div>
                          <button
                            onClick={() => setFormData(prev => ({ ...prev, action_urls: prev.action_urls.filter((_, i) => i !== idx) }))}
                            className="bg-white border border-slate-200 p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors self-end"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}

                      {formData.action_urls.length < 2 && (
                        <button
                          onClick={() => setFormData(prev => ({ ...prev, action_urls: [...prev.action_urls, { label: 'Learn More', url: '' }] }))}
                          className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-black uppercase tracking-widest text-xs hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2"
                        >
                          <Sparkles className="w-4 h-4" /> Add Action Button
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>

              <div className="flex justify-between">
                <button onClick={prevStep} className="px-8 font-black uppercase text-sm text-slate-500 hover:text-slate-900 flex items-center gap-2">
                  <ChevronLeft className="w-4 h-4" /> Back
                </button>
                <GlassButton variant="primary" onClick={nextStep} className="px-12 h-16 rounded-2xl shadow-xl shadow-blue-500/20 group">
                  Final Review <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </GlassButton>
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
                  <p className="font-black uppercase tracking-widest text-xs text-slate-400 ml-2">How it will look</p>
                  <GlassCard className="p-0 overflow-hidden shadow-2xl border-none">
                    <div className="h-48 bg-slate-900 relative">
                      {formData.image_url ? (
                        <img src={formData.image_url} className="w-full h-full object-cover opacity-80" alt="Preview" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><ImageIcon className="w-16 h-16 text-slate-700" /></div>
                      )}
                      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-blue-600 uppercase tracking-widest">
                        {formData.category || 'Category'}
                      </div>
                    </div>
                    <div className="p-6 space-y-3">
                      <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight line-clamp-1">{formData.title || 'Untitled Resource'}</h3>
                      <p className="text-sm text-slate-600 font-bold line-clamp-3 leading-relaxed">{formData.description || 'No description provided yet...'}</p>
                      <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100 text-[10px] font-black text-slate-400 uppercase">
                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg"><MapPin className="w-3.5 h-3.5 text-blue-600" /> {formData.city || 'Remote'}</div>
                        <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 rounded-lg"><UserIcon className="w-3.5 h-3.5 text-blue-600" /> {formData.audience || 'Everyone'}</div>
                      </div>
                    </div>
                  </GlassCard>
                </div>

                {/* Final Verification Details */}
                <div className="space-y-6">
                  <GlassCard className="bg-slate-50 border-slate-200">
                    <h4 className="font-black text-slate-900 uppercase tracking-tight mb-4 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" /> Submission Policy
                    </h4>
                    <ul className="space-y-4">
                      {[
                        "Verified for accuracy by our community lead.",
                        "AI analysis for quality and helpfulness check.",
                        "Instantly live after passing automated review."
                      ].map((text, i) => (
                        <li key={i} className="flex gap-3 text-sm font-bold text-slate-600">
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                          {text}
                        </li>
                      ))}
                    </ul>
                  </GlassCard>

                  {errors.general && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-5 rounded-2xl text-sm font-bold flex gap-4 cursor-pointer transition-all border ${errors.general.includes('AI Quality Check Failed')
                        ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100 shadow-lg shadow-rose-500/10'
                        : 'bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      onClick={() => {
                        if (errors.general.includes('AI Quality Check Failed')) {
                          alert(`🤖 DETAILED AI AUDIT REPORT:\n\n${errors.general.replace('AI Quality Check Failed: ', '')}\n\nTip: Make sure your description is professional and doesn't contain placeholders like [Link Here] or [Phone].`);
                        }
                      }}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${errors.general.includes('AI Quality Check Failed') ? 'bg-rose-200 text-rose-600' : 'bg-slate-200 text-slate-500'
                        }`}>
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="uppercase tracking-widest text-[10px] mb-1 opacity-60">Verification Report</p>
                        <p className="leading-relaxed">{errors.general}</p>
                        {errors.general.includes('AI Quality Check Failed') && (
                          <p className="mt-2 text-rose-600 text-[10px] uppercase font-black flex items-center gap-1">
                            Click to see full reasoning <ChevronRight className="w-3 h-3" />
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <GlassButton
                      variant="primary"
                      onClick={handleSubmit}
                      disabled={submitting || validating}
                      className="w-full h-20 text-xl rounded-2xl shadow-2xl shadow-blue-600/30 font-black uppercase tracking-widest relative overflow-hidden"
                    >
                      {validating ? (
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-3">
                            <Loader2 className="w-6 h-6 animate-spin" />
                            <span>AI Reviewing...</span>
                          </div>
                          <span className="text-[10px] mt-1 opacity-60">🤖 Processing quality check</span>
                        </div>
                      ) : submitting ? (
                        <div className="flex items-center gap-3">
                          <Loader2 className="w-6 h-6 animate-spin" />
                          <span>Finalizing...</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-6 h-6" />
                          Submit for Review
                        </div>
                      )}
                    </GlassButton>
                    <button onClick={prevStep} className="w-full py-4 text-xs font-black uppercase text-slate-400 hover:text-slate-600 transition-colors">
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
