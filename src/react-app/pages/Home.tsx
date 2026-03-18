import { motion } from 'framer-motion';
import { Search, MapPin, Heart, ArrowRight, Compass, ChevronDown, ChevronLeft, ChevronRight, Send, Mail, Activity, Users, Clock, Quote } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
import { Card, CardContent } from '@/react-app/components/ui/card';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
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
  const { location: userLocation } = useLocation();
  const [allFeaturedResources, setAllFeaturedResources] = useState<ResourceType[]>([]);
  const [stats, setStats] = useState({ totalResources: 850, categories: [] as string[] });
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

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
          setIsTranslating(true);
          try {
            const { TranslateService } = await import('@/react-app/services/translateService');
            list = await TranslateService.translateResources(list, currentLang);
          } finally {
            setIsTranslating(false);
          }
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
      setIsTranslating(true);
      try {
        const { TranslateService } = await import('@/react-app/services/translateService');
        const translated = await TranslateService.translateResources(allFeaturedResources, i18n.language);
        setAllFeaturedResources(translated);
      } catch (e) {
        console.error(e);
      } finally {
        setIsTranslating(false);
      }
    };
    translateExisting();
  }, [i18n.language]);

  const LOCAL_RADIUS_KM = 50;
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

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Translation indicator */}
      {isTranslating && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 bg-indigo-600/90 backdrop-blur text-white text-sm rounded-full shadow-lg border border-indigo-400/40 animate-pulse">
          <span className="w-2 h-2 rounded-full bg-white animate-ping inline-block"></span>
          {t('home.translating', 'Translating resources...')}
        </div>
      )}

      {/* Simplified Hero Section */}
      <section className="relative min-h-[80vh] flex items-center justify-center pt-24 pb-12 px-4 overflow-hidden bg-slate-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1),transparent_70%)]" />
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block px-3 py-1 mb-6 text-xs font-black tracking-widest text-emerald-400 uppercase bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              {t('home.hero.badge', 'PRECISION RESOURCE MAPPING')}
            </span>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-white mb-6 uppercase tracking-tight leading-none">
              <span className="text-white">{t('home.hero.title1')}</span>
              <br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">{t('home.hero.title2')}</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-400 mx-auto font-medium leading-relaxed mb-12 max-w-2xl">
              {t('home.hero.subtitle')}
            </p>

            <div className="relative max-w-2xl mx-auto mb-12">
              <div className="bg-slate-900 border border-white/10 p-1 flex flex-col sm:flex-row items-center gap-1 shadow-2xl rounded-xl">
                <div className="flex items-center gap-2 w-full flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={t('home.hero.searchPlaceholder')}
                    className="flex-1 bg-transparent border-none outline-none text-white placeholder-slate-600 pl-12 pr-12 w-full font-medium text-sm sm:text-base py-7 focus-visible:ring-0"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (searchTerm) navigate(`/discover?q=${encodeURIComponent(searchTerm)}`);
                        else navigate('/discover');
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <VoiceSearchButton onResult={(text) => { setSearchTerm(text); navigate(`/discover?q=${encodeURIComponent(text)}`); }} className="w-8 h-8 sm:w-10 sm:h-10 border-none shadow-none text-slate-500 hover:text-emerald-400 bg-transparent transition-colors" />
                  </div>
                </div>
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest px-8 py-7 rounded-lg transition-all"
                  onClick={() => {
                    if (searchTerm) navigate(`/discover?q=${encodeURIComponent(searchTerm)}`);
                    else navigate('/discover');
                  }}
                >
                  {t('home.hero.explore')} <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center gap-6 mt-8">
              <Button
                variant="outline"
                size="lg"
                className="bg-white/5 border-white/10 text-white font-bold px-8 py-7 rounded-xl flex items-center gap-4 hover:bg-white/10 transition-all group border-l-emerald-500 border-l-4"
                onClick={() => navigate('/discover?wizard=true')}
              >
                <Compass className="w-6 h-6 text-emerald-400 group-hover:rotate-45 transition-transform" />
                <div className="text-left">
                  <div className="text-[10px] uppercase tracking-[0.2em] font-black text-emerald-400 mb-0.5 opacity-80">{t('home.hero.guidedSearch', 'Guided Search')}</div>
                  <div className="text-lg text-white font-black uppercase tracking-tight">{t('home.hero.needHelp', 'Need help finding help?')}</div>
                </div>
              </Button>
            </div>

            <div className="flex justify-center flex-wrap gap-8 mt-16 text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">
              <div className="flex items-center gap-2">
                <span className="text-white">{stats.totalResources}+</span>
                <span>{t('home.stats.resources')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white">12+</span>
                <span>{t('home.stats.categories')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white">LIVE</span>
                <span>{t('home.stats.localSupport')}</span>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", delay: 1.8 }}
              className="flex justify-center mt-12"
            >
              <ChevronDown 
                className="w-6 h-6 text-slate-500 cursor-pointer hover:text-white transition-colors" 
                onClick={() => window.scrollBy({ top: window.innerHeight - 80, behavior: 'smooth' })}
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <div className="relative">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.05)_0%,rgba(0,0,0,0)_80%)]" />
        </div>

        <div className="relative z-10">
          {/* Spotlight Carousel */}
          <div className="section-divider mx-auto max-w-4xl opacity-30" />
          <section className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="container mx-auto max-w-7xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-8 sm:mb-16 flex flex-col items-center"
              >
                <span className="text-blue-400 text-xs font-semibold px-4 py-1 mb-4 uppercase tracking-wider backdrop-blur-sm bg-white/5 border border-white/10 rounded-full">
                  {t('home.spotlight.highlights', 'Community Resource Highlights')}
                </span>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white mb-3 sm:mb-4 uppercase tracking-tighter">
                  {t('home.spotlight.title')}
                </h2>
                <p className="text-lg text-slate-300 font-bold italic opacity-80">
                  {t('home.spotlight.subtitle')}
                </p>
              </motion.div>

          {displaySpotlights.length === 0 ? (
            <Card className="text-center py-12 bg-white/5 border border-white/10 rounded-none">
              <p className="text-xl text-slate-300 font-bold">{t('home.spotlight.noResources')}</p>
            </Card>
          ) : (
            <div
              className="relative px-4 sm:px-12 group"
            >
              <div className="overflow-hidden p-4">
                <motion.div
                  className="flex"
                  animate={{ x: `-${(carouselIndex * 100) / 3}%` }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                >
                  {displaySpotlights.map((resource: ResourceType, index: number) => (
                    <div
                      key={`${resource.id}-${index}`}
                      className={`w-full sm:w-1/2 md:w-1/3 flex-shrink-0 px-4`}
                    >
                      <Card
                        className="h-full cursor-pointer bg-white/5 border border-white/10 shadow-2xl rounded-none hover:border-emerald-500/50 transition-all backdrop-blur-xl group/card"
                        onClick={() => setSelectedResource(resource)}
                      >
                        <CardContent className="p-6 space-y-4">
                          {resource.image_url && (
                            <div className="aspect-video rounded-xl overflow-hidden relative shadow-md">
                              <img src={resource.image_url} alt={resource.title} className="w-full h-full object-cover" />
                              <div className="absolute top-3 right-3 px-2 py-1 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] font-bold rounded-full border border-white/20 shadow-sm">{t('resource.featured', 'Featured')}</div>
                            </div>
                          )}
                          <div>
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">{resource.category}</span>
                            <h3 className="text-lg font-black text-white mt-1 line-clamp-1 drop-shadow-sm">{resource.title}</h3>
                          </div>
                          <p className="text-slate-300 text-sm font-semibold line-clamp-2 leading-relaxed">{resource.description}</p>
                          <div className="flex items-center justify-between pt-4 border-t border-white/10">
                            <button className="text-blue-400 font-black tracking-widest uppercase text-[10px] flex items-center gap-2 hover:text-blue-300 transition-colors">
                              {t('home.spotlight.exploreDetails', 'Explore Details')} <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
                </motion.div>
              </div>

              {/* Controls */}
              {displaySpotlights.length > 1 && (
                <>
                  <button
                    onClick={() => { setCarouselIndex(prev => (prev === 0 ? displaySpotlights.length - 1 : prev - 1)); setAutoPlay(false); }}
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] flex items-center justify-center text-white hover:text-blue-400 hover:scale-110 transition-all z-20 hidden sm:flex"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => { setCarouselIndex(prev => (prev >= displaySpotlights.length - 1 ? 0 : prev + 1)); setAutoPlay(false); }}
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/80 backdrop-blur border border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.05)] flex items-center justify-center text-white hover:text-blue-400 hover:scale-110 transition-all z-20 hidden sm:flex"
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
                        aria-label={t('home.spotlight.goToSlide', { index: i + 1, defaultValue: `Go to slide ${i+1}` })}
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
      <div className="section-divider mx-auto max-w-4xl opacity-30" />
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-white mb-4">{t('home.howItWorks.title', 'How Community Compass Works')}</h2>
            <p className="text-blue-200 max-w-2xl mx-auto font-bold">{t('home.howItWorks.subtitle', 'Your hub for finding and sharing crucial local resources.')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('home.howItWorks.step1.title', '1. Discover'),
                icon: <Search className="w-8 h-8 text-blue-400" />,
                iconBg: "bg-blue-500/10 border border-blue-500/20",
                frontText: t('home.howItWorks.step1.short', 'Find what you need.'),
                desc: t('home.howItWorks.step1.desc', 'Search our interactive directory or talk to our AI assistant to find exactly what you need in your area.'),
              },
              {
                title: t('home.howItWorks.step2.title', '2. Connect'),
                icon: <Heart className="w-8 h-8 text-purple-400" />,
                iconBg: "bg-purple-500/10 border border-purple-500/20",
                frontText: t('home.howItWorks.step2.short', 'Reach out to local heroes.'),
                desc: t('home.howItWorks.step2.desc', 'Get immediate access to contact info, hours, directions, and services for local organizations.'),
              },
              {
                title: t('home.howItWorks.step3.title', '3. Contribute'),
                icon: <Users className="w-8 h-8 text-pink-400" />,
                iconBg: "bg-pink-500/10 border border-pink-500/20",
                frontText: t('home.howItWorks.step3.short', 'Grow the community hub.'),
                desc: t('home.howItWorks.step3.desc', 'Help your community grow by submitting new local resources, organizations, and services to our hub directly.'),
              }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 100, rotateZ: -10, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, rotateZ: 0, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{
                  duration: 1.2,
                  delay: idx * 0.2,
                  type: "spring",
                  stiffness: 70,
                  damping: 15
                }}
                className="h-full"
              >
                <div className="bg-black/40 backdrop-blur-xl p-10 border border-white/10 shadow-2xl text-center h-full flex flex-col items-center justify-center group hover:border-emerald-500/50 transition-all duration-500 rounded-none relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={`w-20 h-20 ${step.iconBg} flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-lg relative z-10`}>
                    {step.icon}
                  </div>
                  <h3 className="text-2xl font-black text-white mb-4 uppercase tracking-tighter relative z-10">{step.title}</h3>
                  <p className={`text-base font-bold text-emerald-400 mb-4 px-2 italic opacity-80 relative z-10`}>{step.frontText}</p>
                  <div className="w-12 h-1 bg-white/10 mb-6 group-hover:w-24 group-hover:bg-emerald-500 transition-all relative z-10" />
                  <p className="text-sm font-medium text-slate-400 leading-relaxed relative z-10">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <div className="section-divider mx-auto max-w-4xl opacity-30" />
      <section className="py-16 sm:py-20">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 flex flex-col items-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="mb-4">
              <Compass className="w-10 h-10 text-blue-400 opacity-40" />
            </motion.div>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3">{t('home.impact.title')}</h2>
            <p className="text-base text-slate-300 font-medium">{t('home.impact.subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <StatCard icon={<Users className="w-20 h-20 text-white/5" />} target={1247} suffix="+" label={t('home.impact.neighborsHelped')} color="blue" />
            <StatCard icon={<Search className="w-20 h-20 text-white/5" />} target={stats.totalResources} suffix="+" label={t('home.impact.localOrgs')} color="indigo" />
            <StatCard icon={<MapPin className="w-20 h-20 text-white/5" />} target={12} suffix="+" label={t('home.impact.neighborhoods')} color="teal" />
            <StatCard icon={<Clock className="w-20 h-20 text-white/5" />} target={0} suffix="" label="Community Care" color="amber" staticText="24/7" />
          </div>
        </div>
      </section>

      {/* Recent Community Activity */}
      <div className="section-divider mx-auto max-w-4xl opacity-30" />
      <section className="py-14 sm:py-18">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Live</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">{t('home.activity.title', 'Recent Community Activity')}</h2>
            <p className="text-sm text-slate-300 font-medium">{t('home.activity.subtitle', 'See the latest resources added by your neighbors')}</p>
          </motion.div>

          <div className="space-y-4">
            {featuredResources.slice(0, 5).map((resource: ResourceType, i: number) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 glass-panel hover:border-emerald-500/50 hover:bg-white/5 transition-all cursor-pointer group rounded-none"
                onClick={() => navigate(`/discover?category=${encodeURIComponent(resource.category || '')}`)}
              >
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm group-hover:text-blue-300 transition-colors truncate">{resource.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/30">{resource.category}</span>
                  </div>
                  <p className="text-xs text-slate-400 font-medium mt-1 truncate">{resource.description?.slice(0, 100)}{resource.description && resource.description.length > 100 ? '...' : ''}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
            <button onClick={() => navigate('/discover')} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              {t('home.viewAllResources', 'View all resources')} →
            </button>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <div className="section-divider mx-auto max-w-4xl opacity-30" />
      <section className="py-14 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">{t('home.stories.title')}</h2>
            <p className="text-xl text-blue-200 font-black">{t('home.stories.subtitle')}</p>
          </motion.div>
          <div className="relative overflow-hidden px-4 carousel-fade-edges">
            <motion.div
              className="flex gap-8"
              animate={{ x: [0, -1200, 0] }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            >
              <Card className="w-full md:w-[600px] flex-shrink-0 p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-none">
                <Quote className="w-8 h-8 text-emerald-500/20 mb-4" />
                <blockquote className="text-lg text-slate-300 font-medium italic mb-6 leading-relaxed">
                  "When my family was facing a sudden medical emergency, I didn't know where to turn. Community Compass pointed us to a local clinic that provided the support we needed within hours."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white font-semibold text-sm border border-white/10">MS</div>
                  <div>
                    <div className="font-semibold text-white">Maria Sanchez</div>
                    <div className="text-xs font-medium text-emerald-400 uppercase tracking-widest">Northgate Neighbor</div>
                  </div>
                </div>
              </Card>

              <Card className="w-full md:w-[600px] flex-shrink-0 p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-none shadow-sm transition-all group/card">
                <Quote className="w-8 h-8 text-white/20 mb-4" />
                <blockquote className="text-lg text-slate-300 font-medium italic mb-6 leading-relaxed">
                  "As a volunteer, reaching people who need us most was always a challenge. This platform has bridged that gap, connecting us with dozens of families every single week."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm border border-white/20">JT</div>
                  <div>
                    <div className="font-semibold text-white">James Thompson</div>
                    <div className="text-xs font-medium text-blue-300 uppercase tracking-wider">Community Organizer</div>
                  </div>
                </div>
              </Card>

              <Card className="w-full md:w-[600px] flex-shrink-0 p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-none shadow-sm transition-all group/card">
                <Quote className="w-8 h-8 text-white/20 mb-4" />
                <blockquote className="text-lg text-slate-300 font-medium italic mb-6 leading-relaxed">
                  "Finding reliable childcare felt impossible until I used the 'Family Support' filter here. Within minutes, I found three certified providers in my own ZIP code."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm border border-white/20">LW</div>
                  <div>
                    <div className="font-semibold text-white">Linda Wright</div>
                    <div className="text-xs font-medium text-blue-300 uppercase tracking-wider">Single Parent &amp; Educator</div>
                  </div>
                </div>
              </Card>

              {/* Duplicate for seamless loop */}
              <Card className="w-full md:w-[600px] flex-shrink-0 p-8 bg-black/40 backdrop-blur-xl border border-white/10 rounded-none shadow-sm transition-all group/card">
                <Quote className="w-8 h-8 text-white/20 mb-4" />
                <blockquote className="text-lg text-slate-300 font-medium italic mb-6 leading-relaxed">
                  "When my family was facing a sudden medical emergency..."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white font-semibold text-sm border border-white/20">MS</div>
                  <div>
                    <div className="font-semibold text-white">Maria Sanchez</div>
                    <div className="text-xs font-medium text-blue-300 uppercase tracking-wider">Northgate Neighbor</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter - toned down */}
      <section className="py-16 border-t border-white/10">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-black/40 backdrop-blur-xl rounded-none p-8 sm:p-12 border border-white/10 shadow-2xl"
          >
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
              <Mail className="w-6 h-6 text-blue-300" />
            </div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-2">{t('home.newsletter.title', 'Stay in the Loop')}</h2>
            <p className="text-slate-300 font-medium mb-6 text-sm">
              {t('home.newsletter.subtitle', 'Weekly updates on new resources, volunteer opportunities, and community events.')}
            </p>
            {emailSubscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 text-emerald-400 px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 border border-emerald-500/20"
              >
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" /> {t('home.newsletter.subscribed', "You're on the list!")}
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
                  placeholder={t('home.newsletter.placeholder', 'Your email address...')}
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-slate-500 text-sm"
                />
                <Button className="rounded-none bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  {t('home.newsletter.subscribe', 'Subscribe')} <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            )}
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-4">{t('home.newsletter.disclaimer', 'No spam. Unsubscribe anytime.')}</p>
          </motion.div>
        </div>
      </section>
      </div>
      </div>

      <ResourceDetailModal resource={selectedResource} isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} />
      <NeedsWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />

      <style>{`
        .section-divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
      `}</style>
    </div>
  );
}

// Animated stat card component
function StatCard({ icon, target, suffix, label, color, staticText }: {
  icon: React.ReactNode; target: number; suffix: string; label: string; color: string; staticText?: string;
}) {
  const { count, ref } = useCountUp(target, 2000);
  const borderColor = { blue: 'border-l-emerald-400', indigo: 'border-l-cyan-400', teal: 'border-l-teal-400', amber: 'border-l-amber-400' }[color] || 'border-l-emerald-400';

  return (
    <motion.div
      ref={ref}
      whileHover={{ scale: 1.03, y: -4 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className={`bg-black/40 backdrop-blur-xl p-5 sm:p-6 rounded-none border border-white/10 shadow-sm relative overflow-hidden group border-l-4 ${borderColor} hover:border-emerald-500/50 transition-all`}
    >
      <div className="absolute -right-4 -bottom-4 opacity-20 group-hover:opacity-40 transition-opacity">{icon}</div>
      <div className="text-2xl sm:text-3xl font-bold text-white mb-1 tabular-nums relative z-10">
        {staticText || <>{count.toLocaleString()}{suffix}</>}
      </div>
      <div className="text-emerald-400/80 text-[10px] sm:text-xs font-black uppercase tracking-[0.2em] relative z-10">{label}</div>
    </motion.div>
  );
}
