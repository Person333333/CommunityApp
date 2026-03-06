import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Phone, Clock, Filter, ChevronRight, ChevronLeft, Star, Heart, User, Sparkles, MapPinned, Compass, X, Trash2 } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import LocationRequest from '@/react-app/components/LocationRequest';
import GuestAuthModal from '@/react-app/components/GuestAuthModal';
import { ResourceType } from '@/shared/types';
import { useUser } from '@clerk/clerk-react';
import { useLocation, calculateDistance } from '@/react-app/hooks/useLocation';
import { aiSearchService } from '@/react-app/services/aiSearch';
import { unifiedResourceService } from '@/react-app/services/unifiedResourceService';
import MapComponent from '@/react-app/components/MapComponent';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '@/react-app/hooks/useDynamicTranslation';
import { CategoryNode, categoryHierarchy } from '@/shared/categoryHierarchy';

export default function Discover() {
  const { t, i18n } = useTranslation();
  const { } = useDynamicTranslation();

  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation, setZipCodeLocation } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allResources, setAllResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMySubmissions, setShowMySubmissions] = useState(false);
  const { user } = useUser();
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [aiActive, setAiActive] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [localFavoriteIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('community_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [viewMode, setViewMode] = useState<'list' | 'map'>(searchParams.get('view') === 'map' ? 'map' : 'list');
  const [popularResources, setPopularResources] = useState<ResourceType[]>([]);
  const [recentResources, setRecentResources] = useState<ResourceType[]>([]);
  const [categoryStack, setCategoryStack] = useState<CategoryNode[]>([]);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'favorite' | 'submissions';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'favorite'
  });

  // Handle translation when language changes
  useEffect(() => {
    const translateContent = async () => {
      if (i18n.language === 'en') return;
      setLoading(true);
      try {
        const { TranslateService } = await import('@/react-app/services/translateService');
        const translated = await TranslateService.translateResources(allResources, i18n.language);
        setAllResources(translated);
      } catch (err) {
        console.error("Failed to translate resources:", err);
      } finally {
        setLoading(false);
      }
    };
    if (allResources.length > 0 && i18n.language !== 'en') {
      translateContent();
    }
  }, [i18n.language, allResources.length]);

  // Only fetch resources when we have user location
  useEffect(() => {
    if (!userLocation) {
      setAllResources([]);
      return;
    }

    const fetchResources = async () => {
      setLoading(true);
      try {
        const data = await unifiedResourceService.fetchAllResources({
          keyword: searchParams.get('q') || undefined,
          category: searchParams.get('category') || undefined,
          includeUserSubmitted: true,
          userId: user?.id
        });

        let list: ResourceType[] = (data as ResourceType[]).filter((r: ResourceType) => r.address || (r.latitude && r.longitude));

        if (showFavoritesOnly) {
          if (user) {
            const ids = await unifiedResourceService.getUserSavedResources(user.id);
            list = list.filter(r => ids.includes(r.id));
          } else {
            list = list.filter(r => localFavoriteIds.includes(r.id));
          }
        }

        if (showMySubmissions && user) {
          list = list.filter(r => r.user_id === user.id);
        }

        const currentLang = i18n.language;
        if (currentLang !== 'en') {
          const { TranslateService } = await import('@/react-app/services/translateService');
          list = await TranslateService.translateResources(list, currentLang);
        }

        setAllResources(list);

        // Fetch Popular and Recent for the landing explorer using actual DB sorting
        if (!searchTerm && selectedCategories.length === 0 && !showFavoritesOnly && !showMySubmissions) {
          const popular = await unifiedResourceService.fetchAllResources({ limit: 4, sortBy: 'popular' });
          setPopularResources(popular);

          const recent = await unifiedResourceService.fetchAllResources({ limit: 4, sortBy: 'recent' });
          setRecentResources(recent);
        }
      } catch (error) {
        console.error('Error fetching resources:', error);
        setAllResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [userLocation, searchParams, showFavoritesOnly, showMySubmissions, user, i18n.language, localFavoriteIds]);

  const LOCAL_RADIUS_KM = 300;
  const [showLocalOnly, setShowLocalOnly] = useState(true);
  const resources = useMemo(() => {
    let filtered = allResources;
    if (showLocalOnly && userLocation) {
      filtered = filtered.filter(resource => {
        if (!resource.latitude || !resource.longitude) return true;
        const distance = calculateDistance(userLocation[0], userLocation[1], resource.latitude, resource.longitude);
        return distance <= LOCAL_RADIUS_KM;
      });
    }
    return filtered;
  }, [allResources, showLocalOnly, userLocation]);

  const handleResourceClick = (resource: ResourceType) => {
    setSelectedResource(resource);
    // Record click for popularity tracking
    unifiedResourceService.recordClick(resource.id).catch(err => console.error('Failed to record click:', err));
  };

  const handleDelete = async (resourceId: number) => {
    if (!user || !window.confirm(t('discover.confirmDelete'))) return;

    try {
      const success = await unifiedResourceService.deleteResource(resourceId, user.id);
      if (success) {
        setAllResources(prev => prev.filter(r => r.id !== resourceId));
        alert(t('discover.resourceDeleted'));
      } else {
        alert(t('discover.deleteError'));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(t('discover.deleteError'));
    }
  };

  const handleSearch = (queryOverride?: string, categoryOverride?: string[]) => {
    setAiActive(false);
    const params = new URLSearchParams();
    const q = queryOverride !== undefined ? queryOverride : searchTerm;
    const cats = categoryOverride !== undefined ? categoryOverride : selectedCategories;

    if (q) params.append('q', q);
    if (cats.length > 0) params.append('category', cats.join(','));
    if (viewMode === 'map') params.append('view', 'map');
    setSearchParams(params);
  };

  const handleAISearch = async () => {
    if (!aiSearchService.isAvailable()) return;
    setAiLoading(true);
    setAiActive(true);
    try {
      const result = await aiSearchService.generateSearchRecommendations(searchTerm || "help me find resources", allResources.slice(0, 20));
      setAiRecommendations(result);
      if (result.categories.length > 0) {
        setSelectedCategories(result.categories);
        setSearchTerm('');
        const params = new URLSearchParams();
        params.append('category', result.categories.join(','));
        setSearchParams(params);
      }
    } catch (error) {
      console.error('AI Search failed:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const clearFilters = () => {
    setAiActive(false);
    setSearchTerm('');
    setSelectedCategories([]);
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0;

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
    <div className="min-h-screen pt-20 pb-12 px-3 sm:px-6 lg:px-8 bg-white">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold text-blue-900 mb-2 sm:mb-4">
            {t('discover.title')}
          </h1>
          <p className="text-base sm:text-xl text-slate-800 font-bold mb-4 sm:mb-8">
            {t('discover.subtitle')}
          </p>

          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="bg-white/50 backdrop-blur-md border border-slate-200 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl shadow-lg flex gap-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all ${viewMode === 'list'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`}
              >
                <Filter className="w-4 h-4" />
                List View
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[10px] sm:text-xs transition-all ${viewMode === 'map'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-600 hover:bg-white'
                  }`}
              >
                <MapPinned className="w-4 h-4" />
                Map View
              </button>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-slate-900 font-black text-xs uppercase tracking-widest bg-white/30 px-4 py-2 rounded-full border border-white/50">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>{resources.length} verified results</span>
            </div>
          </div>
        </motion.div>

        {/* Local Filter Notice */}
        {showLocalOnly && allResources.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <GlassCard variant="teal" className="p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <MapPinned className="w-5 h-5 text-teal-300 flex-shrink-0" />
                  <div>
                    <p className="text-blue-900 font-black uppercase tracking-widest text-lg">
                      {t('discover.showingLocal')}
                    </p>
                    <p className="text-sm text-slate-700 font-bold">
                      {resources.length} {t('discover.ofResources')} {allResources.length} {t('discover.resourcesInArea')}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLocalOnly(false)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-bold transition-all flex-shrink-0 shadow-lg"
                >
                  {t('discover.showAll')}
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Search and Explorer Card */}
        <motion.div data-tour="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <GlassCard variant="strong">
            <div className="space-y-6">
              {/* Search input */}
              <div className="flex flex-col gap-2">
                <div className="flex-1 flex items-center gap-2 sm:gap-3 bg-slate-50 border border-slate-200 rounded-full px-3 sm:px-4 py-2.5 sm:py-3 shadow-inner">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={t('discover.searchResources')}
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setAiActive(false); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-500 font-bold text-sm sm:text-lg"
                  />
                  {searchTerm && (
                    <button onClick={() => setSearchTerm('')} className="text-slate-500 hover:text-slate-700">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  <GlassButton variant="primary" onClick={() => handleSearch()} className="flex-1 sm:flex-initial shadow-lg">
                    {t('discover.search')}
                  </GlassButton>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAISearch}
                    disabled={aiLoading}
                    className="flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-full font-black bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg uppercase tracking-widest text-[10px] sm:text-xs flex items-center gap-1 sm:gap-2 justify-center"
                  >
                    <Sparkles className="w-4 h-4" />
                    {t('discover.aiSearch')}
                  </motion.button>
                </div>
              </div>

              {/* Favorites / Submissions toggle */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                <GlassButton variant={showFavoritesOnly ? 'primary' : 'secondary'} size="sm" onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setShowMySubmissions(false); }}>
                  <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-white' : ''}`} /> My Favorites
                </GlassButton>
                <GlassButton variant={showMySubmissions ? 'primary' : 'secondary'} size="sm" onClick={() => {
                  if (!user) {
                    setAuthModal({ isOpen: true, title: t('discover.mySubmissions'), message: t('discover.signInSubmissions'), type: 'submissions' });
                    return;
                  }
                  setShowMySubmissions(!showMySubmissions); setShowFavoritesOnly(false);
                }}>
                  <User className="w-4 h-4 mr-2" /> {t('discover.mySubmissions')}
                </GlassButton>
              </div>

              {/* Hierarchical Explorer */}
              <div data-tour="category-explorer" className="pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                    How can we help?
                  </h2>
                  {categoryStack.length > 0 && (
                    <button onClick={() => setCategoryStack(prev => prev.slice(0, -1))} className="text-xs font-black text-blue-700 font-bold flex items-center gap-1">
                      <ChevronLeft className="w-4 h-4" /> Back
                    </button>
                  )}
                </div>

                <div className="bg-slate-50/50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                  {categoryStack.length > 0 && (
                    <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
                      <button onClick={() => setCategoryStack([])} className="text-[10px] font-black text-slate-500 uppercase tracking-widest">All</button>
                      {categoryStack.map((node, i) => (
                        <div key={node.id} className="flex items-center gap-2">
                          <ChevronRight className="w-3 h-3 text-slate-300" />
                          <button onClick={() => setCategoryStack(categoryStack.slice(0, i + 1))} className={`text-[10px] font-black uppercase tracking-widest ${i === categoryStack.length - 1 ? 'text-blue-600' : 'text-slate-500'}`}>{node.label}</button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                    {(categoryStack.length === 0 ? categoryHierarchy : (categoryStack[categoryStack.length - 1].children || [])).map(node => (
                      <button
                        key={node.id}
                        onClick={() => {
                          setSelectedCategories([node.label]);
                          handleSearch(searchTerm, [node.label]);
                          if (node.children) setCategoryStack([...categoryStack, node]);
                        }}
                        className="bg-white border border-slate-100 p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-sm hover:shadow-md transition-all text-left flex justify-between items-center group"
                      >
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate">{node.label}</p>
                          {node.description && <p className="text-[9px] sm:text-[10px] text-slate-500 font-bold line-clamp-1 hidden sm:block">{node.description}</p>}
                        </div>
                        {node.children && <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-400" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Traditional Filters Panel Removed as requested */}

        {/* Content Section: Results + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Results Area */}
          <div className="flex-1 order-2 lg:order-1">
            <AnimatePresence>
              {aiActive && aiRecommendations && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-8">
                  <GlassCard variant="teal" className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-black text-white uppercase tracking-tight mb-2">{t('discover.aiRecommendations')}</h3>
                        <p className="text-xs text-slate-200 mb-3">{aiRecommendations.explanation}</p>
                        <button onClick={() => setAiActive(false)} className="text-[10px] text-teal-300 font-bold uppercase tracking-widest">{t('discover.hideRecs')}</button>
                      </div>
                    </div>
                  </GlassCard>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="relative min-h-[400px]">
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  <span className="text-xs text-slate-500 font-black uppercase tracking-widest">Filters:</span>
                  {searchTerm && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">"{searchTerm}"</span>}
                  {selectedCategories.map(cat => (
                    <span key={cat} className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      {cat} <X className="w-3 h-3 cursor-pointer" onClick={() => { const newCats = selectedCategories.filter(c => c !== cat); setSelectedCategories(newCats); handleSearch(searchTerm, newCats); }} />
                    </span>
                  ))}
                  <button onClick={clearFilters} className="text-xs text-blue-600 font-black uppercase tracking-widest underline ml-2">Clear All</button>
                </div>
              )}

              {loading ? (
                <div className="flex justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : viewMode === 'map' ? (
                <div className="h-[400px] sm:h-[600px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
                  <MapComponent resources={resources} onResourceClick={setSelectedResource} center={userLocation} zoom={12} />
                </div>
              ) : resources.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-black uppercase tracking-widest">{t('discover.noResources')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {resources.map((resource, idx) => (
                    <motion.div key={resource.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}>
                      <GlassCard hover className="flex flex-col sm:flex-row p-0 overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all h-auto" onClick={() => handleResourceClick(resource)}>
                        {resource.image_url ? (
                          <div className="w-full sm:w-48 md:w-64 h-36 sm:h-auto overflow-hidden flex-shrink-0">
                            <img src={resource.image_url} alt={resource.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                          </div>
                        ) : (
                          <div className="w-full sm:w-48 md:w-64 h-36 sm:h-auto bg-slate-50 flex items-center justify-center flex-shrink-0">
                            <Compass className="w-8 h-8 sm:w-12 sm:h-12 text-slate-200" />
                          </div>
                        )}
                        <div className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-full">{resource.category}</span>
                            <div className="flex items-center gap-3">
                              {showMySubmissions && user && resource.user_id === user.id && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(resource.id); }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <h3 className="text-base sm:text-xl font-black text-slate-900 mb-1 sm:mb-2 uppercase tracking-tight">{resource.title}</h3>
                          <p className="text-xs sm:text-sm text-slate-600 font-bold line-clamp-2 leading-relaxed mb-2 sm:mb-4 max-w-2xl">{resource.description}</p>
                          <div className="flex flex-wrap gap-2 sm:gap-4 text-[9px] sm:text-[10px] font-black text-slate-500 uppercase">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-blue-600" /> {resource.address || resource.city || 'Remote Service'}
                            </div>
                            {resource.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-blue-600" /> {resource.phone}
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Added {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : 'Recently'}
                            </div>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          {!hasActiveFilters && !showFavoritesOnly && !showMySubmissions && viewMode === 'list' && (
            <aside className="w-full lg:w-80 space-y-8 order-1 lg:order-2" data-tour="highlights-sidebar">
              <div className="sticky top-32 space-y-6">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-3 sm:mb-4">
                    <Star className="w-4 h-4 text-amber-500" /> Popular In Local
                  </h3>
                  <div className="space-y-4">
                    {popularResources.map(r => (
                      <div key={r.id} onClick={() => handleResourceClick(r)} className="flex gap-3 cursor-pointer group">
                        <div className="w-10 h-10 bg-white rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <Compass className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-slate-900 uppercase truncate group-hover:text-blue-600">{r.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{r.category}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-indigo-50/30 border border-indigo-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-3 sm:mb-4">
                    <Clock className="w-4 h-4 text-indigo-500" /> Recently Added
                  </h3>
                  <div className="space-y-4">
                    {recentResources.map(r => (
                      <div key={r.id} onClick={() => handleResourceClick(r)} className="flex gap-3 cursor-pointer group">
                        <div className="w-10 h-10 bg-white rounded-xl flex-shrink-0 flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                          <Heart className="w-4 h-4 text-rose-500 group-hover:text-white" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[11px] font-black text-slate-900 uppercase truncate group-hover:text-indigo-600">{r.title}</p>
                          <p className="text-[9px] text-indigo-700/70 font-bold uppercase tracking-widest">{r.category}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          )}
        </div>
      </div>

      <ResourceDetailModal resource={selectedResource} isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} />
      <GuestAuthModal isOpen={authModal.isOpen} onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))} title={authModal.title} message={authModal.message} type={authModal.type} />
    </div>
  );
}
