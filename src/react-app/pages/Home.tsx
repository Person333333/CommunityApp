import { motion } from 'framer-motion';
import { Search, MapPin, Heart, ArrowRight, Compass, Quote, Star, Clock, Users, ChevronDown, ChevronLeft, ChevronRight, Send, Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import AnimatedCompass from '@/react-app/components/AnimatedCompass';
import GlassButton from '@/react-app/components/GlassButton';
import GlassCard from '@/react-app/components/GlassCard';
import FlipCard from '@/react-app/components/FlipCard';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import LocationRequest from '@/react-app/components/LocationRequest';
import { useEffect, useState, useMemo } from 'react';
import { ResourceType } from '@/shared/types';
import { useLocation, calculateDistance } from '@/react-app/hooks/useLocation';
import { unifiedResourceService } from '@/react-app/services/unifiedResourceService';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation, setZipCodeLocation } = useLocation();
  const [allFeaturedResources, setAllFeaturedResources] = useState<ResourceType[]>([]);
  const [stats, setStats] = useState({ totalResources: 850, categories: [] as string[] });
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [popularResources, setPopularResources] = useState<ResourceType[]>([]);
  const [recentResources, setRecentResources] = useState<ResourceType[]>([]);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');

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



        // Popular and Recent Quick Picks using real DB sorting
        const popular = await unifiedResourceService.fetchAllResources({ limit: 6, sortBy: 'popular' });
        setPopularResources(popular);

        const recent = await unifiedResourceService.fetchAllResources({ limit: 6, sortBy: 'recent' });
        setRecentResources(recent);

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
    // Combine featured and popular, deduplicate, cap at exactly 5
    const combined = [...featuredResources, ...popularResources];
    const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
    return unique.slice(0, 5);
  }, [featuredResources, popularResources]);

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
      <section className="relative min-h-[85vh] sm:min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.2, 1], x: [0, 100, 0], y: [0, 50, 0] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-24 -left-24 w-96 h-96 bg-blue-100/50 rounded-full blur-3xl"
          />
          <motion.div
            animate={{ scale: [1.2, 1, 1.2], x: [0, -100, 0], y: [0, -50, 0] }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-6 sm:mb-12"
            >
              <AnimatedCompass />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <h1 className="text-3xl sm:text-5xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="block text-slate-700 mb-2 font-black">{t('home.hero.title1')}</span>
                <span className="block text-slate-900 border-b-4 border-slate-400 w-fit mx-auto pb-2 font-black tracking-tighter">{t('home.hero.title2')}</span>
              </h1>

              <p className="text-base sm:text-xl lg:text-2xl text-slate-950 max-w-3xl mx-auto font-black leading-relaxed">
                {t('home.hero.subtitle')}
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="max-w-2xl mx-auto mt-8"
              >
                <div className="bg-white rounded-2xl sm:rounded-full p-2 flex flex-col sm:flex-row items-center gap-2 shadow-xl shadow-blue-500/10 border border-slate-100">
                  <div className="flex items-center gap-2 w-full flex-1">
                    <Search className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400 ml-3 sm:ml-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder={t('home.hero.searchPlaceholder')}
                      className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-500 px-3 sm:px-4 py-2.5 sm:py-3 w-full font-medium text-sm sm:text-base"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (searchTerm) navigate(`/discover?q=${encodeURIComponent(searchTerm)}`);
                          else navigate('/discover');
                        }
                      }}
                    />
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

              <div className="flex justify-center flex-wrap gap-4 sm:gap-8 mt-8 sm:mt-12 text-xs sm:text-sm text-slate-600 font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-500" />
                  </div>
                  <span>{stats.totalResources}+ {t('home.stats.resources')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-slate-500" />
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
                className="flex justify-center mt-12 sm:mt-24"
              >
                <div
                  className="w-12 h-12 rounded-full bg-white border border-slate-200 shadow-md flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-all hover:scale-110"
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
      <section className="py-12 sm:py-20 px-3 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 sm:mb-16 flex flex-col items-center"
          >
            <span className="bg-slate-100 text-slate-600 text-xs font-bold px-4 py-1.5 rounded-full mb-4 uppercase tracking-widest border border-slate-200">
              Community Resource Highlights
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-blue-900 mb-3 sm:mb-4">
              {t('home.spotlight.title')}
            </h2>
            <p className="text-xl text-slate-900 font-black">
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
                            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{resource.category}</span>
                            <h3 className="text-xl font-black text-slate-900 mt-2 line-clamp-1 uppercase tracking-tight">{resource.title}</h3>
                          </div>
                          <p className="text-slate-900 text-sm line-clamp-2 leading-relaxed font-bold">{resource.description}</p>
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

      {/* Community Quick Picks - "Popular" & "Recent" */}
      <section className="py-10 sm:py-16 px-3 sm:px-4 bg-white border-y border-slate-100 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-2">
            {/* Popular in Neighborhood */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500" />
                  {t('home.popular.title')}
                </h3>
                <Link to="/discover" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">
                  {t('discover.showAll')}
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {popularResources.map(resource => (
                  <motion.div
                    key={resource.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedResource(resource)}
                    className="flex-shrink-0 w-64 snap-start border border-slate-100 rounded-3xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Star className="w-5 h-5 sm:w-6 sm:h-6 text-amber-500 group-hover:text-white transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-blue-700 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded group-hover:bg-blue-600 group-hover:text-white transition-colors">{resource.category}</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight truncate">{resource.title}</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold line-clamp-1 mt-1 leading-tight">{resource.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Recently Added */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  {t('home.recent.title')}
                </h3>
                <Link to="/discover" className="text-xs font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">
                  {t('discover.showAll')}
                </Link>
              </div>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {recentResources.map(resource => (
                  <motion.div
                    key={resource.id}
                    whileHover={{ y: -4 }}
                    onClick={() => setSelectedResource(resource)}
                    className="flex-shrink-0 w-56 sm:w-64 snap-start border border-slate-100 rounded-2xl sm:rounded-3xl p-3 sm:p-4 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-rose-500 group-hover:text-white transition-colors" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded group-hover:bg-indigo-600 group-hover:text-white transition-colors">{resource.category}</span>
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight mt-1 truncate">{resource.title}</h4>
                        <p className="text-[10px] text-slate-500 font-bold line-clamp-1 mt-1 leading-tight">{resource.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-12 sm:py-20 bg-slate-50/50 border-t border-slate-100">
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
                  <div className={`bg-white rounded-2xl p-8 border border-slate-100 shadow-sm text-center transform hover:-translate-y-1 transition-transform h-full flex flex-col items-center justify-center group`}>
                    <div className={`w-16 h-16 ${step.iconBg} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                      {step.icon}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 uppercase tracking-tight">{step.title}</h3>
                    <p className={`text-sm font-bold text-${step.theme}-600 opacity-80 mb-4 px-2`}>{step.frontText}</p>
                    <p className={`mt-auto pt-2 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-slate-500`}>Tap to Reveal</p>
                  </div>
                }
                back={
                  <div className={`bg-${step.theme}-600 rounded-2xl p-8 shadow-xl text-center h-full flex flex-col items-center justify-center text-white`}>
                    <h3 className="text-xl font-black mb-4 uppercase tracking-tight">{step.title}</h3>
                    <p className="font-bold leading-relaxed">{step.desc}</p>
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16 flex flex-col items-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="mb-6">
              <Compass className="w-14 h-14 text-slate-400 opacity-30" />
            </motion.div>
            <h2 className="text-4xl font-bold text-slate-800 mb-4">{t('home.impact.title')}</h2>
            <p className="text-lg text-slate-500 font-semibold">{t('home.impact.subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <motion.div whileHover={{ scale: 1.03 }} className="bg-slate-50 p-8 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><Users className="w-32 h-32" /></div>
              <div className="text-4xl font-bold text-slate-700 mb-2">1,247+</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest relative z-10">{t('home.impact.neighborsHelped')}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="bg-slate-50 p-8 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity"><Search className="w-32 h-32" /></div>
              <div className="text-4xl font-bold text-slate-700 mb-2">{stats.totalResources}+</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest relative z-10">{t('home.impact.localOrgs')}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="bg-slate-50 p-8 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden group">
              <div className="absolute -left-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><MapPin className="w-32 h-32" /></div>
              <div className="text-4xl font-bold text-amber-600 mb-2">12+</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest relative z-10">{t('home.impact.neighborhoods')}</div>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} className="bg-slate-50 p-8 rounded-2xl border border-slate-150 shadow-sm relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity"><Clock className="w-32 h-32" /></div>
              <div className="text-4xl font-bold text-slate-700 mb-2">24/7</div>
              <div className="text-slate-500 text-xs font-semibold uppercase tracking-widest relative z-10">Community Care</div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Testimonials */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">{t('home.stories.title')}</h2>
            <p className="text-xl text-slate-900 font-black">{t('home.stories.subtitle')}</p>
          </motion.div>
          <div className="relative overflow-hidden px-4">
            <motion.div
              className="flex gap-8"
              animate={{ x: [0, -1200, 0] }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            >
              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-8 bg-white border-l-4 border-slate-300 shadow-md">
                <Quote className="w-8 h-8 text-slate-200 mb-4" />
                <blockquote className="text-base text-slate-700 font-semibold italic mb-6 leading-relaxed">
                  "When my family was facing a sudden medical emergency, I didn't know where to turn. Community Compass pointed us to a local clinic that provided the support we needed within hours."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">MS</div>
                  <div>
                    <div className="font-semibold text-slate-800">Maria Sanchez</div>
                    <div className="text-xs font-semibold text-slate-400 uppercase">Northgate Neighbor</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-8 bg-white border-l-4 border-slate-300 shadow-md">
                <Quote className="w-8 h-8 text-slate-200 mb-4" />
                <blockquote className="text-base text-slate-700 font-semibold italic mb-6 leading-relaxed">
                  "As a volunteer, reaching people who need us most was always a challenge. This platform has bridged that gap, connecting us with dozens of families every single week."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">JT</div>
                  <div>
                    <div className="font-semibold text-slate-800">James Thompson</div>
                    <div className="text-xs font-semibold text-slate-400 uppercase">Community Organizer</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-8 bg-white border-l-4 border-amber-300 shadow-md">
                <Quote className="w-8 h-8 text-amber-100 mb-4" />
                <blockquote className="text-base text-slate-700 font-semibold italic mb-6 leading-relaxed">
                  "Finding reliable childcare felt impossible until I used the 'Family Support' filter here. Within minutes, I found three certified providers in my own ZIP code."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 font-bold text-sm">LW</div>
                  <div>
                    <div className="font-semibold text-slate-800">Linda Wright</div>
                    <div className="text-xs font-semibold text-amber-500 uppercase">Single Parent &amp; Educator</div>
                  </div>
                </div>
              </GlassCard>

              {/* Duplicate for seamless loop */}
              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-8 bg-white border-l-4 border-slate-300 shadow-md">
                <Quote className="w-8 h-8 text-slate-200 mb-4" />
                <blockquote className="text-base text-slate-700 font-semibold italic mb-6 leading-relaxed">
                  "When my family was facing a sudden medical emergency..."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">MS</div>
                  <div>
                    <div className="font-semibold text-slate-800">Maria Sanchez</div>
                    <div className="text-xs font-semibold text-slate-400 uppercase">Northgate Neighbor</div>
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
    </div >
  );
}
