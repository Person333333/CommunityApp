import { motion } from 'framer-motion';
import { Search, MapPin, Heart, ArrowRight, Compass, Quote, Star, Clock } from 'lucide-react';
import { Link } from 'react-router';
import AnimatedCompass from '@/react-app/components/AnimatedCompass';
import GlassButton from '@/react-app/components/GlassButton';
import GlassCard from '@/react-app/components/GlassCard';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import LocationRequest from '@/react-app/components/LocationRequest';
import { useEffect, useState, useMemo } from 'react';
import { ResourceType } from '@/shared/types';
import { useLocation, calculateDistance } from '@/react-app/hooks/useLocation';
import { unifiedResourceService } from '@/react-app/services/unifiedResourceService';
import { useTranslation } from 'react-i18next';

export default function Home() {
  const { t, i18n } = useTranslation();
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation, setZipCodeLocation } = useLocation();
  const [allFeaturedResources, setAllFeaturedResources] = useState<ResourceType[]>([]);
  const [stats, setStats] = useState({ totalResources: 850, categories: [] as string[] });
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [volunteerResources, setVolunteerResources] = useState<ResourceType[]>([]);
  const [popularResources, setPopularResources] = useState<ResourceType[]>([]);
  const [recentResources, setRecentResources] = useState<ResourceType[]>([]);
  const [bulletinItems] = useState([
    {
      type: 'emergency',
      title: 'Winter Storm Alert',
      desc: 'Local warming centers are open across the county. Stay safe and check on your neighbors.',
      date: 'Today'
    },
    {
      type: 'emergency',
      title: 'Power Outage Update',
      desc: 'Partial power restored in the downtown area. Crews are working on the remaining residential blocks.',
      date: 'Today'
    },
    {
      type: 'event',
      title: 'Community Garden Kickoff',
      desc: 'Join us this Saturday at 10am for the spring planting event at Northgate Park.',
      date: 'Mar 15'
    },
    {
      type: 'news',
      title: 'New Library Hours',
      desc: 'The Central Library is extending evening hours until 9pm on weekdays.',
      date: 'Mar 12'
    }
  ]);

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

        // Volunteer: filter by tags, services, or category containing "volunteer"
        const volunteer = list.filter(r =>
          r.category?.toLowerCase().includes('volunteer') ||
          r.services?.toLowerCase().includes('volunteer') ||
          r.tags?.toLowerCase().includes('volunteer') ||
          r.description?.toLowerCase().includes('volunteer')
        ).slice(0, 4);
        setVolunteerResources(volunteer);

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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
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
              className="mb-12"
            >
              <AnimatedCompass />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-6"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight tracking-tight">
                <span className="block text-blue-800 mb-2 font-black">{t('home.hero.title1')}</span>
                <span className="block text-black border-b-8 border-blue-500 w-fit mx-auto pb-2 font-black tracking-tighter">{t('home.hero.title2')}</span>
              </h1>

              <p className="text-xl sm:text-2xl text-slate-950 max-w-3xl mx-auto font-black leading-relaxed">
                {t('home.hero.subtitle')}
              </p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="max-w-2xl mx-auto mt-8"
              >
                <div className="bg-white rounded-3xl sm:rounded-full p-2 flex flex-col sm:flex-row items-center gap-2 shadow-xl shadow-blue-500/10 border border-slate-100">
                  <div className="flex items-center gap-2 w-full flex-1">
                    <Search className="w-6 h-6 text-blue-500 ml-4" />
                    <input
                      type="text"
                      placeholder={t('home.hero.searchPlaceholder')}
                      className="flex-1 bg-transparent border-none outline-none text-slate-800 placeholder-slate-500 px-4 py-3 w-full font-medium"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value;
                          if (value) window.location.href = `/discover?q=${encodeURIComponent(value)}`;
                        }
                      }}
                    />
                  </div>
                  <Link to="/discover" className="w-full sm:w-auto">
                    <GlassButton variant="primary" size="md" className="w-full">
                      {t('home.hero.explore')}
                    </GlassButton>
                  </Link>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex justify-center flex-wrap gap-8 mt-12 text-sm text-slate-900 font-black uppercase tracking-wider"
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Heart className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>{stats.totalResources}+ {t('home.stats.resources')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center">
                    <Compass className="w-4 h-4 text-indigo-600" />
                  </div>
                  <span>12+ {t('home.stats.categories')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
                    <MapPin className="w-4 h-4 text-amber-600" />
                  </div>
                  <span>{t('home.stats.localSupport')}</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Spotlight Carousel */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/50">
        <div className="container mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
              {t('home.spotlight.title')}
            </h2>
            <p className="text-xl text-slate-900 font-black">
              {t('home.spotlight.subtitle')}
            </p>
          </motion.div>

          {featuredResources.length === 0 ? (
            <GlassCard className="text-center py-12">
              <p className="text-xl text-slate-700 font-bold">{t('home.spotlight.noResources')}</p>
            </GlassCard>
          ) : (
            <div className="relative overflow-hidden px-4">
              <motion.div
                className="flex gap-8"
                animate={{ x: [0, -1032, 0] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                {[...featuredResources, ...featuredResources].map((resource, index) => (
                  <div key={`${resource.id}-${index}`} className="w-full md:w-[calc(33.333%-1.33rem)] flex-shrink-0">
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
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">{resource.category}</span>
                          <h3 className="text-xl font-black text-slate-900 mt-2 line-clamp-1 uppercase tracking-tight">{resource.title}</h3>
                        </div>
                        <p className="text-slate-900 text-sm line-clamp-2 leading-relaxed font-bold">{resource.description}</p>
                        <div className="flex items-center justify-between pt-2">
                          <button className="text-blue-700 font-bold text-xs flex items-center gap-2 hover:text-blue-900 transition-colors">
                            Explore Details <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </div>
                ))}
              </motion.div>
            </div>
          )}
        </div>
      </section>

      {/* Community Quick Picks - "Popular" & "Recent" */}
      <section className="py-16 px-4 bg-white border-y border-slate-100 overflow-hidden">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
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
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Star className="w-6 h-6 text-amber-500 group-hover:text-white transition-colors" />
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
                    className="flex-shrink-0 w-64 snap-start border border-slate-100 rounded-3xl p-4 bg-slate-50/50 hover:bg-white hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <Heart className="w-6 h-6 text-rose-500 group-hover:text-white transition-colors" />
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

      {/* Bulletin Board & Volunteer Opportunities */}
      <section className="py-20 bg-slate-50/50">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Bulletin Board */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-blue-900">{t('home.board.title')}</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="aspect-square rounded-2xl overflow-hidden shadow-lg border border-blue-100">
                  <img
                    src="https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=800"
                    alt="Local Community Center"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {bulletinItems.map((item, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.95 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <div className="bg-white border border-slate-100 rounded-xl p-3 shadow-sm hover:shadow-md transition-all flex gap-3 group">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${item.type === 'emergency' ? 'bg-rose-100 text-rose-600' :
                          item.type === 'event' ? 'bg-amber-100 text-amber-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                          {item.type === 'emergency' ? <Search className="w-5 h-5 animate-pulse" /> :
                            item.type === 'event' ? <Compass className="w-5 h-5" /> :
                              <Heart className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full ${item.type === 'emergency' ? 'bg-rose-600 text-white' :
                              item.type === 'event' ? 'bg-amber-100 text-amber-800' :
                                'bg-blue-100 text-blue-800'
                              }`}>
                              {t(`home.board.${item.type}`)}
                            </span>
                            <span className="text-[10px] font-black text-slate-400">{item.date}</span>
                          </div>
                          <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{item.title}</h3>
                          <p className="text-slate-600 text-[11px] leading-tight font-bold line-clamp-1">{item.desc}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Volunteer Opportunities */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-blue-900">{t('home.volunteer.title')}</h2>
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl relative overflow-hidden h-full flex flex-col justify-between min-h-[400px]">
                <div className="absolute top-0 right-0 p-6 opacity-5">
                  <Heart className="w-24 h-24 text-blue-600" />
                </div>
                <div>
                  <p className="text-slate-900 font-black mb-6 italic text-sm">"{t('home.volunteer.subtitle')}"</p>
                  <div className="space-y-4">
                    {volunteerResources.length > 0 ? (
                      volunteerResources.map(resource => (
                        <div key={resource.id} className="flex gap-4 items-center p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedResource(resource)}>
                          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Heart className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <h4 className="text-xs font-black text-slate-900 truncate uppercase tracking-tight">{resource.title}</h4>
                            <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">
                              Explore Role
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-600 italic">Finding local opportunities...</p>
                    )}
                  </div>
                </div>
                <Link to="/discover?q=volunteer" className="mt-6">
                  <GlassButton variant="primary" size="md" className="w-full h-12 text-xs font-black uppercase tracking-widest">
                    Join the Movement
                  </GlassButton>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4 max-w-6xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-16">
            <h2 className="text-4xl font-bold text-blue-900 mb-4">{t('home.impact.title')}</h2>
            <p className="text-xl text-slate-900 font-black">{t('home.impact.subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-4xl font-bold text-blue-600 mb-2">1,247+</div>
              <div className="text-slate-900 text-xs font-black uppercase tracking-widest">{t('home.impact.neighborsHelped')}</div>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-4xl font-bold text-indigo-600 mb-2">{stats.totalResources}+</div>
              <div className="text-slate-900 text-xs font-black uppercase tracking-widest">{t('home.impact.localOrgs')}</div>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-4xl font-bold text-amber-600 mb-2">12+</div>
              <div className="text-slate-900 text-xs font-black uppercase tracking-widest">{t('home.impact.neighborhoods')}</div>
            </div>
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm">
              <div className="text-4xl font-bold text-indigo-600 mb-2">24/7</div>
              <div className="text-slate-900 text-xs font-black uppercase tracking-widest">Community Care</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-slate-50/30">
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
              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-10 bg-white border-l-4 border-blue-500 shadow-xl">
                <Quote className="w-10 h-10 text-blue-100 mb-6" />
                <blockquote className="text-lg text-slate-900 font-black italic mb-8 leading-relaxed">
                  "When my family was facing a sudden medical emergency, I didn't know where to turn. Community Compass pointed us to a local clinic that provided the support we needed within hours."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">MS</div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">Maria Sanchez</div>
                    <div className="text-sm font-semibold text-blue-600 uppercase">Northgate Neighbor</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-10 bg-white border-l-4 border-indigo-500 shadow-xl">
                <Quote className="w-10 h-10 text-indigo-100 mb-6" />
                <blockquote className="text-lg text-slate-900 font-black italic mb-8 leading-relaxed">
                  "As a volunteer, reaching people who need us most was always a challenge. This platform has bridged that gap, connecting us with dozens of families every single week."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xl">JT</div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">James Thompson</div>
                    <div className="text-sm font-semibold text-indigo-600 uppercase">Community Organizer</div>
                  </div>
                </div>
              </GlassCard>

              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-10 bg-white border-l-4 border-amber-500 shadow-xl">
                <Quote className="w-10 h-10 text-amber-100 mb-6" />
                <blockquote className="text-lg text-slate-900 font-black italic mb-8 leading-relaxed">
                  "Finding reliable childcare felt impossible until I used the 'Family Support' filter here. Within minutes, I found three certified providers in my own ZIP code."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 font-bold text-xl">LW</div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">Linda Wright</div>
                    <div className="text-sm font-semibold text-amber-600 uppercase">Single Parent & Educator</div>
                  </div>
                </div>
              </GlassCard>

              {/* Duplicate for seamless loop */}
              <GlassCard className="w-full md:w-[600px] flex-shrink-0 p-10 bg-white border-l-4 border-blue-500 shadow-xl">
                <Quote className="w-10 h-10 text-blue-100 mb-6" />
                <blockquote className="text-lg text-slate-900 font-black italic mb-8 leading-relaxed">
                  "When my family was facing a sudden medical emergency..."
                </blockquote>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">MS</div>
                  <div>
                    <div className="font-bold text-slate-900 text-lg">Maria Sanchez</div>
                    <div className="text-sm font-semibold text-blue-600 uppercase">Northgate Neighbor</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 bg-white">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-[3rem] text-center text-white shadow-2xl p-16">
            <h2 className="text-4xl sm:text-5xl font-black mb-6 uppercase tracking-tight">{t('home.cta.title')}</h2>
            <p className="text-xl text-blue-50 mb-10 max-w-2xl mx-auto font-black leading-relaxed">{t('home.cta.subtitle')}</p>
            <Link to="/submit">
              <GlassButton variant="secondary" size="lg" className="bg-white !text-slate-950 border-none px-12 h-16 text-lg font-black shadow-xl uppercase tracking-widest transition-all hover:bg-slate-50">
                {t('home.cta.button')}
              </GlassButton>
            </Link>
          </div>
        </div>
      </section>

      <ResourceDetailModal resource={selectedResource} isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} />
    </div >
  );
}
