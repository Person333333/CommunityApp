import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Phone, Clock, Star, Heart, User, Sparkles, MapPinned, Compass, X, Trash2 } from 'lucide-react';
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
import { unifiedResourceService } from '@/react-app/services/unifiedResourceService';
import MapComponent from '@/react-app/components/MapComponent';
import { useTranslation } from 'react-i18next';
import { useDynamicTranslation } from '@/react-app/hooks/useDynamicTranslation';
import { categoryHierarchy } from '@/shared/categoryHierarchy';

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
  const [localFavoriteIds] = useState<number[]>(() => {
    const saved = localStorage.getItem('community_favorites');
    return saved ? JSON.parse(saved) : [];
  });
  const [popularResources, setPopularResources] = useState<ResourceType[]>([]);
  const [recentResources, setRecentResources] = useState<ResourceType[]>([]);
  const [guestEmail, setGuestEmail] = useState<string>(() => {
    return localStorage.getItem('community_guest_email') || '';
  });
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [selectedCost, setSelectedCost] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [showLocalOnly, setShowLocalOnly] = useState(true);
  const LOCAL_RADIUS_KM = 300;

  // Questionnaire State
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [qStep, setQStep] = useState(1);
  const [qCategory, setQCategory] = useState('');
  const [qSubCategory, setQSubCategory] = useState('');
  const [qDemographic, setQDemographic] = useState('');
  const [qCost, setQCost] = useState('');

  // Demographics mapping
  const demographics = [
    { id: 'family', label: 'Family & Children', icon: '👨‍👩‍👧‍👦', tag: 'family' },
    { id: 'senior', label: 'Seniors', icon: '🧓', tag: 'senior' },
    { id: 'veteran', label: 'Veterans', icon: '🎖️', tag: 'veteran' },
    { id: 'student', label: 'Students', icon: '🎓', tag: 'student' },
    { id: 'anyone', label: 'Anyone', icon: '🌍', tag: '' }
  ];

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategories, selectedCost, selectedTag, showFavoritesOnly, showMySubmissions, showLocalOnly]);

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
  }, [userLocation, searchParams, showFavoritesOnly, showMySubmissions, user, i18n.language, localFavoriteIds, guestEmail]);

  const resources = useMemo(() => {
    let filtered = allResources;
    if (showLocalOnly && userLocation) {
      filtered = filtered.filter(resource => {
        if (!resource.latitude || !resource.longitude) return true;
        const distance = calculateDistance(userLocation[0], userLocation[1], resource.latitude, resource.longitude);
        return distance <= LOCAL_RADIUS_KM;
      });
    }

    if (selectedCost) {
      const q = selectedCost.toLowerCase();
      filtered = filtered.filter(r => {
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
      filtered = filtered.filter(r =>
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
        setAllResources(prev => prev.filter(r => r.id !== resource.id));
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
        <motion.div data-tour="search" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <GlassCard variant="strong">
            <div className="space-y-6">
              {/* Search input and Dropdowns */}
              <div className="flex flex-col gap-4">
                <div className="w-full flex items-center gap-2 sm:gap-3 bg-white border border-slate-200 rounded-full px-3 sm:px-4 py-2.5 sm:py-3 shadow-sm hover:border-slate-300 transition-colors">
                  <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder={t('discover.searchResources')}
                    value={searchTerm}
                    onChange={(e) => {
                      const val = e.target.value;
                      setSearchTerm(val);
                      handleSearch(val);
                    }}
                    className="flex-1 bg-transparent border-none outline-none text-slate-900 placeholder-slate-400 font-medium text-sm sm:text-base"
                  />
                  {searchTerm && (
                    <button onClick={() => { setSearchTerm(''); handleSearch(''); }} className="text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="flex justify-center w-full mt-2">
                  <button
                    onClick={() => { setQStep(1); setShowQuestionnaire(true); }}
                    className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all text-sm"
                  >
                    <Compass className="w-5 h-5" />
                    Help me find a resource
                  </button>
                </div>
              </div>

              {/* Favorites / Submissions toggle */}
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide pt-2 border-t border-slate-100">
                <GlassButton
                  variant={showFavoritesOnly ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); setShowMySubmissions(false); }}
                  className={`${showFavoritesOnly ? 'bg-rose-500 !text-white border-rose-600 shadow-rose-500/30' : ''} font-medium`}
                >
                  <Heart className={`w-4 h-4 mr-2 ${showFavoritesOnly ? 'fill-white' : ''}`} /> My Favorites
                </GlassButton>
                <GlassButton
                  variant={showMySubmissions ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => {
                    if (!user && !guestEmail) {
                      setShowEmailPrompt(true);
                      return;
                    }
                    setShowMySubmissions(!showMySubmissions); setShowFavoritesOnly(false);
                  }}
                  className={`${showMySubmissions ? 'bg-indigo-600 !text-white border-indigo-700 shadow-indigo-600/30' : ''} font-medium`}
                >
                  <User className="w-4 h-4 mr-2" /> {t('discover.mySubmissions')}
                </GlassButton>
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
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 mb-8 text-center flex flex-col items-center justify-center min-h-[300px] shadow-sm">
                  <Compass className="w-16 h-16 text-slate-300 mb-6" />
                  <h2 className="text-2xl font-semibold text-slate-900 mb-4">Community Hub Ready</h2>
                  <p className="text-slate-600 font-medium max-w-lg mx-auto">Click "Help me find a resource" above to discover tailored community support.</p>
                </div>
              ) : null}

              {hasActiveFilters && (
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  <span className="text-sm font-medium text-slate-500">Filters:</span>
                  {searchTerm && <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium border border-slate-200">"{searchTerm}"</span>}
                  {selectedCost && <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium border border-slate-200 flex items-center gap-1">Cost: {selectedCost} <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setSelectedCost('')} /></span>}
                  {selectedTag && <span className="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-md text-sm font-medium border border-slate-200 flex items-center gap-1">Tag: {selectedTag} <X className="w-3.5 h-3.5 cursor-pointer text-slate-400 hover:text-slate-600" onClick={() => setSelectedTag('')} /></span>}
                  {selectedCategories.map(cat => (
                    <span key={cat} className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-md text-sm font-medium border border-blue-100 flex items-center gap-1">
                      {cat} <X className="w-3.5 h-3.5 cursor-pointer text-blue-400 hover:text-blue-600" onClick={() => { const newCats = selectedCategories.filter(c => c !== cat); setSelectedCategories(newCats); handleSearch(searchTerm, newCats); }} />
                    </span>
                  ))}
                  <button onClick={clearFilters} className="text-sm text-slate-500 font-medium hover:text-slate-900 ml-2 transition-colors">Clear All</button>
                </div>
              )}

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
                  {paginatedResources.map((resource, idx) => (
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
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100">{resource.category}</span>
                            <div className="flex items-center gap-3">
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
                          </div>

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
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-2 bg-white border border-slate-200 rounded-xl font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors text-sm"
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium text-slate-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
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
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <Star className="w-4 h-4 text-amber-500" /> Popular In Local
                    </h3>
                    <div className="space-y-4">
                      {popularResources.map(r => (
                        <div key={r.id} onClick={() => handleResourceClick(r)} className="flex gap-3 cursor-pointer group">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-200 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                            <Compass className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                          </div>
                          <div className="min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-blue-600 transition-colors">{r.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{r.category}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                      <Clock className="w-4 h-4 text-indigo-500" /> Recently Added
                    </h3>
                    <div className="space-y-4">
                      {recentResources.map(r => (
                        <div key={r.id} onClick={() => handleResourceClick(r)} className="flex gap-3 cursor-pointer group">
                          <div className="w-10 h-10 bg-slate-50 rounded-xl flex-shrink-0 flex items-center justify-center border border-slate-200 group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                            <Heart className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                          </div>
                          <div className="min-w-0 flex flex-col justify-center">
                            <p className="text-sm font-medium text-slate-900 truncate group-hover:text-indigo-600 transition-colors">{r.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{r.category}</p>
                          </div>
                        </div>
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
      <GuestAuthModal isOpen={authModal.isOpen} onClose={() => setAuthModal(prev => ({ ...prev, isOpen: false }))} title={authModal.title} message={authModal.message} type={authModal.type} />

      {/* Questionnaire Modal */}
      <AnimatePresence>
        {showQuestionnaire && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowQuestionnaire(false)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative z-[101] overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center text-white flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Compass className="w-8 h-8" />
                  <h2 className="text-2xl font-black uppercase tracking-tight">Resource Finder</h2>
                </div>
                <button onClick={() => setShowQuestionnaire(false)} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 sm:p-8 overflow-y-auto">
                {/* Steps Progress */}
                <div className="flex items-center justify-between mb-8 relative">
                  <div className="absolute left-0 right-0 top-1/2 h-1 bg-slate-100 -z-10" />
                  {[1, 2, 3, 4, 5].map(step => (
                    <div key={step} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm z-10 transition-colors ${qStep >= step ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>{step}</div>
                  ))}
                </div>

                {qStep === 1 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight text-center">What do you need help with?</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      {categoryHierarchy.map(cat => (
                        <button key={cat.id} onClick={() => { setQCategory(cat.label); setQSubCategory(''); setQStep(2); }} className={`p-4 rounded-2xl border-2 text-center transition-all ${qCategory === cat.label ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-400 bg-white'}`}>
                          <span className="font-black uppercase tracking-widest text-sm">{cat.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {qStep === 2 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight text-center">Any specific needs?</h3>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button onClick={() => { setQSubCategory(''); setQStep(3); }} className={`p-4 rounded-2xl border-2 text-center transition-all ${qSubCategory === '' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-400 bg-white'}`}>
                        <span className="font-black uppercase tracking-widest text-sm">All {qCategory}</span>
                      </button>
                      {categoryHierarchy.find(c => c.label === qCategory)?.children?.map(child => (
                        <button key={child.id} onClick={() => { setQSubCategory(child.label); setQStep(3); }} className={`p-4 rounded-2xl border-2 text-center transition-all ${qSubCategory === child.label ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-400 bg-white'}`}>
                          <span className="font-black uppercase tracking-widest text-sm">{child.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {qStep === 3 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight text-center">Who is this for?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {demographics.map(demo => (
                        <button key={demo.id} onClick={() => { setQDemographic(demo.tag); setQStep(4); }} className={`p-4 rounded-2xl border-2 text-center flex flex-col items-center gap-2 transition-all ${qDemographic === demo.tag ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-indigo-400 bg-white'}`}>
                          <span className="text-3xl">{demo.icon}</span>
                          <span className="font-black uppercase tracking-widest text-xs">{demo.label}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {qStep === 4 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                    <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight text-center">Cost Preference?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      {['', 'free', 'sliding'].map(cost => (
                        <button key={cost} onClick={() => { setQCost(cost); setQStep(5); }} className={`p-4 rounded-2xl border-2 text-center transition-all ${qCost === cost ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-400 bg-white'}`}>
                          <span className="font-black uppercase tracking-widest text-sm">{cost === '' ? 'Any Cost' : cost === 'free' ? 'Free Only' : 'Sliding Scale'}</span>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}

                {qStep === 5 && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-center">
                    <h3 className="text-3xl font-black text-slate-900 mb-4 uppercase tracking-tight">Ready to Search!</h3>
                    <p className="text-slate-600 font-bold mb-8">We've tailored the results based on your answers.</p>
                    <div className="flex justify-center gap-4">
                      <button onClick={() => setQStep(4)} className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-black rounded-xl uppercase tracking-widest transition-colors">Back</button>
                      <button onClick={() => {
                        const finalCategory = qSubCategory || qCategory;
                        setSelectedCategories(finalCategory ? [finalCategory] : []);
                        setSelectedTag(qDemographic);
                        setSelectedCost(qCost);
                        handleSearch(searchTerm, finalCategory ? [finalCategory] : []);
                        setShowQuestionnaire(false);
                      }} className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 uppercase tracking-widest transition-colors">
                        <Search className="w-5 h-5" /> Show Results
                      </button>
                    </div>
                  </motion.div>
                )}
              </div>
              {qStep < 5 && (
                <div className="bg-slate-50 p-4 border-t border-slate-100 flex justify-between">
                  {qStep > 1 ? <button onClick={() => setQStep(prev => prev - 1)} className="text-slate-500 font-black uppercase text-sm hover:text-slate-900">Back</button> : <span />}
                  <button onClick={() => setQStep(prev => prev + 1)} className="text-blue-600 font-black uppercase text-sm hover:text-blue-800">Skip</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
