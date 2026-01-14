import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Phone, Globe, Clock, Mail, Users, Tag } from 'lucide-react';
import { ResourceType } from '@/shared/types';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import { useTranslation } from 'react-i18next';

interface ResourceDetailModalProps {
  resource: ResourceType | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ResourceDetailModal({ resource, isOpen, onClose }: ResourceDetailModalProps) {
  const { t } = useTranslation();

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
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
                  {/* Description */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-200 mb-2">{t('resource.description')}</h3>
                    <p className="text-slate-300 leading-relaxed">
                      {resource.description}
                    </p>
                  </div>

                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {resource.address && (
                      <div className="flex items-start gap-3 glass-teal p-4 rounded-lg">
                        <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-400 mb-1">{t('resource.address')}</p>
                          <p className="text-slate-100">
                            {resource.address}
                            {resource.city && `, ${resource.city}`}
                            {resource.state && `, ${resource.state}`}
                            {resource.zip && ` ${resource.zip}`}
                          </p>
                        </div>
                      </div>
                    )}

                    {resource.phone && (
                      <div className="flex items-start gap-3 glass-teal p-4 rounded-lg">
                        <Phone className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-400 mb-1">{t('resource.phone')}</p>
                          <a
                            href={`tel:${resource.phone}`}
                            className="text-teal-300 hover:text-teal-200 transition-colors"
                          >
                            {resource.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {resource.email && (
                      <div className="flex items-start gap-3 glass-teal p-4 rounded-lg">
                        <Mail className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-400 mb-1">{t('resource.email')}</p>
                          <a
                            href={`mailto:${resource.email}`}
                            className="text-teal-300 hover:text-teal-200 transition-colors break-all"
                          >
                            {resource.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {resource.website && (
                      <div className="flex items-start gap-3 glass-teal p-4 rounded-lg">
                        <Globe className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-400 mb-1">{t('resource.website')}</p>
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-teal-300 hover:text-teal-200 transition-colors break-all"
                          >
                            {t('resource.visitWebsite')}
                          </a>
                        </div>
                      </div>
                    )}

                    {resource.hours && (
                      <div className="flex items-start gap-3 glass-teal p-4 rounded-lg">
                        <Clock className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-400 mb-1">{t('resource.hours')}</p>
                          <p className="text-slate-100">{resource.hours}</p>
                        </div>
                      </div>
                    )}

                    {resource.audience && (
                      <div className="flex items-start gap-3 glass-teal p-4 rounded-lg">
                        <Users className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm text-slate-400 mb-1">{t('resource.audience')}</p>
                          <p className="text-slate-100">{resource.audience}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Services */}
                  {resource.services && (
                    <div>
                      <h3 className="text-lg font-semibold text-slate-200 mb-3 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-teal-400" />
                        {t('resource.services')}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {resource.services.split(',').map((service, i) => (
                          <span
                            key={i}
                            className="text-sm px-3 py-1.5 glass-ochre rounded-full text-slate-300"
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

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
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
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
