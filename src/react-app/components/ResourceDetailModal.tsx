import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Globe, Clock, Mail, Users, Tag, AlertTriangle, CheckCircle2, Compass, Calendar, ExternalLink, Star, Share2, Printer, QrCode, ThumbsUp, ThumbsDown, Download, Volume2, VolumeX } from 'lucide-react';
import { ResourceType } from '@/shared/types';
import { Card } from '@/react-app/components/ui/card';
import { Button } from '@/react-app/components/ui/button';
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
  const [shareToast, setShareToast] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
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
    setRatingSubmitted(false);
    setUserRating(0);
    setShowQR(false);
    setShareToast(false);
    window.speechSynthesis.cancel();
    setIsSpeaking(false);

    if (resource) {
      const savedRating = localStorage.getItem(`rating_${resource.id}`);
      if (savedRating) { setUserRating(Number(savedRating)); setRatingSubmitted(true); }

      const savedFeedback = localStorage.getItem(`resource-feedback-${resource.id}`);
      setFeedback(savedFeedback as 'up' | 'down' | null);
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
      alert(t('resource.donation.redirectAlert', 'Redirecting {{name}} seamlessly to {{title}}\'s secure donation page...', { name: donorName, title: resource?.title }));
      setShowDonationForm(false);
    }, 1500);
  };

  if (!resource) return null;

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/discover?resource=${resource.id}`;
    const shareData = { title: resource.title, text: t('resource.shareText', 'Check out {{title}} on Community Compass', { title: resource.title }), url: shareUrl };
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

  const handleReadAloud = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const parts = [
      resource.title,
      resource.description || '',
      resource.address ? t('resource.audio.locatedAt', 'Located at {{address}}', { address: resource.address }) : '',
      resource.hours ? t('resource.audio.openAt', 'Open {{hours}}', { hours: resource.hours }) : '',
    ].filter(Boolean);
    const utterance = new SpeechSynthesisUtterance(parts.join('. '));
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

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
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <Card className="p-0 overflow-hidden bg-black/60 backdrop-blur-2xl border border-white/10 rounded-none relative">
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
                    className="absolute top-4 right-4 bg-black/40 backdrop-blur-md p-2.5 rounded-none hover:bg-emerald-500 hover:text-black transition-all z-50 shadow-xl border border-white/10 group"
                    aria-label="Close modal"
                  >
                    <X className="w-6 h-6 text-white group-hover:rotate-90 transition-transform" />
                  </button>

                  <div className={`p-8 ${resource.image_url ? 'absolute bottom-0 left-0 right-0' : ''}`}>
                    <div className="flex items-start gap-3 mb-4">
                      <span className="inline-block text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] px-3 py-1 bg-emerald-500/10 backdrop-blur rounded-none border border-emerald-500/20">
                        {resource.category}
                      </span>
                      {resource.is_featured && (
                        <span className="inline-block text-[10px] font-black text-cyan-400 uppercase tracking-[0.2em] px-3 py-1 bg-cyan-500/10 rounded-none border border-cyan-500/20">
                          {t('resource.featured')}
                        </span>
                      )}
                    </div>
                    <h2 className="text-4xl sm:text-6xl font-black text-white mb-2 uppercase tracking-tighter drop-shadow-2xl">
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
                          className={`flex items-center justify-center gap-3 px-6 py-4 rounded-none font-black uppercase tracking-widest text-xs transition-all shadow-xl backdrop-blur-xl border ${action.label === 'Donate' ? 'bg-emerald-500 border-emerald-600 text-black shadow-emerald-500/20 hover:bg-emerald-400' :
                            action.label === 'Volunteer' ? 'bg-cyan-500 border-cyan-600 text-black shadow-cyan-500/20 hover:bg-cyan-400' :
                              'bg-white/5 border-white/10 text-white hover:bg-white/10'
                            }`}
                        >
                          {action.label === 'Donate' ? <Heart className="w-5 h-5 fill-black" /> :
                            action.label === 'Volunteer' ? <Users className="w-5 h-5 fill-black" /> :
                              <ExternalLink className="w-5 h-5" />}
                          {action.label}
                        </motion.a>
                      ))}
                    </div>
                  )}
                  {/* Description */}
                  <div>
                    <h3 className="text-[10px] font-black text-emerald-500 mb-2 uppercase tracking-[0.2em]">{t('resource.description')}</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">
                      {resource.description}
                    </p>
                  </div>

                  {/* Star Rating */}
                  <div className="bg-black/40 border border-white/10 rounded-none p-6 backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('resource.rating.communityTitle', 'Community Rating')}</p>
                        {resource.review_count != null && (
                          <p className="text-[10px] text-slate-600 font-black uppercase mt-0.5">{resource.review_count} {t('discover.reviews', 'reviews')}</p>
                        )}
                      </div>
                      {/* Show aggregate */}
                      {resource.rating != null && (
                        <div className="flex items-center gap-2">
                           <span className="text-3xl font-black text-white leading-none">{resource.rating.toFixed(1)}</span>
                          <Star className="w-6 h-6 fill-emerald-500 text-emerald-500" />
                        </div>
                      )}
                    </div>
                    {/* User rating */}
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-3">
                      {ratingSubmitted ? t('resource.rating.yourRating', 'Your Rating') : t('resource.rating.ratePrompt', 'Rate This Resource')}
                    </p>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(s => (
                        <button
                          key={s}
                          disabled={ratingSubmitted}
                          onClick={() => { if (!ratingSubmitted) { setUserRating(s); setRatingSubmitted(true); localStorage.setItem(`rating_${resource.id}`, String(s)); } }}
                          onMouseEnter={() => !ratingSubmitted && setHoverRating(s)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="transition-all hover:scale-110 disabled:cursor-default"
                        >
                          <Star className={`w-8 h-8 transition-colors ${s <= (hoverRating || userRating) ? 'fill-emerald-500 text-emerald-500' : 'text-slate-700 fill-slate-800'}`} />
                        </button>
                      ))}
                      {ratingSubmitted && <span className="ml-4 text-[10px] font-black text-emerald-400 uppercase tracking-widest self-center border border-emerald-500/20 px-2 py-1 bg-emerald-500/5">✓ {t('resource.rating.verified', 'Network Verified')}</span>}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resource.address && (
                      <div className="flex flex-col gap-4 bg-black/40 border border-white/10 p-6 rounded-none backdrop-blur-xl overflow-hidden relative group/map">
                        <div className="absolute inset-0 bg-emerald-500/5 opacity-0 group-hover/map:opacity-100 transition-opacity" />
                        <div className="flex items-start gap-4 relative z-10">
                          <MapPin className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                          <div>
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">{t('resource.address')}</p>
                            <p className="text-white font-black text-xl leading-tight uppercase tracking-tighter">
                              {resource.address}
                              {resource.city && <span className="block text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{resource.city}, {resource.state} {resource.zip}</span>}
                            </p>
                          </div>
                        </div>

                      </div>
                    )}
                    {resource.phone && (
                      <div className="flex items-start gap-4 bg-black/40 border border-white/10 p-6 rounded-none backdrop-blur-xl">
                        <Phone className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">{t('resource.phone')}</p>
                          <a
                            href={`tel:${resource.phone}`}
                            className="text-white font-black text-2xl hover:text-emerald-400 transition-colors uppercase tracking-tighter"
                          >
                            {resource.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {resource.email && (
                      <div className="flex items-start gap-4 bg-black/40 border border-white/10 p-6 rounded-none backdrop-blur-xl">
                        <Mail className="w-6 h-6 text-slate-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">{t('resource.email')}</p>
                          <a
                            href={`mailto:${resource.email}`}
                            className="text-white font-black hover:text-emerald-400 transition-colors break-all text-sm uppercase tracking-tight"
                          >
                            {resource.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {resource.website && (
                      <div className="flex items-start gap-4 bg-black/40 border border-white/10 p-6 rounded-none backdrop-blur-xl">
                        <Globe className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-1">{t('resource.website')}</p>
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white font-black hover:text-cyan-400 transition-colors break-all underline decoration-white/10 uppercase tracking-widest text-[10px]"
                          >
                            {t('resource.visitWebsite')}
                          </a>
                        </div>
                      </div>
                    )}

                    {resource.hours && (
                      <div className="flex items-start gap-4 bg-black/40 border border-white/10 p-6 rounded-none backdrop-blur-xl">
                        <Clock className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">{t('resource.hours')}</p>
                          <p className="text-white font-black uppercase tracking-tighter text-lg">{resource.hours}</p>
                        </div>
                      </div>
                    )}
                    {resource.schedule && (
                      <div className="flex items-start gap-4 bg-black/40 border border-white/10 p-6 rounded-none backdrop-blur-xl">
                        <Calendar className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <p className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.2em] mb-1">{t('resource.specificSchedule', 'Specific Schedule')}</p>
                          <p className="text-white font-black leading-relaxed uppercase tracking-tighter text-sm">{resource.schedule}</p>
                        </div>
                      </div>
                    )}

                    {resource.audience && (
                      <div className="flex items-start gap-4 bg-black/40 border border-white/10 p-6 rounded-none backdrop-blur-xl">
                        <Users className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                        <div>
                          <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">{t('resource.audience')}</p>
                          <p className="text-white font-black uppercase tracking-tighter">{resource.audience}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  {resource.services && (
                    <div className="pt-4">
                      <h3 className="text-[10px] font-black text-emerald-500 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                        <Tag className="w-4 h-4 text-emerald-500" />
                        {t('resource.services')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.services.split(',').map((service, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-4 py-2 bg-emerald-500/5 border border-emerald-500/20 rounded-none text-emerald-400 font-black uppercase tracking-widest backdrop-blur-sm"
                          >
                            {service.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {resource.tags && (
                    <div className="pt-4">
                      <h3 className="text-[10px] font-black text-slate-500 mb-4 flex items-center gap-2 uppercase tracking-[0.2em]">
                        <Tag className="w-4 h-4 text-slate-500" />
                        {t('resource.tags')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.tags.split(',').map((tag, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-3 py-1.5 bg-white/5 border border-white/10 rounded-none text-slate-400 font-black uppercase tracking-widest"
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
                          <Button className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest text-xs h-12 px-6 rounded-none shadow-xl shadow-emerald-500/20">
                            <Globe className="w-4 h-4 mr-2" />
                            {t('resource.visitWebsite')}
                          </Button>
                        </a>
                      )}
                      {resource.phone && (
                        <a href={`tel:${resource.phone}`}>
                          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs h-12 px-6 rounded-none transition-all">
                            <Phone className="w-4 h-4 mr-2" />
                            {t('resource.callNow')}
                          </Button>
                        </a>
                      )}
                      {resource.email && (
                        <a href={`mailto:${resource.email}`}>
                          <Button variant="outline" className="border-white/10 bg-white/5 hover:bg-white/10 text-white font-black uppercase tracking-widest text-xs h-12 px-6 rounded-none transition-all">
                            <Mail className="w-4 h-4 mr-2" />
                            {t('resource.sendEmail')}
                          </Button>
                        </a>
                      )}

                      <Button
                        onClick={() => setShowDonationForm(true)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-none shadow-xl shadow-cyan-500/20 flex items-center transition-all uppercase tracking-widest text-xs h-12 px-6"
                      >
                        <Heart className="w-4 h-4 mr-2 fill-black" />
                        {t('resource.donateNow', 'Donate Now')}
                      </Button>
                    </div>

                    <div className="text-right">
                      {reportState === 'idle' ? (
                        <button
                          onClick={() => {
                            setReportState('reporting');
                            setTimeout(() => setReportState('success'), 800);
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-black text-slate-500 hover:text-emerald-400 transition-colors uppercase tracking-[0.2em] mt-2 sm:mt-0"
                        >
                          <AlertTriangle className="w-3.5 h-3.5" strokeWidth={3} />
                          {t('resource.reportIssue', 'Report Data Issue')}
                        </button>
                      ) : reportState === 'reporting' ? (
                        <span className="flex items-center justify-end gap-1.5 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2 sm:mt-0">
                          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                            <Compass className="w-3.5 h-3.5 text-emerald-500" />
                          </motion.div>
                          {t('resource.auditing', 'Auditing...')}
                        </span>
                      ) : (
                        <motion.span
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex items-center justify-end gap-1.5 text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-2 sm:mt-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {t('resource.reportLogged', 'Report Logged')}
                        </motion.span>
                      )}
                    </div>

                  {/* Utility Actions: Share / Print / QR / Read Aloud */}
                  <div className="flex flex-wrap gap-2 relative mt-8 w-full font-black uppercase tracking-widest">
                    <button onClick={handleShare} className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-emerald-400 transition-colors bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-none backdrop-blur-xl group">
                      <Share2 className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" /> {t('common.share', 'Share')}
                    </button>
                    <button onClick={handlePrint} className="flex items-center gap-1.5 text-[10px] text-slate-500 hover:text-emerald-400 transition-colors bg-white/5 border border-white/10 hover:bg-white/10 px-4 py-2 rounded-none backdrop-blur-xl group">
                      <Printer className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" /> {t('common.print', 'Print')}
                    </button>
                    <button onClick={() => setShowQR(!showQR)} className={`flex items-center gap-1.5 text-[10px] transition-colors border px-4 py-2 rounded-none backdrop-blur-xl group ${showQR ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/50' : 'text-slate-500 hover:text-white bg-white/5 border-white/10'}`}>
                      <QrCode className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" /> {t('resource.qrProtocol', 'QR Protocol')}
                    </button>
                    <button onClick={handleReadAloud} className={`flex items-center gap-1.5 text-[10px] transition-colors border px-4 py-2 rounded-none backdrop-blur-xl group ${isSpeaking ? 'text-cyan-400 bg-cyan-500/10 border-cyan-500/50' : 'text-slate-500 hover:text-white bg-white/5 border-white/10'}`}>
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 animate-pulse" /> : <Volume2 className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />}
                      {isSpeaking ? t('common.terminate', 'Terminate') : t('resource.audioFeed', 'Audio Feed')}
                    </button>
                    {shareToast && (
                      <motion.span initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="absolute -top-10 left-0 bg-emerald-500 text-black text-[10px] px-3 py-1.5 rounded-none font-black uppercase tracking-[0.2em] shadow-2xl">
                        {t('resource.handshakeCopied', 'Handshake Copied')}
                      </motion.span>
                    )}
                  </div>

                    {/* QR Code Display */}
                    {showQR && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="flex flex-col items-center gap-4 p-8 bg-black/40 border border-white/10 rounded-none backdrop-blur-3xl w-full mt-4">
                        <div className="bg-white p-4 rounded-none">
                          <img src={qrUrl} alt="QR Code" className="w-48 h-48 grayscale contrast-125" />
                        </div>
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] text-center">{t('resource.qrScanMessage', 'Scan to interface on external node')}</p>
                        <a href={qrUrl} download={`${resource.title}-qr.png`} className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 hover:text-emerald-400 uppercase tracking-widest border border-emerald-500/20 px-4 py-2 bg-emerald-500/5">
                          <Download className="w-3.5 h-3.5" /> {t('resource.downloadKey', 'Download Key')}
                        </a>
                      </motion.div>
                    )}

                    {/* Was This Helpful? */}
                    <div className="flex items-center justify-between p-6 bg-black/40 border border-white/10 rounded-none w-full mt-4 backdrop-blur-3xl">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('resource.feedback.title', 'Resource effectiveness index?')}</span>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleFeedback('up')}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-none text-[10px] font-black tracking-widest uppercase transition-all border ${feedback === 'up' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-xl shadow-emerald-500/10' : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" /> {t('common.affirmative', 'Affirmative')}
                        </button>
                        <button
                          onClick={() => handleFeedback('down')}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-none text-[10px] font-black tracking-widest uppercase transition-all border ${feedback === 'down' ? 'bg-rose-500/10 text-rose-400 border-rose-500/50 shadow-xl shadow-rose-500/10' : 'bg-white/5 text-slate-500 border-white/10 hover:bg-white/10 hover:text-white'
                            }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" /> {t('common.negative', 'Negative')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
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
                  className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="bg-black border border-white/10 rounded-none shadow-2xl w-full max-w-md relative z-[61] overflow-hidden backdrop-blur-3xl"
                >
                  <div className="p-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-2">
                      <h3 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                        <Heart className="w-5 h-5 text-emerald-500 fill-emerald-500/20" />
                        {t('resource.donation.title', 'Support {{title}}', { title: resource.title })}
                      </h3>
                      <button onClick={() => setShowDonationForm(false)} className="text-slate-500 hover:text-white transition-all group">
                        <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                      </button>
                    </div>

                    {hasSavedProfile && (
                      <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-none flex items-center gap-2 text-emerald-400 font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-500/5">
                        <CheckCircle2 className="w-4 h-4" />
                        {t('resource.donation.profileActive', 'Network Profile Active')}
                      </div>
                    )}

                    <form onSubmit={handleDonateSubmit} className="space-y-6">
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('common.fullName', 'Full Name')}</label>
                        <input
                          type="text"
                          required
                          value={donorName}
                          onChange={(e) => setDonorName(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-white font-black outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700 uppercase text-xs tracking-widest"
                          placeholder={t('common.fullNamePlaceholder', 'Jane Doe')}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('common.emailAddress', 'Email Address')}</label>
                        <input
                          type="email"
                          required
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-white font-black outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700 uppercase text-xs tracking-widest"
                          placeholder={t('common.emailPlaceholder', 'jane@example.com')}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{t('common.zipCode', 'ZIP Code')}</label>
                        <input
                          type="text"
                          required
                          value={donorZip}
                          onChange={(e) => setDonorZip(e.target.value)}
                          className="w-full bg-white/5 border border-white/10 rounded-none px-4 py-4 text-white font-black outline-none focus:border-emerald-500 transition-all placeholder:text-slate-700 uppercase text-xs tracking-widest"
                          placeholder="98000"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={processingDonation}
                        className="w-full mt-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black py-8 rounded-none uppercase tracking-[0.2em] transition-all flex justify-center items-center gap-3 shadow-xl shadow-emerald-500/20"
                      >
                        {processingDonation ? (
                          <>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                              <Compass className="w-5 h-5" />
                            </motion.div>
                            {t('resource.donation.processing', 'Processing...')}
                          </>
                        ) : (
                          t('resource.donation.submitButton', 'Handover to Agency')
                        )}
                      </Button>
                      <p className="text-center text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mt-2 leading-relaxed">
                        {t('resource.donation.protocolMessage', 'Secure industrial handover protocol active. Your identity will be transmitted to the agency portal.')}
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
