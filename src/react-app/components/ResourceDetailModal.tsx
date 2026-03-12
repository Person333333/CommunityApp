import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Globe, Clock, Mail, Users, Tag, AlertTriangle, CheckCircle2, Compass, Calendar, ExternalLink, Share2, Printer, QrCode, ThumbsUp, ThumbsDown, Download } from 'lucide-react';
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
  const [shareToast, setShareToast] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(() => {
    if (!resource) return null;
    const saved = localStorage.getItem(`resource-feedback-${resource.id}`);
    return saved as 'up' | 'down' | null;
  });

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
    setShowQR(false);
    setShareToast(false);
    if (resource) {
      const saved = localStorage.getItem(`resource-feedback-${resource.id}`);
      setFeedback(saved as 'up' | 'down' | null);
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

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/discover?resource=${resource.id}`;
    const shareData = { title: resource.title, text: `Check out ${resource.title} on Community Compass`, url: shareUrl };
    try {
      if (navigator.share) { await navigator.share(shareData); }
      else { await navigator.clipboard.writeText(shareUrl); setShareToast(true); setTimeout(() => setShareToast(false), 2000); }
    } catch (e) {
      await navigator.clipboard.writeText(shareUrl);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2000);
    }
  };

  const handlePrint = () => window.print();

  const handleFeedback = (type: 'up' | 'down') => {
    const newVal = feedback === type ? null : type;
    setFeedback(newVal);
    if (newVal) localStorage.setItem(`resource-feedback-${resource.id}`, newVal);
    else localStorage.removeItem(`resource-feedback-${resource.id}`);
    // Update aggregate counts
    const key = `resource-feedback-agg-${resource.id}`;
    const agg = JSON.parse(localStorage.getItem(key) || '{"up":0,"down":0}');
    if (newVal === 'up') agg.up++;
    else if (newVal === 'down') agg.down++;
    localStorage.setItem(key, JSON.stringify(agg));
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${window.location.origin}/discover?resource=${resource.id}`)}`;

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
                    className="absolute top-4 right-4 glass-strong p-2 rounded-full hover:glass-strong transition-all z-10"
                  >
                    <X className="w-6 h-6 text-slate-100" />
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

                    {/* Utility Actions: Share / Print / QR */}
                    <div className="flex flex-wrap gap-2 relative">
                      <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                        <Share2 className="w-3.5 h-3.5" /> Share
                      </button>
                      <button onClick={handlePrint} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                        <Printer className="w-3.5 h-3.5" /> Print
                      </button>
                      <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest bg-slate-50 border border-slate-200 px-3 py-2 rounded-lg">
                        <QrCode className="w-3.5 h-3.5" /> QR Code
                      </button>
                      {shareToast && (
                        <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-8 left-0 bg-emerald-600 text-white text-xs px-3 py-1 rounded-full font-bold">
                          Link copied!
                        </motion.span>
                      )}
                    </div>

                    {/* QR Code Display */}
                    {showQR && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl">
                        <img src={qrUrl} alt="QR Code" className="w-48 h-48 rounded-lg" />
                        <p className="text-xs text-slate-500 font-medium text-center">Scan to view this resource on any device</p>
                        <a href={qrUrl} download={`${resource.title}-qr.png`} className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
                          <Download className="w-3.5 h-3.5" /> Download QR Code
                        </a>
                      </motion.div>
                    )}

                    {/* Was This Helpful? */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-xl">
                      <span className="text-sm font-semibold text-slate-700">Was this resource helpful?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleFeedback('up')}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            feedback === 'up' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-emerald-50'
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" /> Yes
                        </button>
                        <button
                          onClick={() => handleFeedback('down')}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            feedback === 'down' ? 'bg-rose-100 text-rose-700 border border-rose-200' : 'bg-white text-slate-500 border border-slate-200 hover:bg-rose-50'
                          }`}
                        >
                          <ThumbsDown className="w-4 h-4" /> No
                        </button>
                      </div>
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
