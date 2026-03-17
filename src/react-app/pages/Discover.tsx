import { motion } from 'framer-motion';
import { Search, MapPin, Phone, Clock, Star, Heart, User, Sparkles, Compass, X, Trash2, ChevronDown, ExternalLink, ChevronRight } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Card, CardContent } from '@/react-app/components/ui/card';
import { Button } from '@/react-app/components/ui/button';
import { Input } from '@/react-app/components/ui/input';
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

export default function Discover() {
  const { t, i18n } = useTranslation();
  const { } = useDynamicTranslation();

  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation, setZipCodeLocation, currentZip } = useLocation();
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
  const [showLocalOnly, setShowLocalOnly] = useState(true);
  const [isQuestionnaireOpen, setIsQuestionnaireOpen] = useState(false);
  const LOCAL_RADIUS_KM = 50;

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
        const q = searchParams.get('q') || '';
        const isZip = /^\d{5}$/.test(q);

        const data = await unifiedResourceService.fetchAllResources({
          keyword: isZip ? undefined : q || undefined,
          location: isZip ? q : undefined,
          distance: LOCAL_RADIUS_KM,
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

  // Check if we have a saved zip or existing location to avoid splash screen
  const hasLocationPreference = !!userLocation || !!currentZip || !!localStorage.getItem('savedZip');

  if (!hasLocationPreference && (locationLoading || !userLocation)) {
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
    <div className="min-h-screen pt-20 pb-12 px-3 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold text-white mb-2 sm:mb-4">
            {t('discover.title')}
          </h1>
          <p className="text-base sm:text-xl text-slate-300 font-medium mb-4 sm:mb-8">
            {t('discover.subtitle')}
          </p>

          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <div className="hidden sm:flex items-center gap-2 text-white font-medium text-xs glass-layer px-4 py-2 rounded-full border border-white/20 shadow-sm">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span>{resources.length} verified results</span>
            </div>
          </div>
        </motion.div>


        {/* Search and Explorer Card */}
        <motion.div data-tour="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 space-y-4">
          <Button
            size="lg"
            className="w-full bg-black/40 backdrop-blur-xl border border-white/10 text-white font-black px-8 py-10 rounded-none flex items-center justify-center gap-6 hover:bg-white/10 transition-all shadow-2xl group relative overflow-hidden border-l-emerald-500 border-l-4"
            onClick={() => setIsQuestionnaireOpen(true)}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 w-[200%] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="w-16 h-16 rounded-none bg-emerald-500/80 backdrop-blur-xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
              <Compass className="w-8 h-8 text-black" />
            </div>
            <div className="text-left relative z-10">
              <div className="text-[10px] uppercase tracking-[0.3em] font-black text-emerald-400 mb-0.5">Not sure where to start?</div>
              <div className="text-xl sm:text-3xl tracking-tighter uppercase leading-none font-black">Need help finding a resource?</div>
            </div>
            <ChevronRight className="w-8 h-8 text-emerald-400 group-hover:translate-x-1 transition-transform ml-auto hidden sm:block relative z-10" />
          </Button>

          <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none p-6">
            <div className="space-y-6">
              {/* Search input and Location Bar */}
              <div className="flex flex-col lg:flex-row gap-4 items-center">
                <div className="relative flex-1 group w-full">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                  {searchTerm && (
                    <button
                      onClick={() => { setSearchTerm(''); handleSearch(''); }}
                      className="absolute left-11 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white z-10 p-1"
                      title="Clear Search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <Input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      handleSearch(val);
                    }}
                    placeholder={t('discover.searchPlaceholder')}
                    className={`w-full bg-white/5 border border-white/10 rounded-none ${searchTerm ? 'pl-20' : 'pl-12'} pr-32 py-7 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-0 transition-all font-bold backdrop-blur`}
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowLocalOnly(!showLocalOnly)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-none text-[10px] font-black uppercase transition-all border ${showLocalOnly
                        ? 'bg-emerald-500 border-emerald-600 text-black shadow-lg shadow-emerald-500/20'
                        : 'bg-white/5 border-white/10 text-slate-400 hover:text-white'}`}
                      title={showLocalOnly ? "Showing Local Only" : "Showing All Results"}
                    >
                      <MapPin className={`w-3 h-3 ${showLocalOnly ? 'fill-black' : ''}`} />
                      <span className="hidden sm:inline">{showLocalOnly ? "Local Only" : "Local Off"}</span>
                    </motion.button>
                  </div>
                </div>
                <LocationBar variant="prominent" className="w-full lg:w-auto" />
              </div>

              {/* Filter dropdowns row */}
              <div className="flex flex-wrap gap-3 mt-2">
                {/* Category */}
                <div className="relative">
                  <select
                    value={selectedCategories[0] || ''}
                    onChange={e => { const v = e.target.value; const cats = v ? [v] : []; setSelectedCategories(cats); handleSearch(searchTerm, cats); }}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-none text-sm font-semibold text-white outline-none focus:border-emerald-500 transition-all disabled:opacity-50"
                  >
                    <option value="" className="bg-slate-900">All Categories</option>
                    {categoryHierarchy.map(cat => <option key={cat.id} value={cat.label} className="bg-slate-900">{cat.label}</option>)}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {/* Cost */}
                <div className="relative">
                  <select
                    value={selectedCost}
                    onChange={e => setSelectedCost(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 cursor-pointer backdrop-blur transition-all"
                  >
                    <option value="" className="bg-slate-900">Any Cost</option>
                    <option value="free" className="bg-slate-900">Free</option>
                    <option value="sliding" className="bg-slate-900">Sliding Scale</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {/* Tags */}
                <div className="relative">
                  <select
                    value={selectedTag}
                    onChange={e => setSelectedTag(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-semibold text-white outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 cursor-pointer backdrop-blur transition-all"
                  >
                    <option value="" className="bg-slate-900">All Tags</option>
                    <option value="senior" className="bg-slate-900">Senior</option>
                    <option value="family" className="bg-slate-900">Family</option>
                    <option value="child" className="bg-slate-900">Child / Youth</option>
                    <option value="veteran" className="bg-slate-900">Veteran</option>
                    <option value="student" className="bg-slate-900">Student</option>
                    <option value="finance" className="bg-slate-900">Finance</option>
                    <option value="energy" className="bg-slate-900">Energy</option>
                    <option value="rent" className="bg-slate-900">Rent</option>
                    <option value="food" className="bg-slate-900">Food</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
                {hasActiveFilters && (
                  <button onClick={clearFilters} className="px-3 py-2 text-xs font-bold text-red-400 border border-red-500/30 rounded-xl hover:bg-red-500/10 transition-colors">Clear All</button>
                )}

                <div className="flex gap-2 items-center ml-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setShowMySubmissions(false); }}
                    className={`rounded-none px-3 py-2 font-black uppercase tracking-widest text-[10px] transition-all ${showFavoritesOnly ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                  >
                    <Heart className={`w-3.5 h-3.5 mr-2 ${showFavoritesOnly ? 'fill-emerald-400 text-emerald-400' : 'text-slate-400'}`} /> My Favorites
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (!user && !guestEmail) {
                        setShowEmailPrompt(true);
                        return;
                      }
                      setShowMySubmissions(!showMySubmissions); setShowFavoritesOnly(false);
                    }}
                    className={`rounded-none px-3 py-2 font-black uppercase tracking-widest text-[10px] transition-all ${showMySubmissions ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' : 'bg-white/5 text-white border-white/10 hover:bg-white/10'}`}
                  >
                    <User className={`w-3.5 h-3.5 mr-2 ${showMySubmissions ? 'fill-emerald-400 text-emerald-400' : 'text-slate-400'}`} /> {t('discover.mySubmissions')}
                  </Button>
                </div>
              </div>

              {/* Guest email prompt */}
              {showEmailPrompt && !user && (
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-bold text-blue-200">Enter the email you used when submitting to find your resources:</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 font-bold"
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
                      className="text-slate-400 hover:text-white text-sm font-bold"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

            </div>
          </Card>
        </motion.div>

        {/* Content Section: Results + Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Results Area */}
          <div className="flex-1 order-2 lg:order-1">

            <div className="relative min-h-[400px]">
              {paginatedResources.length === 0 && !hasActiveFilters && !showFavoritesOnly && !showMySubmissions && currentPage === 1 ? (
                <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-none p-8 sm:p-16 mb-8 text-center flex flex-col items-center justify-center min-h-[400px] group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="w-20 h-20 bg-white/5 border border-white/10 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform relative z-10">
                    <Compass className="w-10 h-10 text-slate-500 opacity-80" />
                  </div>
                  <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter leading-none relative z-10">Community Hub <br /><span className="text-emerald-500">Ready</span></h2>
                  <p className="text-slate-400 font-bold max-w-sm mx-auto mb-10 italic relative z-10 uppercase tracking-widest text-xs opacity-60">Search above, use filters, or let our guide help you find exactly what you need.</p>
                  <Button
                    size="lg"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black px-10 py-7 rounded-none shadow-xl shadow-emerald-500/20 flex items-center gap-3 transition-colors relative z-10 uppercase tracking-widest"
                    onClick={() => setIsQuestionnaireOpen(true)}
                  >
                    Start Helper Guide <Sparkles className="w-5 h-5" />
                  </Button>
                </Card>
              ) : null}


              {loading ? (
                <div className="flex justify-center py-20">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full" />
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
                      <Card className="flex flex-col sm:flex-row p-0 overflow-hidden cursor-pointer shadow-none border border-white/10 hover:border-emerald-500/50 transition-all h-auto bg-black/44 backdrop-blur-xl rounded-none group/resource" onClick={() => handleResourceClick(resource)}>
                        {resource.image_url ? (
                          <div className="w-full sm:w-48 md:w-64 h-36 sm:h-auto overflow-hidden flex-shrink-0 border-r border-white/10 relative">
                            <img src={resource.image_url} alt={resource.title} className="w-full h-full object-cover group-hover/resource:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-black/20 group-hover/resource:bg-transparent transition-colors" />
                          </div>
                        ) : (
                          <div className="w-full sm:w-48 md:w-64 h-36 sm:h-auto bg-white/5 flex items-center justify-center flex-shrink-0 border-r border-white/10">
                            <Compass className="w-8 h-8 sm:w-12 sm:h-12 text-slate-600 opacity-50 group-hover/resource:text-emerald-500 group-hover/resource:rotate-45 transition-all" strokeWidth={1} />
                          </div>
                        )}
                        <CardContent className="p-4 sm:p-6 flex-1 flex flex-col justify-center">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-none border border-emerald-500/20 text-emerald-400 bg-emerald-500/5`}>
                              {resource.category}
                            </span>
                            <div className="flex items-center gap-2">
                              {/* Favorites heart button */}
                              <button
                                onClick={(e) => toggleFavorite(e, resource.id)}
                                className={`p-1.5 rounded-none transition-all border ${favoriteIds.includes(resource.id)
                                  ? 'bg-emerald-500 border-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                                  : 'bg-white/5 border-white/10 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/50'
                                  }`}
                                title={favoriteIds.includes(resource.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                              >
                                <Heart className={`w-4 h-4 ${favoriteIds.includes(resource.id) ? 'fill-black' : ''}`} />
                              </button>
                              {showMySubmissions && (user?.id === resource.user_id || (guestEmail && resource.contact_email?.toLowerCase() === guestEmail.toLowerCase())) && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDelete(resource); }}
                                  className="p-1.5 text-red-500 hover:bg-red-500/20 rounded-none transition-colors border border-red-500/30"
                                  title="Delete your submission"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                          <h3 className="text-lg sm:text-2xl font-black text-white mb-2 uppercase tracking-tighter group-hover/resource:text-emerald-400 transition-colors">{resource.title}</h3>
                          <p className="text-sm text-slate-400 font-medium line-clamp-2 leading-relaxed mb-4 max-w-2xl">{resource.description}</p>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-slate-300">{resource.address || resource.city || 'Remote Service'}</span>
                            </div>
                            {resource.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-slate-300">{resource.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2">
                              <Clock className="w-3.5 h-3.5 text-emerald-500" /> <span className="text-slate-300">Added {resource.created_at ? new Date(resource.created_at).toLocaleDateString() : 'Recently'}</span>
                            </div>
                          </div>

                          {/* Quick Actions if any */}
                          {resource.action_urls && resource.action_urls.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                              {resource.action_urls.map((action, aidx) => (
                                <button
                                  key={aidx}
                                  onClick={(e) => { e.stopPropagation(); window.open(action.url, '_blank'); }}
                                  className="flex items-center gap-1.5 px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-300 hover:bg-white/10 hover:text-white transition-all shadow-sm"
                                >
                                  {action.label} <ExternalLink className="w-2.5 h-2.5" />
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Mock Ratings block */}
                          <div className="mt-4 flex items-center gap-1.5 bg-white/5 self-start px-2 py-1 rounded-md border border-white/10">
                            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                            <span className="text-xs font-semibold text-slate-300">
                              {(4.0 + (String(resource.id).length % 10) / 10).toFixed(1)}/5
                            </span>
                            <span className="text-xs font-normal text-slate-500 ml-1">
                              ({40 + (String(resource.title || '').length * 3)} reviews)
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                  {paginatedResources.length > 0 && totalPages > 1 && (
                    <div className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-2xl mt-8 shadow-sm backdrop-blur">
                      <button
                        onClick={() => setCurrentPage((prev: number) => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl font-medium text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors text-sm"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium text-slate-400">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage((prev: number) => Math.min(totalPages, prev + 1))}
                        disabled={currentPage >= totalPages}
                        className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl font-medium text-slate-300 hover:bg-white/10 hover:text-white disabled:opacity-25 transition-colors text-sm"
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
              <div className="h-[400px] rounded-none overflow-hidden border border-white/10 shadow-2xl relative">
                <div className="absolute inset-0 bg-emerald-500/5 pointer-events-none z-10 mix-blend-overlay"></div>
                <MapComponent resources={resources} onResourceClick={setSelectedResource} center={userLocation || [0, 0]} zoom={10} />
              </div>

              {!hasActiveFilters && !showFavoritesOnly && !showMySubmissions && (
                <>
                  <div className="bg-black/40 border border-white/10 rounded-none p-4 sm:p-6 italic text-slate-400 text-[10px] font-black uppercase tracking-widest backdrop-blur-xl">
                    {t('discover.selectCategoryExplore')}
                  </div>

                  {/* Recently Added resources list */}
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <h3 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.3em] px-2">Recently Added</h3>
                    <div className="space-y-2">
                      {recentlyAddedResources.map(res => (
                        <button
                          key={res.id}
                          onClick={() => setSelectedResource(res)}
                          className="w-full flex items-center gap-3 p-3 rounded-none bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all text-left group backdrop-blur-md"
                        >
                          <div className="w-12 h-12 rounded-none bg-white/5 flex-shrink-0 overflow-hidden border border-white/10 relative">
                            {res.image_url ? <img src={res.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" /> : <MapPin className="w-5 h-5 text-emerald-500 m-auto mt-3" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate group-hover:text-emerald-400 transition-colors uppercase tracking-tight">{res.title}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{res.category}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Popular resources list */}
                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <h3 className="text-[10px] font-black text-cyan-500 uppercase tracking-[0.3em] px-2">Popular Nearby</h3>
                    <div className="space-y-2">
                      {popularResources.map(res => (
                        <button
                          key={res.id}
                          onClick={() => setSelectedResource(res)}
                          className="w-full flex items-center gap-3 p-3 rounded-none bg-white/5 border border-white/10 hover:border-cyan-500/50 hover:bg-white/10 transition-all text-left group backdrop-blur-md"
                        >
                          <div className="w-12 h-12 rounded-none bg-white/5 flex-shrink-0 overflow-hidden border border-white/10 relative">
                            {res.image_url ? <img src={res.image_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="" /> : <Clock className="w-5 h-5 text-cyan-500 m-auto mt-3" />}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-black text-white truncate group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{res.title}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{res.category}</p>
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
