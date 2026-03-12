import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Globe, Clock, Mail, Users, Tag, AlertTriangle, CheckCircle2, Compass, Calendar, ExternalLink, Star } from 'lucide-react';
import { ResourceType } from '@/shared/types';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import { useTranslation } from 'react-i18next';
import { Heart } from 'lucide-react';

interface ResourceDetailModalProps {
  resource: ResourceType | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResourceDetailModal({ resource, isOpen, onClose }: ResourceDetailModalProps) {
  const { t } = useTranslation();
  const [reportState, setReportState] = useState<'idle' | 'reporting' | 'success'>('idle');
  const [userRating, setUserRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [ratingSubmitted, setRatingSubmitted] = useState<boolean>(false);

  // Donation States
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorZip, setDonorZip] = useState('');
  const [processingDonation, setProcessingDonation] = useState(false);
  const [hasSavedProfile, setHasSavedProfile] = useState(false);

  // Reset report state when modal opens/closes or resource changes
  useEffect(() => {
    setReportState('idle');
    setShowDonationForm(false);
    setRatingSubmitted(false);
    setUserRating(0);
    if (resource) {
      const saved = localStorage.getItem(`rating_${resource.id}`);
      if (saved) { setUserRating(Number(saved)); setRatingSubmitted(true); }
    }

    // Check for saved donor profile
    const savedProfile = localStorage.getItem('community_donor_profile');
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setDonorName(profile.name || '');
        setDonorEmail(profile.email || '');
        setDonorZip(profile.zip || '');
        setHasSavedProfile(true);
      } catch (e) {
        console.error("Failed to parse saved donor profile");
      }
    }
  }, [isOpen, resource]);

  const handleDonateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingDonation(true);

    // Save profile for future
    localStorage.setItem('community_donor_profile', JSON.stringify({
      name: donorName,
      email: donorEmail,
      zip: donorZip
    }));
    setHasSavedProfile(true);

    // Simulate redirect to agency
    setTimeout(() => {
      setProcessingDonation(false);
      alert(`Redirecting ${donorName} seamlessly to ${resource?.title}'s secure donation page...`);
      setShowDonationForm(false);
    }, 1500);
  };

  if (!resource) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto" onClick={(e) => e.stopPropagation()}>
              <GlassCard variant="strong" className="p-0 overflow-hidden">
                {/* Header */}
                <div className="relative">
                  {resource.image_url && (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={resource.image_url}
                        alt={resource.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                  )}

                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md p-2.5 rounded-full hover:bg-slate-900 transition-all z-50 shadow-xl border border-white/20"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>

                  <div className={`p-6 ${resource.image_url ? 'absolute bottom-0 left-0 right-0' : ''}`}>
                    <div className="flex items-start gap-3 mb-2">
                      <span className="inline-block text-xs font-semibold text-amber-400 uppercase tracking-wide px-3 py-1 glass-ochre rounded-full">
                        {resource.category}
                      </span>
                      {resource.is_featured && (
                        <span className="inline-block text-xs font-semibold text-amber-300 uppercase tracking-wide px-3 py-1 bg-amber-500/20 rounded-full">
                          {t('resource.featured')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-2">
                      {resource.title}
                    </h2>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Action Buttons Section - Dynamic from Resource */}
                  {resource.action_urls && resource.action_urls.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-2">
                      {resource.action_urls.map((action, idx) => (
                        <motion.a
                          key={idx}
                          href={action.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-center justify-center gap-3 px-6 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all shadow-lg ${action.label === 'Donate' ? 'bg-rose-500 text-white shadow-rose-500/20 hover:bg-rose-600' :
                            action.label === 'Volunteer' ? 'bg-indigo-600 text-white shadow-indigo-600/20 hover:bg-indigo-700' :
                              'bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700'
                            }`}
                        >
                          {action.label === 'Donate' ? <Heart className="w-5 h-5" /> :
                            action.label === 'Volunteer' ? <Users className="w-5 h-5" /> :
                              <ExternalLink className="w-5 h-5" />}
                          {action.label}
                        </motion.a>
                      ))}
                    </div>
                  )}
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-black text-indigo-950 mb-2 uppercase tracking-tight">{t('resource.description')}</h3>
                    <p className="text-slate-900 leading-relaxed font-bold opacity-90">
                      {resource.description}
                    </p>
                  </div>

                  {/* Star Rating */}
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest text-slate-700">Community Rating</p>
                        {resource.review_count != null && (
                          <p className="text-[11px] text-slate-400 font-bold mt-0.5">{resource.review_count} reviews</p>
                        )}
                      </div>
                      {/* Show aggregate */}
                      {resource.rating != null && (
                        <div className="flex items-center gap-1.5">
                          <span className="text-2xl font-black text-slate-800">{resource.rating.toFixed(1)}</span>
                          <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                        </div>
                      )}
                    </div>
                    {/* Display aggregate stars */}
                    {resource.rating != null && (
                      <div className="flex gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star key={s} className={`w-5 h-5 ${s <= Math.round(resource.rating!) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 fill-slate-200'}`} />
                        ))}
                      </div>
                    )}
                    {/* User rating */}
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                      {ratingSubmitted ? 'Your Rating' : 'Rate This Resource'}
                    </p>
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          disabled={ratingSubmitted}
                          onClick={() => { if (!ratingSubmitted) { setUserRating(s); setRatingSubmitted(true); localStorage.setItem(`rating_${resource.id}`, String(s)); } }}
                          onMouseEnter={() => !ratingSubmitted && setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-transform hover:scale-125 disabled:cursor-default"
                        >
                          <Star className={`w-7 h-7 transition-colors ${s <= (hoverRating || userRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300 fill-slate-100'}`} />
                        </button>
                      ))}
                      {ratingSubmitted && <span className="ml-2 text-xs font-black text-emerald-600 uppercase tracking-widest self-center">✓ Saved</span>}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resource.address && (
                      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                        <MapPin className="w-6 h-6 text-blue-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">{t('resource.address')}</p>
                          <p className="text-slate-950 font-black text-lg leading-tight">
                            {resource.address}
                            {resource.city && <span className="block text-sm opacity-80">{resource.city}, {resource.state} {resource.zip}</span>}
                          </p>
                        </div>
                      </div>
                    )}

                    {resource.phone && (
                      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                        <Phone className="w-6 h-6 text-indigo-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">{t('resource.phone')}</p>
                          <a
                            href={`tel:${resource.phone}`}
                            className="text-indigo-950 font-black text-xl hover:text-blue-700 transition-colors"
                          >
                            {resource.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {resource.email && (
                      <div className="flex items-start gap-3 bg-slate-100 border border-slate-200 p-4 rounded-2xl">
                        <Mail className="w-6 h-6 text-slate-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest mb-1">{t('resource.email')}</p>
                          <a
                            href={`mailto:${resource.email}`}
                            className="text-slate-950 font-black hover:text-blue-700 transition-colors break-all"
                          >
                            {resource.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {resource.website && (
                      <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 p-4 rounded-2xl">
                        <Globe className="w-6 h-6 text-blue-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black text-blue-900 uppercase tracking-widest mb-1">{t('resource.website')}</p>
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-950 font-black hover:text-blue-700 transition-colors break-all underline decoration-blue-200"
                          >
                            {t('resource.visitWebsite')}
                          </a>
                        </div>
                      </div>
                    )}

                    {resource.hours && (
                      <div className="flex items-start gap-3 bg-amber-50 border border-amber-100 p-4 rounded-2xl">
                        <Clock className="w-6 h-6 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black text-amber-900 uppercase tracking-widest mb-1">{t('resource.hours')}</p>
                          <p className="text-amber-950 font-black">{resource.hours}</p>
                        </div>
                      </div>
                    )}
                    {resource.schedule && (
                      <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 p-4 rounded-2xl">
                        <Calendar className="w-6 h-6 text-indigo-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black text-indigo-900 uppercase tracking-widest mb-1">Specific Schedule</p>
                          <p className="text-indigo-950 font-black leading-relaxed">{resource.schedule}</p>
                        </div>
                      </div>
                    )}

                    {resource.audience && (
                      <div className="flex items-start gap-3 bg-rose-50 border border-rose-100 p-4 rounded-2xl">
                        <Users className="w-6 h-6 text-rose-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black text-rose-900 uppercase tracking-widest mb-1">{t('resource.audience')}</p>
                          <p className="text-rose-950 font-black">{resource.audience}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  {resource.services && (
                    <div className="pt-4">
                      <h3 className="text-sm font-black text-indigo-950 mb-3 flex items-center gap-2 uppercase tracking-widest">
                        <Tag className="w-4 h-4 text-indigo-600" />
                        {t('resource.services')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.services.split(',').map((service, i) => (
                          <span
                            key={i}
                            className="text-xs px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-950 font-black"
                          >
                            {service.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {resource.tags && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-teal-400" />
                        {t('resource.tags')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.split(',').map((tag, i) => (
                          <span
                            key={i}
                            className="text-sm px-3 py-1.5 glass-teal rounded-full text-slate-300"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions & Report */}
                  <div className="flex flex-col sm:flex-row flex-wrap sm:items-center justify-between gap-4 pt-4 border-t border-white/10">
                    <div className="flex flex-wrap gap-3">
                      {resource.website && (
                        <a
                          href={resource.website}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <GlassButton variant="primary">
                            <Globe className="w-4 h-4 mr-2" />
                            {t('resource.visitWebsite')}
                          </GlassButton>
                        </a>
                      )}
                      {resource.phone && (
                        <a href={`tel:${resource.phone}`}>
                          <GlassButton variant="secondary">
                            <Phone className="w-4 h-4 mr-2" />
                            {t('resource.callNow')}
                          </GlassButton>
                        </a>
                      )}
                      {resource.email && (
                        <a href={`mailto:${resource.email}`}>
                          <GlassButton variant="secondary">
                            <Mail className="w-4 h-4 mr-2" />
                            {t('resource.sendEmail')}
                          </GlassButton>
                        </a>
                      )}

                      <button
                        onClick={() => setShowDonationForm(true)}
                        className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl shadow-rose-500/30 flex items-center transition-colors uppercase tracking-widest text-sm"
                      >
                        <Heart className="w-4 h-4 mr-2" />
                        Donate Now
                      </button>
                    </div>

                    <div className="text-right">
                      {reportState === 'idle' ? (
                        <button
                          onClick={() => {
                            setReportState('reporting');
                            setTimeout(() => setReportState('success'), 800);
                          }}
                          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-rose-600 transition-colors uppercase tracking-widest mt-2 sm:mt-0"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Report Issue
                        </button>
                      ) : reportState === 'reporting' ? (
                        <span className="flex items-center justify-end gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-widest mt-2 sm:mt-0">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                            <Compass className="w-3.5 h-3.5" />
                          </motion.div>
                          Submitting...
                        </span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-end gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-widest mt-2 sm:mt-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Reported to Mods
                        </motion.span>
                      )}
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>

          {/* Donation Form Modal overlay inside the main Modal context */}
          <AnimatePresence>
            {showDonationForm && (
              <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowDonationForm(false)}
                  className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md relative z-[61] overflow-hidden border border-rose-100"
                >
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Support {resource.title}</h3>
                      <button onClick={() => setShowDonationForm(false)} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {hasSavedProfile && (
                      <div className="bg-emerald-50 border border-emerald-100 p-3 rounded-xl flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle2 className="w-4 h-4" />
                        Using your saved Donor Profile
                      </div>
                    )}

                    <form onSubmit={handleDonateSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                          placeholder="Jane Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Email Address</label>
                        <input
                          type="email"
                          required
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                          placeholder="jane@example.com"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-1">ZIP Code</label>
                        <input
                          type="text"
                          required
                          value={donorZip}
                          onChange={(e) => setDonorZip(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-bold outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                          placeholder="98000"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={processingDonation}
                        className="w-full mt-4 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-400 text-white font-black py-4 rounded-xl uppercase tracking-widest transition-colors flex justify-center items-center gap-2"
                      >
                        {processingDonation ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                              <Compass className="w-5 h-5" />
                            </motion.div>
                            Connecting...
                          </>
                        ) : (
                          "Proceed to Agency"
                        )}
                      </button>
                      <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        Your basic info will be passed securely to the agency to speed up your donation.
                      </p>
                    </form>
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
