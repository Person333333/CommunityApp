import { motion } from 'framer-motion';
import { Search, MapPin, Heart, ArrowRight, Compass, Quote, Clock, Users, ChevronDown, ChevronLeft, ChevronRight, Send, Mail, Activity } from 'lucide-react';
import { useNavigate } from 'react-router';
import AnimatedCompass from '@/react-app/components/AnimatedCompass';
import GlassButton from '@/react-app/components/GlassButton';
import GlassCard from '@/react-app/components/GlassCard';
import FlipCard from '@/react-app/components/FlipCard';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import LocationRequest from '@/react-app/components/LocationRequest';
import VoiceSearchButton from '@/react-app/components/VoiceSearchButton';
import NeedsWizard from '@/react-app/components/NeedsWizard';
import { useEffect, useState, useMemo, useRef } from 'react';
import { ResourceType } from '@/shared/types';
import { useLocation, calculateDistance } from '@/react-app/hooks/useLocation';
import { unifiedResourceService } from '@/react-app/services/unifiedResourceService';
import { useTranslation } from 'react-i18next';

// Animated count-up hook
function useCountUp(target: number, duration = 2000, startOnView = true) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!startOnView) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting && !hasStarted) setHasStarted(true); },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, startOnView]);

  useEffect(() => {
    if (!hasStarted) return;
    const startTime = performance.now();
    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [hasStarted, target, duration]);

  return { count, ref };
}

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation, setZipCodeLocation } = useLocation();
  const [allFeaturedResources, setAllFeaturedResources] = useState<ResourceType[]>([]);
  const [stats, setStats] = useState({ totalResources: 850, categories: [] as string[] });
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  // Only fetch featured resources when we have user location
  useEffect(() => {
    if (!userLocation) {
      setAllFeaturedResources([]);
      return;
    }
    const fetchData = async () => {
      try {
        const [allData, statsData] = await Promise.all([
          unifiedResourceService.fetchAllResources({ includeUserSubmitted: true }),
          unifiedResourceService.getResourceStats()
        ]);

        let list = (allData as ResourceType[]).filter((r: ResourceType) => r.address || (r.latitude && r.longitude));

        const currentLang = i18n.language;
        if (currentLang !== 'en') {
          const { TranslateService } = await import('@/react-app/services/translateService');
          list = await TranslateService.translateResources(list, currentLang);
        }

        setAllFeaturedResources(list.filter(r => r.is_featured));

        setStats({
          totalResources: (statsData as any).total || 0,
          categories: []
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [userLocation, i18n.language]);

  // Carousel Auto-Play Logic — runs until user manually navigates, then stops for the session
  useEffect(() => {
    if (!autoPlay) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev >= 4 ? 0 : prev + 1));
    }, 3500);
    return () => clearInterval(interval);
  }, [autoPlay]);

  useEffect(() => {
    const translateExisting = async () => {
      if (i18n.language === 'en' || allFeaturedResources.length === 0) return;
      try {
        const { TranslateService } = await import('@/react-app/services/translateService');
        const translated = await TranslateService.translateResources(allFeaturedResources, i18n.language);
        setAllFeaturedResources(translated);
      } catch (e) { console.error(e); }
    };
    translateExisting();
  }, [i18n.language]);

  const LOCAL_RADIUS_KM = 300;
  const featuredResources = useMemo(() => {
    if (!userLocation || allFeaturedResources.length === 0) {
      return [];
    }

    return allFeaturedResources.filter(resource => {
      if (!resource.latitude || !resource.longitude) return false;
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        resource.latitude,
        resource.longitude
      );
      return distance <= LOCAL_RADIUS_KM;
    });
  }, [allFeaturedResources, userLocation]);

  const displaySpotlights = useMemo(() => {
    // Exactly 5 featured resources
    return featuredResources.slice(0, 5);
  }, [featuredResources]);

  if (locationLoading || !userLocation) {
    return (
      <LocationRequest
        onRequestLocation={requestLocation}
        onZipCodeSearch={setZipCodeLocation}
        loading={locationLoading}
        error={locationError}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[70vh] sm:min-h-[85vh] flex items-center justify-center overflow-hidden pt-12 pb-8">
        {/* Animated gradient mesh background */}
        <div className="absolute inset-0 hero-gradient-mesh" />
        <div className="absolute inset-0 dot-grid-pattern" />
        {/* Subtle top gradient */}
        <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-slate-900/10 to-transparent pointer-events-none z-[1]" />
        {/* Floating blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="animate-blob-1 absolute top-[10%] left-[15%] w-72 h-72 rounded-full bg-blue-200/30 blur-3xl" />
          <div className="animate-blob-2 absolute top-[50%] right-[10%] w-96 h-96 rounded-full bg-indigo-200/25 blur-3xl" />
          <div className="animate-blob-3 absolute bottom-[10%] left-[40%] w-80 h-80 rounded-full bg-cyan-200/20 blur-3xl" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-16">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-1 sm:mb-3 transform scale-75 sm:scale-90"
            >
              <AnimatedCompass />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-3 sm:space-y-4"
            >
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight text-slate-900">
                <span className="block mb-1 sm:mb-1">{t('home.hero.title1')}</span>
                <span className="block w-fit mx-auto pb-1 tracking-tight">{t('home.hero.title2')}</span>
              </h1>

              <p className="text-xs sm:text-sm lg:text-base text-slate-600 max-w-xl mx-auto font-medium leading-normal">
                {t('home.hero.subtitle')}
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="max-w-md mx-auto mt-2 sm:mt-4 transform scale-90"
              >
                <div className="bg-white rounded-xl sm:rounded-2xl p-2 flex flex-col sm:flex-row items-center gap-2 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 w-full flex-1 relative group bg-transparent">
                    <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-5 h-5 sm:w-6 sm:h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors pointer-events-none" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('home.hero.searchPlaceholder')}
                      className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-500 pl-10 sm:pl-12 pr-12 w-full font-medium text-sm sm:text-base py-2.5 sm:py-3"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (searchTerm) navigate(`/discover?q=${encodeURIComponent(searchTerm)}`);
                          else navigate('/discover');
                        }
                      }}
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2">
                      <VoiceSearchButton onResult={(text) => { setSearchTerm(text); navigate(`/discover?q=${encodeURIComponent(text)}`); }} className="w-8 h-8 sm:w-10 sm:h-10 border-none shadow-none text-slate-400 hover:text-blue-500" />
                    </div>
                  </div>
                  <GlassButton
                    variant="primary"
                    size="md"
                    className="w-full sm:w-auto"
                    onClick={() => {
                      if (searchTerm) navigate(`/discover?q=${encodeURIComponent(searchTerm)}`);
                      else navigate('/discover');
                    }}
                  >
                    {t('home.hero.explore')}
                  </GlassButton>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="flex justify-center mt-2 sm:mt-0"
              >
                <GlassButton
                  variant="secondary"
                  size="lg"
                  className="bg-slate-50 border-slate-200 text-slate-700 font-bold px-8 py-4 !rounded-2xl flex items-center gap-3 hover:bg-slate-100 transition-all shadow-md group border"
                  onClick={() => navigate('/discover?wizard=true')}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <Compass className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-[9px] uppercase tracking-widest font-black text-slate-800">Not sure where to start?</div>
                    <div className="text-sm sm:text-base text-slate-900 font-extrabold">Need help finding a resource?</div>
                  </div>
                </GlassButton>
              </motion.div>

              <div className="flex justify-center flex-wrap gap-3 sm:gap-6 mt-2 sm:mt-3 text-[10px] sm:text-xs text-slate-600 font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                  </div>
                  <span>{stats.totalResources}+ {t('home.stats.resources')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                    <Compass className="w-4 h-4 text-slate-400" />
                  </div>
                  <span>12+ {t('home.stats.categories')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-slate-500" />
                  </div>
                  <span>{t('home.stats.localSupport')}</span>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1, y: [0, 10, 0] }}
                transition={{
                  opacity: { duration: 0.5, delay: 1.2 },
                  scale: { duration: 0.5, delay: 1.2 },
                  y: { duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.5 }
                }}
                className="flex justify-center mt-2 sm:mt-4"
              >
                <div
                  className="w-10 h-10 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all hover:scale-110"
                  onClick={() => window.scrollBy({ top: window.innerHeight - 80, behavior: 'smooth' })}
                >
                  <ChevronDown className="w-6 h-6 text-slate-400" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Spotlight Carousel */}
      <div className="section-divider mx-auto max-w-4xl" />
      <section className="py-10 sm:py-16 px-3 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16 flex flex-col items-center"
          >
            <span className="text-slate-500 text-xs font-semibold px-4 py-1 mb-4 uppercase tracking-wider">
              Community Resource Highlights
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 mb-3 sm:mb-4">
              {t('home.spotlight.title')}
            </h2>
            <p className="text-lg text-slate-600 font-medium">
              {t('home.spotlight.subtitle')}
            </p>
          </motion.div>

          {displaySpotlights.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-xl text-slate-700 font-bold">{t('home.spotlight.noResources')}</p>
            </GlassCard>
          ) : (
            <div
              className="relative px-4 sm:px-12 group"
            >
              <div className="overflow-hidden">
                <motion.div
                  className="flex"
                  animate={{ x: `-${(carouselIndex * 100) / 3}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  {displaySpotlights.map((resource, index) => (
                    <div
                      key={`${resource.id}-${index}`}
                      className={`w-full sm:w-1/2 md:w-1/3 flex-shrink-0 px-4`}
                    >
                      <GlassCard
                        hover
                        className="h-full cursor-pointer bg-white border border-slate-100 shadow-sm"
                        onClick={() => setSelectedResource(resource)}
                      >
                        <div className="space-y-4">
                          {resource.image_url && (
                            <div className="aspect-video rounded-lg overflow-hidden relative">
                              <img src={resource.image_url} alt={resource.title} className="w-full h-full object-cover" />
                              <div className="absolute top-3 right-3 px-2 py-1 bg-blue-600 text-white text-[10px] font-bold rounded-full">Featured</div>
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{resource.category}</span>
                            <h3 className="text-lg font-semibold text-slate-900 mt-2 line-clamp-1">{resource.title}</h3>
                          </div>
                          <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed">{resource.description}</p>
                          <div className="flex items-center justify-between pt-2">
                            <button className="text-slate-500 font-semibold text-xs flex items-center gap-2 hover:text-slate-800 transition-colors">
                              Explore Details <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </GlassCard>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Controls */}
              {displaySpotlights.length > 1 && (
                <>
                  <button
                    onClick={() => { setCarouselIndex(prev => (prev === 0 ? displaySpotlights.length - 1 : prev - 1)); setAutoPlay(false); }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all z-10 hidden sm:flex"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => { setCarouselIndex(prev => (prev >= displaySpotlights.length - 1 ? 0 : prev + 1)); setAutoPlay(false); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur border border-slate-200 shadow-xl flex items-center justify-center text-slate-600 hover:text-blue-600 hover:scale-110 transition-all z-10 hidden sm:flex"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>

                  {/* Indicator Dots */}
                  <div className="flex justify-center gap-2 mt-8">
                    {displaySpotlights.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => { setCarouselIndex(i); setAutoPlay(false); }}
                        className={`h-2 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-blue-400'}`}
                        aria-label={`Go to slide ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </section>

      {/* How It Works Section */}
      {/* How It Works Section */}
      <section className="py-10 sm:py-16 bg-slate-50/50 border-t border-slate-100">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-blue-900 mb-4">{t('home.howItWorks.title', 'How Community Compass Works')}</h2>
            <p className="text-slate-600 max-w-2xl mx-auto font-bold">{t('home.howItWorks.subtitle', 'Your hub for finding and sharing crucial local resources.')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('home.howItWorks.step1.title', '1. Discover'),
                icon: <Search className="w-8 h-8 text-blue-600" />,
                iconBg: "bg-blue-50",
                frontText: "Find what you need.",
                desc: t('home.howItWorks.step1.desc', 'Search our interactive directory or talk to our AI assistant to find exactly what you need in your area.'),
                theme: "blue"
              },
              {
                title: t('home.howItWorks.step2.title', '2. Connect'),
                icon: <Heart className="w-8 h-8 text-indigo-600" />,
                iconBg: "bg-indigo-50",
                frontText: "Reach out to local heroes.",
                desc: t('home.howItWorks.step2.desc', 'Get immediate access to contact info, hours, directions, and services for local organizations.'),
                theme: "indigo"
              },
              {
                title: t('home.howItWorks.step3.title', '3. Contribute'),
                icon: <Users className="w-8 h-8 text-emerald-600" />,
                iconBg: "bg-emerald-50",
                frontText: "Grow the community hub.",
                desc: t('home.howItWorks.step3.desc', 'Help your community grow by submitting new local resources, organizations, and services to our hub directly.'),
                theme: "emerald"
              }
            ].map((step, idx) => (
              <FlipCard
                key={idx}
                heightClass="h-[320px]"
                front={
                  <div className={`bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center transform hover:-translate-y-1 transition-transform h-full flex flex-col items-center justify-center group`}>
                    <div className={`w-16 h-16 ${step.iconBg} rounded-xl flex items-center justify-center mx-auto mb-6`}>
                      {step.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{step.title}</h3>
                    <p className={`text-sm font-medium text-slate-600 mb-4 px-2`}>{step.frontText}</p>
                    <p className={`mt-auto pt-2 font-semibold text-[11px] uppercase tracking-wider opacity-100 transition-opacity text-slate-400`}>Tap to Reveal</p>
                  </div>
                }
                back={
                  <div className={`bg-white rounded-xl p-8 border border-slate-200 shadow-sm text-center h-full flex flex-col items-center justify-center`}>
                    <h3 className="text-xl font-semibold text-slate-900 mb-4">{step.title}</h3>
                    <p className="font-medium text-slate-600 leading-relaxed">{step.desc}</p>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <div className="section-divider mx-auto max-w-4xl" />
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 flex flex-col items-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="mb-4">
              <Compass className="w-10 h-10 text-blue-400 opacity-40" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">{t('home.impact.title')}</h2>
            <p className="text-base text-slate-500 font-medium">{t('home.impact.subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatCard icon={<Users className="w-20 h-20" />} target={1247} suffix="+" label={t('home.impact.neighborsHelped')} color="blue" />
            <StatCard icon={<Search className="w-20 h-20" />} target={stats.totalResources} suffix="+" label={t('home.impact.localOrgs')} color="indigo" />
            <StatCard icon={<MapPin className="w-20 h-20" />} target={12} suffix="+" label={t('home.impact.neighborhoods')} color="teal" />
            <StatCard icon={<Clock className="w-20 h-20" />} target={0} suffix="" label="Community Care" color="amber" staticText="24/7" />
          </div>
        </div>
      </section>

      {/* Recent Community Activity */}
      <div className="section-divider mx-auto max-w-4xl" />
      <section className="py-14 sm:py-18 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-emerald-500" />
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Live</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">Recent Community Activity</h2>
            <p className="text-sm text-slate-500 font-medium">See the latest resources added by your neighbors</p>
          </motion.div>

          <div className="space-y-4">
            {featuredResources.slice(0, 5).map((resource: ResourceType, i: number) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer group"
                onClick={() => navigate(`/discover?category=${encodeURIComponent(resource.category || '')}`)}
              >
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-emerald-400 ring-4 ring-emerald-100" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 text-sm group-hover:text-blue-700 transition-colors truncate">{resource.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{resource.category}</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium mt-1 truncate">{resource.description?.slice(0, 100)}{resource.description && resource.description.length > 100 ? '...' : ''}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
            <button onClick={() => navigate('/discover')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              View all resources →
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <div className="section-divider mx-auto max-w-4xl" />
      <section className="py-14 sm:py-20 bg-white">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">{t('home.stories.title')}</h2>
            <p className="text-xl text-slate-900 font-black">{t('home.stories.subtitle')}</p>
          </motion.div>
          <div className="relative overflow-hidden px-4 carousel-fade-edges">
            <motion.div
              className="flex gap-8"
              animate={{ x: [0, -1200, 0] }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            >
              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-8 bg-white border border-slate-200 shadow-sm">
                <Quote className="w-8 h-8 text-slate-300 mb-4" />
                <blockquote className="text-lg text-slate-700 font-medium italic mb-6 leading-relaxed">
                  "When my family was facing a sudden medical emergency, I didn't know where to turn. Community Compass pointed us to a local clinic that provided the support we needed within hours."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm border border-slate-200">MS</div>
                  <div>
                    <div className="font-semibold text-slate-900">Maria Sanchez</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Northgate Neighbor</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-8 bg-white border border-slate-200 shadow-sm">
                <Quote className="w-8 h-8 text-slate-300 mb-4" />
                <blockquote className="text-lg text-slate-700 font-medium italic mb-6 leading-relaxed">
                  "As a volunteer, reaching people who need us most was always a challenge. This platform has bridged that gap, connecting us with dozens of families every single week."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm border border-slate-200">JT</div>
                  <div>
                    <div className="font-semibold text-slate-900">James Thompson</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Community Organizer</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-8 bg-white border border-slate-200 shadow-sm">
                <Quote className="w-8 h-8 text-slate-300 mb-4" />
                <blockquote className="text-lg text-slate-700 font-medium italic mb-6 leading-relaxed">
                  "Finding reliable childcare felt impossible until I used the 'Family Support' filter here. Within minutes, I found three certified providers in my own ZIP code."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm border border-slate-200">LW</div>
                  <div>
                    <div className="font-semibold text-slate-900">Linda Wright</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Single Parent &amp; Educator</div>
                  </div>
                </div>
              </GlassCard>

              {/* Duplicate for seamless loop */}
              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-8 bg-white border border-slate-200 shadow-sm">
                <Quote className="w-8 h-8 text-slate-300 mb-4" />
                <blockquote className="text-lg text-slate-700 font-medium italic mb-6 leading-relaxed">
                  "When my family was facing a sudden medical emergency..."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-semibold text-sm border border-slate-200">MS</div>
                  <div>
                    <div className="font-semibold text-slate-900">Maria Sanchez</div>
                    <div className="text-xs font-medium text-slate-500 uppercase tracking-wider">Northgate Neighbor</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter - toned down */}
      <section className="py-16 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 sm:p-12 border border-slate-150 shadow-sm"
          >
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-slate-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight mb-2">Stay in the Loop</h2>
            <p className="text-slate-500 font-medium mb-6 text-sm">
              Weekly updates on new resources, volunteer opportunities, and community events.
            </p>
            {emailSubscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 text-green-700 px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 border border-green-100"
              >
                <Heart className="w-4 h-4 text-green-600 fill-green-600" /> You're on the list!
              </motion.div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (subscribeEmail) {
                    setEmailSubscribed(true);
                    setSubscribeEmail('');
                  }
                }}
                className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto"
              >
                <input
                  type="email"
                  required
                  placeholder="Your email address..."
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 font-medium outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition-all placeholder:text-slate-400 text-sm"
                />
                <GlassButton variant="primary" size="md" className="!rounded-xl shadow-sm flex items-center justify-center gap-2">
                  Subscribe <Send className="w-3.5 h-3.5" />
                </GlassButton>
              </form>
            )}
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-4">No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>



      <ResourceDetailModal resource={selectedResource} isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} />
      <NeedsWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />
    </div >
  );
}

// Animated stat card component
function StatCard({ icon, target, suffix, label, color, staticText }: {
  icon: React.ReactNode; target: number; suffix: string; label: string; color: string; staticText?: string;
}) {
  const { count, ref } = useCountUp(target, 2000);
  const borderColor = { blue: 'border-l-blue-500', indigo: 'border-l-indigo-500', teal: 'border-l-teal-500', amber: 'border-l-amber-500' }[color] || 'border-l-blue-500';

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden group border-l-4 ${borderColor} hover:shadow-xl transition-shadow`}
    >
      <div className="absolute -right-4 -bottom-4 opacity-[0.04] group-hover:opacity-[0.08] transition-opacity">{icon}</div>
      <div className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tabular-nums relative z-10">
        {staticText || <>{count.toLocaleString()}{suffix}</>}
      </div>
      <div className="text-slate-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider relative z-10">{label}</div>
    </motion.div>
  );
}
