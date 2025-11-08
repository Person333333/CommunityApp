import { motion } from 'framer-motion';
import { Search, Filter, X, MapPin, Phone, Globe, Clock, Heart, MapPinned } from 'lucide-react';
import { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import LocationRequest from '@/react-app/components/LocationRequest';
import { ResourceType, categories } from '@/shared/types';
import { useUser } from '@clerk/clerk-react';
import { useLocation, calculateDistance } from '@/react-app/hooks/useLocation';

export default function Discover() {
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [allResources, setAllResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showLocalOnly, setShowLocalOnly] = useState(true);
  const { user } = useUser();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  // Only fetch resources when we have user location
  useEffect(() => {
    if (!userLocation) {
      setAllResources([]);
      return;
    }

    const fetchResources = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchParams.get('q')) params.append('q', searchParams.get('q')!);
      if (searchParams.get('category')) params.append('category', searchParams.get('category')!);

      const response = await fetch(`/api/resources?${params}`);
      const data = await response.json();
      let list: ResourceType[] = data.filter((r: ResourceType) => r.address && r.latitude && r.longitude);
      
      // Optionally filter by favorites
      if (showFavoritesOnly && !user) {
        setAllResources([]);
        setLoading(false);
        return;
      }
      if (showFavoritesOnly && user) {
        try {
          const res = await fetch(`/api/favorites?userId=${encodeURIComponent(user.id)}`);
          if (!res.ok) throw new Error('Failed to load favorites');
          const ids = (await res.json()) as number[];
          list = list.filter(r => ids.includes(r.id));
        } catch (_) {
          // ignore filtering if favorites API fails
        }
      }
      setAllResources(list);
      setLoading(false);
    };

    fetchResources();
  }, [userLocation, searchParams, showFavoritesOnly, user]);


  // Filter resources by distance
  const LOCAL_RADIUS_KM = 300;
  const resources = useMemo(() => {
    let filtered = allResources;
    
    // Apply local filter if enabled
    if (showLocalOnly && userLocation) {
      filtered = filtered.filter(resource => {
        if (!resource.latitude || !resource.longitude) return false;
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
      const res = await fetch(`/api/favorites?userId=${encodeURIComponent(user.id)}`);
      if (!res.ok) throw new Error('Failed');
      const ids = await res.json();
      setFavoriteIds(ids);
    } catch (_) {
      setFavoriteIds([]);
    }
  };

  useEffect(() => {
    fetchFavorites();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('q', searchTerm);
    if (selectedCategory) params.append('category', selectedCategory);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = searchTerm || selectedCategory;

  // Don't render discover page until we have location
  if (locationLoading || !userLocation) {
    return (
      <LocationRequest
        onRequestLocation={requestLocation}
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
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            Discover Resources
          </h1>
          <p className="text-xl text-slate-300">
            Find the support services you need in your community
          </p>
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
                    <p className="text-slate-100 font-medium">
                      Showing local resources only (within ~200 miles)
                    </p>
                    <p className="text-sm text-slate-400">
                      {resources.length} of {allResources.length} resources in your area
                    </p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLocalOnly(false)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-slate-100 text-sm font-medium transition-colors flex-shrink-0"
                >
                  Show All
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
        >
          <GlassCard variant="strong">
            <div className="space-y-4">
              {/* Search input */}
              <div className="flex gap-2">
                <div className="flex-1 flex items-center gap-3 glass-teal rounded-full px-4 py-3">
                  <Search className="w-5 h-5 text-teal-300 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-400"
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
                <GlassButton variant="primary" onClick={handleSearch}>
                  Search
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-5 h-5" />
                </GlassButton>
                <GlassButton
                  variant={showFavoritesOnly ? 'primary' : 'secondary'}
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                >
                  <Heart className="w-5 h-5" />
                </GlassButton>
                {!showLocalOnly && (
                  <GlassButton
                    variant="secondary"
                    onClick={() => setShowLocalOnly(true)}
                  >
                    <MapPinned className="w-5 h-5" />
                  </GlassButton>
                )}
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
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                      {categories.map((category) => (
                        <motion.button
                          key={category}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedCategory(selectedCategory === category ? '' : category);
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            selectedCategory === category
                              ? 'bg-gradient-to-r from-teal-600 to-amber-600 text-white'
                              : 'glass-teal text-slate-200 hover:glass-strong'
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
                  <span className="text-sm text-slate-400">Active filters:</span>
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
                  {selectedCategory && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="glass-teal px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      {selectedCategory}
                      <button onClick={() => { setSelectedCategory(''); handleSearch(); }}>
                        <X className="w-4 h-4" />
                      </button>
                    </motion.span>
                  )}
                  <button
                    onClick={clearFilters}
                    className="text-sm text-teal-300 hover:text-teal-200 underline"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>
          </GlassCard>
        </motion.div>

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
              <p className="text-xl text-slate-300">
                No resources found. Try adjusting your search or filters.
              </p>
            </GlassCard>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-slate-400 mb-4"
              >
                Found {resources.length} resource{resources.length !== 1 ? 's' : ''}
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
                        <span className="absolute top-3 left-3 z-10 text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">Featured</span>
                      )}
                      {/* Favorite toggle - visible always; prompts sign-in if needed */}
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          if (!user) {
                            if (window.confirm('Please sign in to save favorites. Go to Sign In now?')) {
                              window.location.href = '/sign-in';
                            }
                            return;
                          }
                          const isFav = favoriteIds.includes(resource.id);
                          try {
                            if (isFav) {
                              await fetch(`/api/favorites/${resource.id}?userId=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
                            } else {
                              await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, resourceId: resource.id }) });
                            }
                          } finally {
                            fetchFavorites();
                          }
                        }}
                        className={`absolute top-3 right-3 z-10 p-2 rounded-full pointer-events-auto ${user && favoriteIds.includes(resource.id) ? 'bg-amber-500/30' : 'glass'}`}
                        aria-label="Toggle favorite"
                      >
                        <Heart className={`w-5 h-5 ${user && favoriteIds.includes(resource.id) ? 'text-amber-400' : 'text-slate-300'}`} />
                      </button>
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
                          <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                            {resource.category}
                          </span>
                          <h3 className="text-xl font-bold text-slate-100 mt-1">
                            {resource.title}
                          </h3>
                        </div>

                        <p className="text-slate-300 text-sm line-clamp-3">
                          {resource.description}
                        </p>

                        <div className="space-y-2 pt-2">
                          {resource.address && (
                            <div className="flex items-start gap-2 text-sm text-slate-400">
                              <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-teal-400" />
                              <span>{resource.address}, {resource.city}, {resource.state}</span>
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
                                Visit Website
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
                            <div className="text-slate-200 text-sm font-semibold mb-1">Services Offered</div>
                            <div className="flex flex-wrap gap-1">
                              {resource.services.split(',').map((service, i) => (
                                <span
                                  key={i}
                                  className="text-xs px-2 py-1 glass-ochre rounded-full text-slate-300"
                                >
                                  {service.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {resource.tags && (
                          <div className="pt-1">
                            <div className="text-slate-200 text-sm font-semibold mb-1">Tags</div>
                            <div className="flex flex-wrap gap-1">
                              {resource.tags.split(',').map((tag, i) => (
                                <span key={i} className="text-xs px-2 py-1 glass rounded-full text-slate-300">
                                  {tag.trim()}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
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
                            Visit Website
                          </a>
                        )}
                        {resource.phone && (
                          <a
                            href={`tel:${resource.phone}`}
                            className="glass px-3 py-2 rounded-lg text-sm text-slate-100 hover:glass-strong"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Call Now
                          </a>
                        )}
                        {resource.email && (
                          <a
                            href={`mailto:${resource.email}`}
                            className="glass px-3 py-2 rounded-lg text-sm text-slate-100 hover:glass-strong"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Send Email
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
    </div>
  );
}
