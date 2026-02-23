import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, MapPin, Phone, Globe, Clock, Heart, MapPinned, Sparkles, Trash2, User } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import LocationRequest from '@/react-app/components/LocationRequest';
import { ResourceType, categories } from '@/shared/types';
import { useUser } from '@clerk/clerk-react';
import { useLocation, calculateDistance } from '@/react-app/hooks/useLocation';
import { aiSearchService } from '@/react-app/services/aiSearch';
import { unifiedResourceService } from '@/react-app/services/unifiedResourceService';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '@/react-app/hooks/useDynamicTranslation';
import GuestAuthModal from '@/react-app/components/GuestAuthModal';

export default function Discover() {
  const { t, i18n } = useTranslation();
  const { } = useDynamicTranslation();

  // Get translated description or fallback
  const getTranslatedDescription = (resource: ResourceType): string => {
    return resource.description;
  };
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation, setZipCodeLocation } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allResources, setAllResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(searchParams.get('category')?.split(',') || []);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showMySubmissions, setShowMySubmissions] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [showLocalOnly, setShowLocalOnly] = useState(true);
  const { user } = useUser();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [aiActive, setAiActive] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [localFavoriteIds, setLocalFavoriteIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('community_favorites');
    return saved ? JSON.parse(saved) : [];
  });
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
      // If language matches source or we already translated to this lang, skip (unless complex cache logic needed)
      if (i18n.language === 'en') {
        // If we are back to English, restore originals if we have them, or just rely on re-fetch
        // For simplicity, re-fetch or keep current if we store originals.
        // Actually, we should store originals separately like in Map.tsx
        return;
      }

      setLoading(true);
      try {
        const { TranslateService } = await import('@/react-app/services/translateService');
        // Translate currently displayed resources
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
  }, [i18n.language, allResources.length]); // dependency on length to trigger on fresh load

  // Only fetch resources when we have user location
  useEffect(() => {
    if (!userLocation) {
      setAllResources([]);
      return;
    }

    const fetchResources = async () => {
      setLoading(true);

      try {
        // Fetch resources using unified service (211 API + user resources)
        const data = await unifiedResourceService.fetchAllResources({
          keyword: searchParams.get('q') || undefined,
          category: searchParams.get('category') || undefined,
          includeUserSubmitted: true,
          userId: user?.id
        });

        let list: ResourceType[] = (data as ResourceType[]).filter((r: ResourceType) => r.address || (r.latitude && r.longitude));

        // Apply Favorites filter
        if (showFavoritesOnly && user) {
          const ids = await unifiedResourceService.getUserSavedResources(user.id);
          list = list.filter(r => ids.includes(r.id));
        }

        // Apply My Submissions filter
        if (showMySubmissions && user) {
          list = list.filter(r => r.user_id === user.id);
        }

        // If language is not English, translate immediately
        const currentLang = i18n.language;
        if (currentLang !== 'en') {
          const { TranslateService } = await import('@/react-app/services/translateService');
          list = await TranslateService.translateResources(list, currentLang);
        }

        setAllResources(list);
      } catch (error) {
        console.error('Error fetching resources:', error);
        setAllResources([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [userLocation, searchParams, showFavoritesOnly, showMySubmissions, user, i18n.language]);


  // Filter resources by distance
  const LOCAL_RADIUS_KM = 300;
  const resources = useMemo(() => {
    let filtered = allResources;

    // Apply local filter if enabled
    if (showLocalOnly && userLocation) {
      filtered = filtered.filter(resource => {
        // If resource doesn't have coordinates, don't hide it from the list
        // (It just won't show up as a pinpoint on the map)
        if (!resource.latitude || !resource.longitude) return true;

        const distance = calculateDistance(
          userLocation[0],
          userLocation[1],
          resource.latitude,
          resource.longitude
        );
        return distance <= LOCAL_RADIUS_KM;
      });
    }

    return filtered;
  }, [allResources, showLocalOnly, userLocation]);

  const fetchFavorites = async () => {
    if (!user) return setFavoriteIds([]);
    try {
      const ids = await unifiedResourceService.getUserSavedResources(user.id);
      setFavoriteIds(ids);
    } catch (_) {
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const toggleLocalFavorite = (id: number) => {
    setLocalFavoriteIds(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('community_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const handleShare = async (resource: ResourceType) => {
    const shareUrl = `${window.location.origin}/discover?resource=${resource.id}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: resource.title,
          text: resource.description,
          url: shareUrl,
        });
      } catch (err) { console.log('Share failed:', err); }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert('Link copied to clipboard!');
    }
  };

  const handleSearch = () => {
    // Hide AI recommendations when using regular search
    setAiActive(false);

    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (selectedCategories.length > 0) params.append('category', selectedCategories.join(','));
    setSearchParams(params);
  };

  const handleDelete = async (resourceId: number) => {
    if (!user || !window.confirm(t('discover.confirmDelete'))) return;

    setIsDeleting(resourceId);
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
    } finally {
      setIsDeleting(null);
    }
  };

  const handleAISearch = async () => {
    if (!aiSearchService.isAvailable()) return;

    setAiLoading(true);
    setAiActive(true);

    try {
      const result = await aiSearchService.generateSearchRecommendations(
        searchTerm || "help me find resources",
        allResources.slice(0, 20)
      );
      setAiRecommendations(result);

      // Only apply AI suggested categories, don't search with the term
      if (result.categories.length > 0) {
        setSelectedCategories(result.categories);
        // Clear search term to show it's AI-driven
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
    // Hide AI recommendations when clearing filters
    setAiActive(false);

    setSearchTerm('');
    setSelectedCategories([]);
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0;

  // Don't render discover page until we have location
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
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-900 mb-4">
            {t('discover.title')}
          </h1>
          <p className="text-xl text-slate-800 font-bold mb-8">
            {t('discover.subtitle')}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: 'food', label: 'Food', icon: <Heart className="w-4 h-4" />, cat: 'Food Assistance' },
              { id: 'housing', label: 'Housing', icon: <MapPin className="w-4 h-4" />, cat: 'Housing' },
              { id: 'health', label: 'Healthcare', icon: <Phone className="w-4 h-4" />, cat: 'Healthcare' },
              { id: 'mental', label: 'Mental Health', icon: <Sparkles className="w-4 h-4" />, cat: 'Mental Health' },
              { id: 'job', label: 'Employment', icon: <Globe className="w-4 h-4" />, cat: 'Job Assistance' },
              { id: 'emergency', label: 'Emergency', icon: <X className="w-4 h-4" />, cat: 'Emergency' }
            ].map(need => (
              <GlassButton
                key={need.id}
                size="sm"
                variant={selectedCategories.includes(need.cat) ? 'primary' : 'secondary'}
                onClick={() => {
                  setSelectedCategories([need.cat]);
                  setSearchParams({ category: need.cat });
                }}
                className="flex items-center gap-2 px-4 py-2 text-sm"
              >
                {need.icon}
                {need.label}
              </GlassButton>
            ))}
          </div>
        </motion.div>

        {/* Local Filter Notice */}
        {showLocalOnly && allResources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
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

        {/* Search and Filter Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
          data-tour="search"
        >
          <GlassCard variant="strong">
            <div className="space-y-4">
              {/* Search input */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="flex-1 flex items-center gap-3 glass-teal rounded-full px-4 py-3">
                  <Search className="w-5 h-5 text-teal-300 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={t('discover.searchResources')}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      // Hide AI recommendations when user types manually
                      setAiActive(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-500 font-bold text-lg"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <GlassButton variant="primary" onClick={handleSearch} className={`flex-1 sm:flex-initial transition-all ${aiActive ? 'bg-gradient-to-r from-purple-600 to-pink-600 shadow-lg shadow-purple-500/25' : ''}`}>
                    {t('discover.search')}
                  </GlassButton>
                  {aiSearchService.isAvailable() && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAISearch}
                      disabled={aiLoading}
                      className={`relative flex-1 sm:flex-initial px-4 py-2 rounded-full font-medium transition-all bg-gradient-to-r from-teal-600 to-amber-600 text-white shadow-lg shadow-teal-500/25`}
                    >
                      <Sparkles className="w-5 h-5 inline" />
                    </motion.button>
                  )}
                  <GlassButton
                    variant="secondary"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="w-5 h-5" />
                  </GlassButton>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                <GlassButton
                  variant={showFavoritesOnly ? 'primary' : 'secondary'}
                  size="sm"
                  className="aspect-square p-2"
                  onClick={() => {
                    setShowFavoritesOnly(!showFavoritesOnly);
                    if (!showFavoritesOnly) setShowMySubmissions(false);
                  }}
                >
                  <Heart className={`w-4 h-4 ${showFavoritesOnly ? 'fill-white' : ''}`} />
                </GlassButton>
                <GlassButton
                  variant={showMySubmissions ? 'primary' : 'secondary'}
                  size="sm"
                  className="aspect-square p-2"
                  onClick={() => {
                    if (!user) {
                      setAuthModal({
                        isOpen: true,
                        title: t('discover.mySubmissions'),
                        message: t('discover.signInSubmissions'),
                        type: 'submissions'
                      });
                      return;
                    }
                    setShowMySubmissions(!showMySubmissions);
                    if (!showMySubmissions) setShowFavoritesOnly(false);
                  }}
                >
                  <User className="w-4 h-4" />
                </GlassButton>
              </div>

              {/* Filters panel */}
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="pt-4 border-t border-white/10"
                >
                  <div>
                    <label className="block text-sm font-black text-slate-800 mb-3 uppercase tracking-widest">
                      {t('discover.categoryLabel')}
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {categories.map((category) => (
                        <motion.button
                          key={category}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedCategories(prev =>
                              prev.includes(category)
                                ? prev.filter(c => c !== category)
                                : [...prev, category]
                            );
                            // Hide AI recommendations when manually selecting categories
                            setAiActive(false);
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategories.includes(category)
                            ? 'bg-gradient-to-r from-teal-600 to-amber-600 text-white'
                            : 'bg-slate-100 text-slate-800 hover:bg-slate-200 border border-slate-200 shadow-sm'
                            }`}
                        >
                          {category}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Active filters */}
              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm text-slate-700 font-bold">{t('discover.activeFilters')}</span>
                  {searchTerm && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="glass-ochre px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      Search: "{searchTerm}"
                      <button onClick={() => { setSearchTerm(''); handleSearch(); }}>
                        <X className="w-4 h-4" />
                      </button>
                    </motion.span>
                  )}
                  {selectedCategories.map((category) => (
                    <motion.span
                      key={category}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="glass-teal px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {category}
                      <button onClick={() => {
                        setSelectedCategories(prev => prev.filter(c => c !== category));
                        setAiActive(false); // Hide AI recommendations when removing categories
                        handleSearch();
                      }}>
                        <X className="w-4 h-4" />
                      </button>
                    </motion.span>
                  ))}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-blue-700 hover:text-blue-900 font-bold underline"
                  >
                    {t('discover.clearAll')}
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

        {/* AI Recommendations */}
        <AnimatePresence>
          {aiActive && aiRecommendations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <GlassCard variant="teal" className="p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-teal-500 to-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">
                      {t('discover.aiRecommendations')}
                    </h3>
                    <p className="text-slate-300 mb-3">
                      {aiRecommendations.explanation}
                    </p>

                    {aiRecommendations.recommendations.length > 0 && (
                      <div className="space-y-2 mb-3">
                        {aiRecommendations.recommendations.map((rec: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 flex-shrink-0" />
                            <p className="text-sm text-slate-300">{rec}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {aiRecommendations.categories.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        <span className="text-xs text-slate-400">{t('discover.aiSuggested')}</span>
                        {aiRecommendations.categories.map((cat: string, index: number) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full"
                          >
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}

                    <button
                      onClick={() => setAiActive(false)}
                      className="mt-3 text-xs text-teal-300 hover:text-teal-200 transition-colors"
                    >
                      {t('discover.hideRecs')}
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <div>
          {loading ? (
            <div className="flex justify-center py-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full"
              />
            </div>
          ) : resources.length === 0 ? (
            <GlassCard variant="teal" className="text-center py-12">
              <div className="space-y-4">
                <p className="text-xl text-slate-800 font-bold">
                  {aiActive && aiRecommendations ?
                    t('discover.noResourcesAI', { query: aiRecommendations.query }) :
                    t('discover.noResources')
                  }
                </p>
                <div className="text-sm text-slate-800 space-y-2">
                  <p className="font-black text-slate-900 uppercase tracking-widest">{t('discover.tips')}</p>
                  <ul className="text-left max-w-md mx-auto space-y-1">
                    {aiActive && aiRecommendations ? (
                      <>
                        <li>• {t('discover.tip1')}</li>
                        <li>• {t('discover.tip2')}</li>
                        <li>• {t('discover.tip3')}</li>
                        <li>• {t('discover.tipAI')} {aiRecommendations.categories.join(', ')}</li>
                      </>
                    ) : (
                      <>
                        <li>• {t('discover.tip1')}</li>
                        <li>• {t('discover.tip2')}</li>
                        <li>• {t('discover.tip3')}</li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </GlassCard>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-slate-700 mb-4 font-bold uppercase tracking-widest"
              >
                {t('discover.findResources')} {resources.length} {t('home.stats.resources')}
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {resources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <GlassCard
                      hover
                      variant="teal"
                      className="relative h-full flex flex-col cursor-pointer"
                      onClick={() => setSelectedResource(resource)}
                    >
                      {/* Featured badge */}
                      {resource.is_featured && (
                        <span className="absolute top-3 left-3 z-10 text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">{t('discover.featured')}</span>
                      )}
                      {/* Favorite toggle - visible always; prompts sign-in if needed */}
                      <div className="absolute top-3 right-3 z-10 flex gap-2">
                        {user && resource.user_id === user.id && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await handleDelete(resource.id);
                            }}
                            disabled={isDeleting === resource.id}
                            className={`p-2 rounded-full glass hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors pointer-events-auto`}
                            aria-label="Delete resource"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!user) {
                              toggleLocalFavorite(resource.id);
                              return;
                            }
                            const isFav = favoriteIds.includes(resource.id);
                            try {
                              if (isFav) {
                                await unifiedResourceService.unsaveResource(user.id, resource.id);
                              } else {
                                await unifiedResourceService.saveResource(user.id, resource.id);
                              }
                            } finally {
                              fetchFavorites();
                            }
                          }}
                          className={`p-2 rounded-full pointer-events-auto ${(user && favoriteIds.includes(resource.id)) || (!user && localFavoriteIds.includes(resource.id)) ? 'bg-amber-500/30' : 'glass'}`}
                          aria-label="Toggle favorite"
                        >
                          <Heart className={`w-5 h-5 ${(user && favoriteIds.includes(resource.id)) || (!user && localFavoriteIds.includes(resource.id)) ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                        </button>
                      </div>
                      {/* Image restored */}
                      {resource.image_url && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-4 -mx-6 -mt-6">
                          <img
                            src={resource.image_url}
                            alt={resource.title}
                            onError={(e) => {
                              const el = e.currentTarget as HTMLImageElement;
                              if (el.src.includes('picsum.photos')) return;
                              el.src = `https://picsum.photos/seed/${resource.id}/800/450`;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}

                      <div className="flex-1 space-y-3">
                        <div>
                          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                            {resource.category}
                          </span>
                          <h3 className="text-xl font-bold text-slate-900 mt-1">
                            {resource.title}
                          </h3>
                        </div>

                        <p className="text-slate-700 text-sm line-clamp-3 leading-relaxed font-bold">
                          {getTranslatedDescription(resource)}
                        </p>

                        <div className="space-y-2 pt-2">
                          {resource.address && (
                            <div className="flex items-start gap-2 text-sm text-slate-400">
                              <MapPin className="w-5 h-5 flex-shrink-0 text-blue-700" />
                              <span className="text-slate-900 font-black text-lg">{resource.address}, {resource.city}, {resource.state}</span>
                            </div>
                          )}
                          {resource.phone && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Phone className="w-4 h-4 flex-shrink-0 text-teal-400" />
                              <a href={`tel:${resource.phone}`} className="hover:text-teal-300">
                                {resource.phone}
                              </a>
                            </div>
                          )}
                          {resource.email && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <span className="w-4 h-4" />
                              <a href={`mailto:${resource.email}`} className="hover:text-teal-300 truncate">
                                {resource.email}
                              </a>
                            </div>
                          )}
                          {resource.website && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                              <Globe className="w-4 h-4 flex-shrink-0 text-teal-400" />
                              <a
                                href={resource.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-teal-300 truncate"
                              >
                                {t('discover.visitWebsite')}
                              </a>
                            </div>
                          )}
                          {resource.hours && (
                            <div className="flex items-start gap-2 text-sm text-slate-400">
                              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-400" />
                              <span>{resource.hours}</span>
                            </div>
                          )}
                          {resource.audience && (
                            <div className="flex items-start gap-2 text-sm text-slate-400">
                              <span className="w-4 h-4" />
                              <span>{resource.audience}</span>
                            </div>
                          )}
                        </div>

                        {resource.services && (
                          <div className="pt-2">
                            <div className="text-slate-900 text-sm font-black uppercase tracking-widest mb-1">{t('discover.services')}</div>
                            <div className="flex flex-wrap gap-1">
                              {resource.services.split(',').map((service, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-3 py-1.5 bg-blue-50 text-blue-900 font-bold rounded-full border border-blue-100"
                                >
                                  {service.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {resource.tags && (
                          <div className="pt-1">
                            <div className="text-slate-200 text-sm font-semibold mb-1">{t('discover.tags')}</div>
                            <div className="flex flex-wrap gap-1">
                              {resource.tags.split(',').map((tag, i) => (
                                <span key={i} className="text-xs px-2 py-1 glass rounded-full text-slate-300">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        <div className="flex gap-1 pt-3 mt-auto border-t border-white/5">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleShare(resource); }}
                            className="flex-1 flex items-center justify-center gap-1.5 p-1.5 rounded-lg glass hover:bg-white/10 text-[10px] text-slate-300 transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" /> Share
                          </button>
                          <a
                            href={`mailto:?subject=Helpful Resource: ${resource.title}&body=Check out this community resource: ${window.location.origin}/discover?resource=${resource.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-lg glass hover:bg-white/10 text-slate-300 transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 rotate-0" />
                          </a>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="mt-4 flex gap-2">
                        {resource.website && (
                          <a
                            href={resource.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="glass-teal px-3 py-2 rounded-lg text-sm text-slate-100 hover:glass-strong"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('discover.visitWebsite')}
                          </a>
                        )}
                        {resource.phone && (
                          <a
                            href={`tel:${resource.phone}`}
                            className="glass px-3 py-2 rounded-lg text-sm text-slate-100 hover:glass-strong"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('discover.callNow')}
                          </a>
                        )}
                        {resource.email && (
                          <a
                            href={`mailto:${resource.email}`}
                            className="glass px-3 py-2 rounded-lg text-sm text-slate-100 hover:glass-strong"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {t('discover.sendEmail')}
                          </a>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
      />
      <GuestAuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))}
        title={authModal.title}
        message={authModal.message}
        type={authModal.type}
      />
    </div>
  );
}
