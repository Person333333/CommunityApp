import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Compass, Mail, Phone, MapPin } from 'lucide-react';

import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="relative mt-20 border-t border-white/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-4"
          >
            <Link to="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ rotate: 180 }}
                transition={{ duration: 0.5 }}
              >
                <Compass className="w-8 h-8 text-teal-400" />
              </motion.div>
              <span className="text-xl font-bold gradient-text">{t('app.name')}</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </motion.div>

          {/* Our Vision */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-100">{t('about.vision')}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {t('footer.visionText')}
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-100">{t('about.quickLinks')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/discover" className="text-slate-400 hover:text-teal-300 transition-colors text-sm">
                  {t('nav.discover')}
                </Link>
              </li>
              <li>
                <Link to="/map" className="text-slate-400 hover:text-teal-300 transition-colors text-sm">
                  {t('map.view')}
                </Link>
              </li>
              <li>
                <Link to="/submit" className="text-slate-400 hover:text-teal-300 transition-colors text-sm">
                  {t('nav.addResource')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-slate-400 hover:text-teal-300 transition-colors text-sm">
                  {t('nav.about')}
                </Link>
              </li>
              <li>
                <Link to="/references" className="text-slate-400 hover:text-teal-300 transition-colors text-sm">
                  {t('nav.references')}
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Connect With Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-lg font-semibold text-slate-100">{t('about.connectWithUs')}</h3>
            <div className="space-y-3">
              <a
                href="mailto:hello@communitycompass.org"
                className="flex items-center gap-3 text-slate-400 hover:text-teal-300 transition-colors text-sm group"
              >
                <Mail className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>hello@communitycompass.org</span>
              </a>
              <a
                href="tel:+11234567890"
                className="flex items-center gap-3 text-slate-400 hover:text-teal-300 transition-colors text-sm group"
              >
                <Phone className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                <span>+1 (123) 456-7890</span>
              </a>
              <div className="flex items-start gap-3 text-slate-400 text-sm">
                <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span>123 Community Street<br />City, State 12345</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-slate-400 text-sm">
            {t('footer.rights', { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6 text-sm text-slate-400">
            <Link to="/about" className="hover:text-teal-300 transition-colors">
              {t('footer.privacy')}
            </Link>
            <Link to="/about" className="hover:text-teal-300 transition-colors">
              {t('footer.terms')}
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}

