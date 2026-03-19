import { motion, useScroll, useTransform } from 'framer-motion';
import { Search, MapPin, Clock, Users, Heart, ArrowRight, Quote, Sparkles, Compass, ChevronDown, Activity, ChevronLeft, ChevronRight, Mail, Send } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '@/react-app/components/ui/button';
import { Card, CardContent } from '@/react-app/components/ui/card';
import { useState, useMemo, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { unifiedResourceService } from '@/react-app/services/unifiedResourceService';
import { ResourceType } from '@/shared/types';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import GuestAuthModal from '@/react-app/components/GuestAuthModal';
import { useLocation } from '@/react-app/hooks/useLocation';
import NeedsWizard from '@/react-app/components/NeedsWizard';
import { calculateDistance } from '@/react-app/hooks/useLocation';
import { useTheme } from '@/react-app/hooks/useTheme';
import homeLight from '../assets/hero/home-light.png';
import homeDark from '../assets/hero/home-dark.png';
import { ShootingStars } from '@/react-app/components/ui/shooting-stars';


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
  const { location: userLocation, loading: locationLoading } = useLocation();
  const [allFeaturedResources, setAllFeaturedResources] = useState<ResourceType[]>([]);
  const [stats, setStats] = useState({ totalResources: 850, categories: [] as string[] });
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isLight } = useTheme();

  // 3D Scroll Perspective Logic
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  const starFieldY = useTransform(scrollYProgress, [0, 1], [0, 200]);

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

  // Carousel Auto-Play Logic
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
    return featuredResources.slice(0, 5);
  }, [featuredResources]);

  if (locationLoading && !userLocation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      className={`min-h-screen bg-background font-sans selection:bg-primary/20 transition-colors duration-700`}
    >
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={isLight ? homeLight : homeDark} 
            alt="Community Compass" 
            className="w-full h-full object-cover opacity-60 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/40 to-background" />
        </div>

        <div className="container mx-auto px-6 relative z-10 pt-20 flex flex-col items-center justify-center text-center">
          <div className="max-w-4xl mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8 flex flex-col items-center"
            >
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-xl shadow-inner group">
                <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                <span className="text-sm font-black text-primary uppercase tracking-[0.2em]">{t('home.hero.badge')}</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-foreground uppercase tracking-tighter leading-none mb-6 drop-shadow-sm">
                {t('home.hero.title')}
              </h1>
              
              <p className="text-xl sm:text-2xl text-muted-foreground font-bold italic max-w-2xl leading-relaxed mx-auto">
                {t('home.hero.subtitle')}
              </p>
              
              <div className="flex flex-wrap justify-center gap-6 pt-4">
                <Button 
                  size="lg" 
                  onClick={() => navigate('/discover')}
                  className="bg-primary hover:bg-primary/90 text-white font-black px-12 py-8 rounded-full shadow-2xl shadow-primary/30 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 group uppercase tracking-widest text-sm"
                >
                  {t('home.hero.cta')} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <div className="flex items-center gap-4 px-8 py-4 bg-card/30 backdrop-blur-md rounded-full border border-border/50">
                  <div className="text-xs font-black text-foreground/70 uppercase tracking-widest">
                    {t('home.hero.joinedBy', { countLabel: '5,000+' })}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Scroll</span>
          <div className="w-1 h-12 bg-gradient-to-b from-primary to-transparent rounded-full opacity-50" />
        </motion.div>
      </section>


      {/* Sections below Hero with Shooting Stars */}
      <div className="relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ y: starFieldY }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,64,175,0.15)_0%,rgba(0,0,0,0)_80%)]" />
          <div className="home-starfield absolute inset-0" />
          
          <ShootingStars
            starColor="#60a5fa"
            trailColor="#1e40af"
            minSpeed={15}
            maxSpeed={35}
            minDelay={1000}
            maxDelay={3000}
          />
          <ShootingStars
            starColor="#93c5fd"
            trailColor="#3b82f6"
            minSpeed={10}
            maxSpeed={25}
            minDelay={2000}
            maxDelay={4000}
          />
        </motion.div>

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
                  Community Resource Highlights
                </span>
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black text-foreground mb-3 sm:mb-4 uppercase tracking-tighter">
                  {t('home.spotlight.title')}
                </h2>
                <p className="text-lg text-slate-300 font-bold italic opacity-80">
                  {t('home.spotlight.subtitle')}
                </p>
              </motion.div>

              {displaySpotlights.length === 0 ? (
                <Card className="text-center py-12 bg-card/40 border border-border rounded-none shadow-sm">
                  <p className="text-xl text-muted-foreground font-black italic">{t('home.spotlight.noResources')}</p>
                </Card>
              ) : (
                <div className="relative px-4 sm:px-12 group">
                  <div className="overflow-hidden p-4">
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
                          <Card
                            className="h-full cursor-pointer bg-card/60 border border-border/50 shadow-2xl rounded-2xl hover:border-primary/50 transition-all backdrop-blur-xl group/card overflow-hidden"
                            onClick={() => setSelectedResource(resource)}
                          >
                            <CardContent className="p-6 space-y-4">
                              {resource.image_url && (
                                <div className="aspect-video rounded-xl overflow-hidden relative shadow-md">
                                  <img src={resource.image_url} alt={resource.title} className="w-full h-full object-cover" />
                                  <div className="absolute top-3 right-3 px-2 py-1 bg-primary/90 backdrop-blur-sm text-white text-[10px] font-black rounded-full border border-white/20 shadow-sm uppercase tracking-widest">Featured</div>
                                </div>
                              )}
                              <div>
                                <span className="text-xs font-black text-primary uppercase tracking-[0.2em]">{resource.category}</span>
                                <h3 className="text-lg font-black text-foreground mt-1 line-clamp-1 drop-shadow-sm uppercase tracking-tight">{resource.title}</h3>
                              </div>
                              <p className="text-muted-foreground text-sm font-bold line-clamp-2 leading-relaxed italic">{resource.description}</p>
                              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                                <button className="text-primary font-black tracking-[0.2em] uppercase text-[10px] flex items-center gap-2 hover:text-primary/70 transition-colors">
                                  Explore Details <ArrowRight className="w-3.5 h-3.5" />
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
                            className={`h-2 rounded-full transition-all duration-300 ${i === carouselIndex ? 'w-6 bg-primary shadow-sm shadow-primary/30' : 'w-2 bg-muted hover:bg-primary/40'}`}
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
        </div>
      </div>


      {/* How It Works Section */}
      <div className="section-divider mx-auto max-w-4xl opacity-30" />
      <section className="py-10 sm:py-16">
        <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-foreground mb-4">{t('home.howItWorks.title', 'How Community Compass Works')}</h2>
            <p className="text-emerald-600 dark:text-emerald-400 max-w-2xl mx-auto font-bold">{t('home.howItWorks.subtitle', 'Your hub for finding and sharing crucial local resources.')}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('home.howItWorks.step1.title', '1. Discover'),
                icon: <Search className="w-10 h-10 text-primary" />,
                iconBg: "bg-matte-blue",
                frontText: "Find what you need.",
                desc: t('home.howItWorks.step1.desc', 'Search our interactive directory or talk to our AI assistant to find exactly what you need in your area.'),
              },
              {
                title: t('home.howItWorks.step2.title', '2. Connect'),
                icon: <Heart className="w-10 h-10 text-primary-green" />,
                iconBg: "bg-matte-green",
                frontText: "Reach out to local heroes.",
                desc: t('home.howItWorks.step2.desc', 'Get immediate access to contact info, hours, directions, and services for local organizations.'),
              },
              {
                title: t('home.howItWorks.step3.title', '3. Contribute'),
                icon: <Users className="w-10 h-10 text-orange-500" />,
                iconBg: "bg-accent-peach/20",
                frontText: "Grow the community hub.",
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
                <div className={`${step.iconBg} p-10 border border-border shadow-2xl text-center h-full flex flex-col items-center justify-center group hover:border-primary/50 transition-all duration-500 rounded-3xl relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className={`w-24 h-24 rounded-2xl bg-card border border-border/50 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform shadow-xl relative z-10`}>
                    {step.icon}
                  </div>
                  <h3 className="text-3xl font-black text-foreground mb-4 uppercase tracking-tighter relative z-10">{step.title}</h3>
                  <p className={`text-base font-black text-primary mb-4 px-2 italic relative z-10`}>{step.frontText}</p>
                  <div className="w-12 h-1 bg-primary/20 mb-6 group-hover:w-24 group-hover:bg-primary transition-all relative z-10" />
                  <p className="text-base font-bold text-muted-foreground leading-relaxed relative z-10">{step.desc}</p>
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
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">{t('home.impact.title')}</h2>
            <p className="text-base text-muted-foreground font-medium">{t('home.impact.subtitle')}</p>
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
      <section className="py-14 sm:py-18" data-tour="bulletin-board">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">{t('home.activity.live')}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">{t('home.activity.title')}</h2>
            <p className="text-sm text-muted-foreground font-medium">{t('home.activity.subtitle')}</p>
          </motion.div>

          <div className="space-y-4">
            {featuredResources.slice(0, 5).map((resource: ResourceType, i: number) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4 p-4 bg-card hover:border-emerald-500/50 hover:bg-accent/10 transition-all cursor-pointer group rounded-none border border-border"
                onClick={() => navigate(`/discover?category=${encodeURIComponent(resource.category || '')}`)}
              >
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-foreground text-sm group-hover:text-emerald-600 dark:group-hover:text-blue-300 transition-colors truncate">{resource.title}</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-200 bg-blue-500/10 dark:bg-blue-500/20 px-2 py-0.5 rounded-full border border-blue-500/20 dark:border-blue-500/30">{resource.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium mt-1 truncate">{resource.description?.slice(0, 100)}{resource.description && resource.description.length > 100 ? '...' : ''}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors flex-shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-8">
            <button onClick={() => navigate('/discover')} className="text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              {t('home.activity.viewAll')}
            </button>
          </motion.div>
        </div>
      </section>
      {/* FAQ Section */}
      <div className="section-divider mx-auto max-w-4xl opacity-30" />
      <section className="py-20 bg-background/30 transition-colors duration-300">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-5xl font-black text-foreground mb-4 uppercase tracking-tighter">{t('home.faq.title')}</h2>
            <div className="w-20 h-1 bg-emerald-500 mx-auto rounded-full mb-6 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
            <p className="text-muted-foreground font-black text-xs uppercase tracking-[0.3em]">{t('home.faq.subtitle')}</p>
          </motion.div>

          <div className="space-y-4">
            {[
              {
                q: t('home.faq.q1'),
                a: t('home.faq.a1')
              },
              {
                q: t('home.faq.q2'),
                a: t('home.faq.a2')
              },
              {
                q: t('home.faq.q3'),
                a: t('home.faq.a3')
              },
              {
                q: t('home.faq.q4'),
                a: t('home.faq.a4')
              }
            ].map((faq, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
              >
                <details className="group bg-card border border-border hover:border-emerald-500/30 transition-all rounded-none overflow-hidden">
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                    <h3 className="text-lg font-black text-foreground uppercase tracking-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors pr-8">
                      {faq.q}
                    </h3>
                    <div className="shrink-0 transition-transform duration-300 group-open:rotate-180 bg-emerald-500/10 p-2 border border-emerald-500/20">
                      <ChevronDown className="w-5 h-5 text-emerald-500" />
                    </div>
                  </summary>
                  <div className="px-6 pb-6 text-muted-foreground font-medium leading-relaxed border-t border-border pt-4">
                    {faq.a}
                  </div>
                </details>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <div className="section-divider mx-auto max-w-4xl opacity-30" />
      <section className="py-14 sm:py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">{t('home.stories.title')}</h2>
            <p className="text-xl text-emerald-600 dark:text-emerald-400 font-black">{t('home.stories.subtitle')}</p>
          </motion.div>
          <div className="relative overflow-hidden px-4 carousel-fade-edges">
            <motion.div
              className="flex gap-8"
              animate={{ x: [0, -1200, 0] }}
              transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
            >
              <Card className="w-full md:w-[600px] flex-shrink-0 p-8 bg-card border border-border rounded-none shadow-2xl">
                <Quote className="w-8 h-8 text-emerald-500/20 mb-4" />
                <blockquote className="text-lg text-slate-300 font-medium italic mb-6 leading-relaxed">
                  "When my family was facing a sudden medical emergency, I didn't know where to turn. Community Compass pointed us to a local clinic that provided the support we needed within hours."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background/50 flex items-center justify-center text-foreground font-semibold text-sm border border-border">MS</div>
                  <div>
                    <div className="font-semibold text-foreground">Maria Sanchez</div>
                    <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">Northgate Neighbor</div>
                  </div>
                </div>
              </Card>

              <Card className="w-full md:w-[600px] flex-shrink-0 p-8 bg-card backdrop-blur-xl border border-border rounded-none shadow-sm transition-all group/card">
                <Quote className="w-8 h-8 text-white/20 mb-4" />
                <blockquote className="text-lg text-slate-300 font-medium italic mb-6 leading-relaxed">
                  "As a volunteer, reaching people who need us most was always a challenge. This platform has bridged that gap, connecting us with dozens of families every single week."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground font-semibold text-sm border border-border">JT</div>
                  <div>
                    <div className="font-semibold text-foreground">James Thompson</div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">Community Organizer</div>
                  </div>
                </div>
              </Card>

              <Card className="w-full md:w-[600px] flex-shrink-0 p-8 bg-card backdrop-blur-xl border border-border rounded-none shadow-sm transition-all group/card">
                <Quote className="w-8 h-8 text-white/20 mb-4" />
                <blockquote className="text-lg text-slate-300 font-medium italic mb-6 leading-relaxed">
                  "Finding reliable childcare felt impossible until I used the 'Family Support' filter here. Within minutes, I found three certified providers in my own ZIP code."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground font-semibold text-sm border border-border">LW</div>
                  <div>
                    <div className="font-semibold text-foreground">Linda Wright</div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">Single Parent & Educator</div>
                  </div>
                </div>
              </Card>

              {/* Duplicate for seamless loop */}
              <Card className="w-full md:w-[600px] flex-shrink-0 p-8 bg-card backdrop-blur-xl border border-border rounded-none shadow-sm transition-all group/card">
                <Quote className="w-8 h-8 text-foreground/10 mb-4" />
                <blockquote className="text-lg text-muted-foreground font-medium italic mb-6 leading-relaxed">
                  "When my family was facing a sudden medical emergency..."
                </blockquote>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center text-foreground font-semibold text-sm border border-border">MS</div>
                  <div>
                    <div className="font-semibold text-foreground">Maria Sanchez</div>
                    <div className="text-xs font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider">Northgate Neighbor</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Newsletter - toned down */}
      <section className="py-16 border-t border-border">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-card backdrop-blur-xl rounded-none p-8 sm:p-12 border border-border shadow-2xl"
          >
            <div className="w-12 h-12 bg-background rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
              <Mail className="w-6 h-6 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-black text-foreground uppercase tracking-tight mb-2">{t('home.newsletter.title')}</h2>
            <p className="text-muted-foreground font-medium mb-6 text-sm">
              {t('home.newsletter.subtitle')}
            </p>
            {emailSubscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-500/10 text-emerald-400 px-6 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 border border-emerald-500/20"
              >
                <Heart className="w-4 h-4 text-emerald-400 fill-emerald-400" /> You're on the list!
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
                  className="flex-1 px-4 py-3 rounded-xl bg-background border border-border text-foreground font-medium outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-muted-foreground text-sm"
                />
                <Button className="rounded-none bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest flex items-center justify-center gap-2">
                  {t('home.newsletter.button')} <Send className="w-3.5 h-3.5" />
                </Button>
              </form>
            )}
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest mt-4">No spam. Unsubscribe anytime.</p>
          </motion.div>
        </div>
      </section>
      <ResourceDetailModal resource={selectedResource} isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} />
      <NeedsWizard isOpen={showWizard} onClose={() => setShowWizard(false)} />
      <GuestAuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        title={t('auth.loginRequired')}
        message={t('auth.loginToSave')}
        type="favorite"
      />
    </motion.div>
  );
}



function StatCard({ icon, target, suffix, label, staticText }: { icon: any, target: number, suffix: string, label: string, color?: string, staticText?: string }) {
  const { count, ref } = useCountUp(target);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="relative group p-8 bg-card border border-border shadow-xl rounded-2xl overflow-hidden hover:border-primary/50 transition-all"
    >
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        {icon}
      </div>
      <div className="text-4xl sm:text-5xl font-black text-foreground mb-2 flex items-center justify-center gap-1">
        {staticText || count}{suffix}
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground whitespace-nowrap">
        {label}
      </div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-border group-hover:bg-primary transition-colors" />
    </motion.div>
  );
}
