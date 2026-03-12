import { motion } from 'framer-motion';
import { Search, MapPin, Phone, Clock, Star, Heart, User, Sparkles, MapPinned, Compass, X, Trash2, ChevronDown, Calendar, ExternalLink, ChevronRight } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import LocationRequest from '@/react-app/components/LocationRequest';
import GuestAuthModal from '@/react-app/components/GuestAuthModal';
import { ResourceType } from '@/shared/types';
import { useUser } from '@clerk/clerk-react';
import { useLocation, calculateDistance } from '@/react-app/hooks/useLocation';
import { unifiedResourceService } from '@/react-app/services/unifiedResourceService';
import MapComponent from '@/react-app/components/MapComponent';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '@/react-app/hooks/useDynamicTranslation';
import { categoryHierarchy } from '@/shared/categoryHierarchy';
import QuestionnaireModal from '@/react-app/components/QuestionnaireModal';
import LocationBar from '@/react-app/components/LocationBar';
import VoiceSearchButton from '@/react-app/components/VoiceSearchButton';

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
  const [guestEmail, setGuestEmail] = useState<string>(() => {
    return localStorage.getItem('community_guest_email') || '';
  });
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [selectedCost, setSelectedCost] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showLocalOnly, setShowLocalOnly] = useState(false);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const LOCAL_RADIUS_KM = 300;

  // Local favorites state (togglable per card)
  const [favoriteIds, setFavoriteIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('community_favorites');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleFavorite = useCallback((e: React.MouseEvent, resourceId: number) => {
    e.stopPropagation();
    setFavoriteIds((prev: number[]) => {
      const next = prev.includes(resourceId) ? prev.filter((id: number) => id !== resourceId) : [...prev, resourceId];
      localStorage.setItem('community_favorites', JSON.stringify(next));
      return next;
    });
  }, []);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, selectedCost, selectedTag, showFavoritesOnly, showMySubmissions, showLocalOnly]);

  // Auto-open questionnaire if wizard=true in URL
  useEffect(() => {
    if (searchParams.get('wizard') === 'true') {
      setIsQuestionnaireOpen(true);
      // Clean up the URL parameter
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('wizard');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);

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
            list = list.filter(r => favoriteIds.includes(r.id));
          }
        }

        if (showMySubmissions) {
          if (user) {
            list = list.filter(r => r.user_id === user.id);
          } else if (guestEmail) {
            list = list.filter(r => r.contact_email?.toLowerCase() === guestEmail.toLowerCase());
          }
        }

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
  }, [userLocation, searchParams, showFavoritesOnly, showMySubmissions, user, i18n.language, favoriteIds, guestEmail]);

  const resources = useMemo(() => {
    let filtered = allResources;
    if (showLocalOnly && userLocation) {
      filtered = filtered.filter((resource: ResourceType) => {
        if (!resource.latitude || !resource.longitude) return true;
        const distance = calculateDistance(userLocation[0], userLocation[1], resource.latitude, resource.longitude);
        return distance <= LOCAL_RADIUS_KM;
      });
    }

    if (selectedCost) {
      const q = selectedCost.toLowerCase();
      filtered = filtered.filter((r: ResourceType) => {
        const descMatch = r.description?.toLowerCase().includes(q) || r.title?.toLowerCase().includes(q);
        // Explicitly handle "free" as a default assumption if no cost info is provided in title/desc, or if it explicitly says free
        if (q === 'free') {
          return descMatch || !r.description?.toLowerCase().match(/cost|price|\$|fee/i);
        }
        return descMatch;
      });
    }

    if (selectedTag) {
      const t = selectedTag.toLowerCase();
      filtered = filtered.filter((r: ResourceType) =>
        r.category?.toLowerCase().includes(t) ||
        r.description?.toLowerCase().includes(t) ||
        r.title?.toLowerCase().includes(t)
      );
    }

    return filtered;
  }, [allResources, showLocalOnly, userLocation, selectedCost, selectedTag]);

  const totalPages = Math.ceil(resources.length / itemsPerPage);
  const paginatedResources = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return resources.slice(startIndex, startIndex + itemsPerPage);
  }, [resources, currentPage]);

  const handleResourceClick = (resource: ResourceType) => {
    setSelectedResource(resource);
    // Record click for popularity tracking
    unifiedResourceService.recordClick(resource.id).catch(err => console.error('Failed to record click:', err));
  };

  const handleDelete = async (resource: ResourceType) => {
    if (!window.confirm(t('discover.confirmDelete'))) return;

    try {
      const identifier = user ? user.id : guestEmail;
      const success = await unifiedResourceService.deleteResource(resource.id, identifier);
      if (success) {
        setAllResources((prev: ResourceType[]) => prev.filter((r: ResourceType) => r.id !== resource.id));
        alert(t('discover.resourceDeleted'));
      } else {
        alert(t('discover.deleteError'));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert(t('discover.deleteError'));
    }
  };

  const recentlyAddedResources = useMemo(() => {
    return [...allResources]
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 3);
  }, [allResources]);

  const popularResources = useMemo(() => {
    return [...allResources]
      .sort((a, b) => (b.click_count || 0) - (a.click_count || 0))
      .slice(0, 3);
  }, [allResources]);

  const handleSearch = (queryOverride?: string, categoryOverride?: string[]) => {
    const params = new URLSearchParams();
    const q = queryOverride !== undefined ? queryOverride : searchTerm;
    const cats = categoryOverride !== undefined ? categoryOverride : selectedCategories;

    if (q) params.append('q', q);
    if (cats.length > 0) params.append('category', cats.join(','));
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategories([]);
    setSelectedCost('');
    setSelectedTag('');
    setSearchParams(new URLSearchParams());
  };

  const handleQuestionnaireComplete = (filters: { searchTerm?: string; categories: string[]; tag?: string }) => {
    if (filters.searchTerm) setSearchTerm(filters.searchTerm);
    if (filters.categories.length > 0) setSelectedCategories(filters.categories);
    if (filters.tag) setSelectedTag(filters.tag);

    const params = new URLSearchParams();
    if (filters.searchTerm) params.append('q', filters.searchTerm);
    if (filters.categories.length > 0) params.append('category', filters.categories.join(','));
    setSearchParams(params);
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || selectedCost || selectedTag;

  // Removed auto-trigger inline wizard by user request

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
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 mb-2 sm:mb-4">
            {t('discover.title')}
          </h1>
          <p className="text-base sm:text-xl text-slate-600 font-medium mb-4 sm:mb-8">
            {t('discover.subtitle')}
          </p>

          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="hidden sm:flex items-center gap-2 text-slate-600 font-medium text-xs bg-white/70 px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>{resources.length} verified results</span>
            </div>
          </div>
        </motion.div>

        {/* Local Filter Notice */}
        {showLocalOnly && allResources.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <GlassCard variant="teal" className="p-4 bg-teal-50 border-teal-100 shadow-sm">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <MapPinned className="w-5 h-5 text-teal-600 flex-shrink-0" />
                  <div>
                    <p className="text-teal-900 font-medium text-sm">
                      {t('discover.showingLocal')}
                    </p>
                    <p className="text-xs text-teal-700 font-normal mt-0.5">
                      {resources.length} {t('discover.ofResources')} {allResources.length} {t('discover.resourcesInArea')}
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowLocalOnly(false)}
                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 rounded-lg text-white text-sm font-medium transition-all flex-shrink-0 shadow-sm"
                >
                  {t('discover.showAll')}
                </motion.button>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Search and Explorer Card */}
        <motion.div data-tour="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 space-y-4">
          <GlassButton
            variant="secondary"
            size="lg"
            className="w-full bg-slate-900 border-slate-800 text-white font-black px-8 py-5 !rounded-[2rem] flex items-center justify-center gap-4 hover:bg-slate-800 transition-all shadow-2xl group relative overflow-hidden"
            onClick={() => setIsQuestionnaireOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/20">
              <Compass className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <div className="text-[10px] uppercase tracking-[0.3em] font-black text-blue-400 mb-0.5">Not sure where to start?</div>
              <div className="text-xl sm:text-2xl tracking-tighter uppercase leading-none">Need help finding a resource?</div>
            </div>
            <ChevronRight className="w-6 h-6 text-blue-400 group-hover:translate-x-1 transition-transform ml-auto hidden sm:block" />
          </GlassButton>

          <GlassCard variant="strong">
            <div className="space-y-6">
              {/* Search input and Location Bar */}
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                  {searchTerm && (
                    <button
                      onClick={() => { setSearchTerm(''); handleSearch(''); }}
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 z-10 p-1"
                      title="Clear Search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      handleSearch(val);
                    }}
                    placeholder={t('discover.searchPlaceholder')}
                    className={`w-full bg-slate-50 border border-slate-200 rounded-2xl ${searchTerm ? 'pl-20' : 'pl-12'} pr-12 py-4 font-black text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-bold`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {searchTerm && (
                      <button onClick={() => { setSearchTerm(''); handleSearch(''); }} className="text-slate-400 hover:text-slate-600 p-1">
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <VoiceSearchButton onResult={(text) => { setSearchTerm(text); handleSearch(text); }} className="w-8 h-8 border-none shadow-none bg-transparent hover:bg-slate-200 text-slate-400 hover:text-blue-500" />
                  </div>
                </div>
                <LocationBar variant="prominent" className="w-full lg:w-auto" />
              </div>

              {/* Filter dropdowns row */}
              <div className="flex flex-wrap gap-2 mt-2">
                {/* Category */}
                <div className="relative">
                  <select
                    value={selectedCategories[0] || ''}
                    onChange={e => { const v = e.target.value; const cats = v ? [v] : []; setSelectedCategories(cats); handleSearch(searchTerm, cats); }}
                    className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                  >
                    <option value="">All Categories</option>
                    {categoryHierarchy.map(cat => <option key={cat.id} value={cat.label}>{cat.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {/* Cost */}
                <div className="relative">
                  <select
                    value={selectedCost}
                    onChange={e => setSelectedCost(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                  >
                    <option value="">Any Cost</option>
                    <option value="free">Free</option>
                    <option value="sliding">Sliding Scale</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {/* Tags */}
                <div className="relative">
                  <select
                    value={selectedTag}
                    onChange={e => setSelectedTag(e.target.value)}
                    className="appearance-none pl-3 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer"
                  >
                    <option value="">All Tags</option>
                    <option value="senior">Senior</option>
                    <option value="family">Family</option>
                    <option value="child">Child / Youth</option>
                    <option value="veteran">Veteran</option>
                    <option value="student">Student</option>
                    <option value="finance">Finance</option>
                    <option value="energy">Energy</option>
                    <option value="rent">Rent</option>
                    <option value="food">Food</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="px-3 py-2 text-xs font-bold text-indigo-600 border border-indigo-200 rounded-xl hover:bg-indigo-50 transition-colors">Clear All</button>
                )}

                <div className="flex gap-2 items-center ml-auto">
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setShowMySubmissions(false); }}
                    className={`!rounded-xl px-3 py-2 font-medium transition-all ${showFavoritesOnly ? 'bg-white !text-sky-600 border-2 border-sky-500 shadow-sm' : 'bg-sky-500 !text-white border-sky-600 shadow-sky-500/30 hover:bg-sky-600'}`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-sky-500 text-sky-500' : 'fill-white text-white'}`} /> My Favorites
                  </GlassButton>
                  <GlassButton
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      if (!user && !guestEmail) {
                        setShowEmailPrompt(true);
                        return;
                      }
                      setShowMySubmissions(!showMySubmissions); setShowFavoritesOnly(false);
                    }}
                    className={`!rounded-xl px-3 py-2 font-medium transition-all ${showMySubmissions ? 'bg-white !text-indigo-600 border-2 border-indigo-500 shadow-sm' : 'bg-indigo-600 !text-white border-indigo-700 shadow-indigo-600/30 hover:bg-indigo-700'}`}
                  >
                    <User className={`w-4 h-4 mr-2 ${showMySubmissions ? 'fill-indigo-600 text-indigo-600' : 'text-white'}`} /> {t('discover.mySubmissions')}
                  </GlassButton>
                </div>
              </div>

              {/* Guest email prompt */}
              {showEmailPrompt && !user && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-bold text-slate-800">Enter the email you used when submitting to find your resources:</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                    />
                    <button
                      onClick={() => {
                        if (guestEmail) {
                          localStorage.setItem('community_guest_email', guestEmail);
                          setShowEmailPrompt(false);
                          setShowMySubmissions(true);
                          setShowFavoritesOnly(false);
                        }
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors"
                    >
                      Find
                    </button>
                    <button
                      onClick={() => setShowEmailPrompt(false)}
                      className="text-slate-500 hover:text-slate-700 text-sm font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Hierarchical Explorer Removed */}
            </div>
          </GlassCard>
        </motion.div>

        {/* Content Section: Results + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Results Area */}
          <div className="flex-1 order-2 lg:order-1">

            <div className="relative min-h-[400px]">
              {paginatedResources.length === 0 && !hasActiveFilters && !showFavoritesOnly && !showMySubmissions && currentPage === 1 ? (
                <div className="bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-200 p-8 sm:p-16 mb-8 text-center flex flex-col items-center justify-center min-h-[400px] group">
                  <div className="w-20 h-20 rounded-3xl bg-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    <Compass className="w-10 h-10 text-slate-400 opacity-80" />
                  </div>
                  <h2 className="text-4xl font-black text-slate-900 mb-4 uppercase tracking-tighter leading-none">Community Hub <br /><span className="text-blue-600">Ready</span></h2>
                  <p className="text-slate-500 font-bold max-w-sm mx-auto mb-10 italic">Search above, use filters, or let our guide help you find exactly what you need.</p>
                  <GlassButton
                    variant="primary"
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 !rounded-2xl shadow-xl shadow-blue-500/20 flex items-center gap-3"
                    onClick={() => setIsQuestionnaireOpen(true)}
                  >
                    Start Helper Guide <Sparkles className="w-5 h-5" />
                  </GlassButton>
                </div>
              ) : null}


              {loading ? (
                <div className="flex justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-3 border-blue-600 border-t-transparent rounded-full" />
                </div>
              ) : paginatedResources.length === 0 && (hasActiveFilters || showFavoritesOnly || showMySubmissions) ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium text-sm">{t('discover.noResources')}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {paginatedResources.map((resource: ResourceType, idx: number) => (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, x: idx % 2 === 0 ? -50 : 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                    >
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
                            <div className="flex items-center gap-2">
                              {/* Favorites heart button */}
                              <button
                                onClick={(e) => toggleFavorite(e, resource.id)}
                                className={`p-1.5 rounded-lg transition-colors border shadow-sm ${favoriteIds.includes(resource.id)
                                  ? 'bg-rose-500 border-rose-600 text-white'
                                  : 'bg-white border-slate-200 text-slate-400 hover:text-rose-500 hover:border-rose-200'
                                  }`}
                                title={favoriteIds.includes(resource.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                              >
                                <Heart className={`w-4 h-4 ${favoriteIds.includes(resource.id) ? 'fill-white' : ''}`} />
                              </button>
                              {showMySubmissions && (user?.id === resource.user_id || (guestEmail && resource.contact_email?.toLowerCase() === guestEmail.toLowerCase())) && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(resource); }}
                                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors border border-rose-100 shadow-sm"
                                  title="Delete your submission"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <h3 className="text-lg sm:text-xl font-semibold text-slate-900 mb-2">{resource.title}</h3>
                          <p className="text-sm text-slate-600 font-normal line-clamp-2 leading-relaxed mb-4 max-w-2xl">{resource.description}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-slate-500">
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
                            {resource.schedule && (
                              <div className="flex items-center gap-2 text-indigo-600">
                                <Calendar className="w-3.5 h-3.5" /> <span className="truncate max-w-[150px]">{resource.schedule}</span>
                              </div>
                            )}
                          </div>

                          {/* Quick Actions if any */}
                          {resource.action_urls && resource.action_urls.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {resource.action_urls.map((action, aidx) => (
                                <button
                                  key={aidx}
                                  onClick={(e) => { e.stopPropagation(); window.open(action.url, '_blank'); }}
                                  className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm"
                                >
                                  {action.label} <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Mock Ratings block */}
                          <div className="mt-4 flex items-center gap-1.5 bg-slate-50 self-start px-2 py-1 rounded-md border border-slate-200">
                            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            <span className="text-xs font-semibold text-slate-700">
                              {(4.0 + (String(resource.id).length % 10) / 10).toFixed(1)}/5
                            </span>
                            <span className="text-xs font-normal text-slate-500 ml-1">
                              ({40 + (String(resource.title || '').length * 3)} reviews)
                            </span>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  ))}
                  {paginatedResources.length > 0 && totalPages > 1 && (
                    <div className="flex justify-between items-center bg-slate-50 border border-slate-200 p-4 rounded-2xl mt-8 shadow-sm">
                      <button
                        onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="w-full lg:w-96 space-y-6 order-1 lg:order-2" data-tour="highlights-sidebar">
            <div className="sticky top-32 space-y-6">

              {/* Map Component Always Visible on Desktop Sidebar */}
              <div className="h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
                <MapComponent resources={resources} onResourceClick={setSelectedResource} center={userLocation} zoom={10} />
              </div>

              {!hasActiveFilters && !showFavoritesOnly && !showMySubmissions && (
                <>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 italic text-slate-400 text-sm">
                    {t('discover.selectCategoryExplore')}
                  </div>

                  {/* Recently Added resources list */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Recently Added</h3>
                    <div className="space-y-2">
                      {recentlyAddedResources.map(res => (
                        <button
                          key={res.id}
                          onClick={() => setSelectedResource(res)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                            {res.image_url ? <img src={res.image_url} className="w-full h-full object-cover" alt="" /> : <MapPin className="w-5 h-5 text-slate-300 m-auto mt-2.5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{res.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{res.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular resources list */}
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2">Popular Nearby</h3>
                    <div className="space-y-2">
                      {popularResources.map(res => (
                        <button
                          key={res.id}
                          onClick={() => setSelectedResource(res)}
                          className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors text-left group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden">
                            {res.image_url ? <img src={res.image_url} className="w-full h-full object-cover" alt="" /> : <Clock className="w-5 h-5 text-slate-300 m-auto mt-2.5" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-blue-600 transition-colors uppercase tracking-tight">{res.title}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">{res.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </aside>
        </div>
      </div>

      <ResourceDetailModal resource={selectedResource} isOpen={!!selectedResource} onClose={() => setSelectedResource(null)} />
      <QuestionnaireModal isOpen={isQuestionnaireOpen} onClose={() => setIsQuestionnaireOpen(false)} onComplete={handleQuestionnaireComplete} />
      <GuestAuthModal isOpen={authModal.isOpen} onClose={() => setAuthModal((prev: any) => ({ ...prev, isOpen: false }))} title={authModal.title} message={authModal.message} type={authModal.type} />
    </div >
  );
}
