import { motion } from 'framer-motion';
import { Search, Filter, X, MapPin, Phone, Globe, Clock, Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import GlassCard from '@/react-app/components/GlassCard';
import GlassButton from '@/react-app/components/GlassButton';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import { ResourceType, categories } from '@/shared/types';
import { useUser } from '@clerk/clerk-react';

export default function Discover() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [resources, setResources] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const { user } = useUser();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  useEffect(() => {
    fetchResources();
  }, [searchParams]);

  const fetchResources = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (searchParams.get('q')) params.append('q', searchParams.get('q')!);
    if (searchParams.get('category')) params.append('category', searchParams.get('category')!);

    const response = await fetch(`/api/resources?${params}`);
    const data = await response.json();
    let list: ResourceType[] = data;
    // Optionally filter by favorites
    if (showFavoritesOnly && user) {
      const ids = await (async () => {
        const res = await fetch(`/api/favorites?userId=${encodeURIComponent(user.id)}`);
        return (await res.json()) as number[];
      })();
      list = list.filter(r => ids.includes(r.id));
    }
    setResources(list);
    setLoading(false);
  };

  const fetchFavorites = async () => {
    if (!user) return setFavoriteIds([]);
    const res = await fetch(`/api/favorites?userId=${encodeURIComponent(user.id)}`);
    const ids = await res.json();
    setFavoriteIds(ids);
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
                  onClick={() => { setShowFavoritesOnly(!showFavoritesOnly); fetchResources(); }}
                >
                  <Heart className="w-5 h-5" />
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
                      {/* Favorite toggle */}
                      {user && (
                        <button
                          onClick={async (e) => {
                            e.stopPropagation();
                            const isFav = favoriteIds.includes(resource.id);
                            if (isFav) {
                              await fetch(`/api/favorites/${resource.id}?userId=${encodeURIComponent(user.id)}`, { method: 'DELETE' });
                            } else {
                              await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: user.id, resourceId: resource.id }) });
                            }
                            fetchFavorites();
                          }}
                          className={`absolute top-3 right-3 z-10 p-2 rounded-full ${favoriteIds.includes(resource.id) ? 'bg-amber-500/30' : 'glass'}`}
                          aria-label="Toggle favorite"
                        >
                          <Heart className={`w-5 h-5 ${favoriteIds.includes(resource.id) ? 'text-amber-400' : 'text-slate-300'}`} />
                        </button>
                      )}
                      {resource.image_url && (
                        <div className="aspect-video rounded-lg overflow-hidden mb-4 -mx-6 -mt-6">
                          <img
                            src={resource.image_url}
                            alt={resource.title}
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
                        </div>

                        {resource.services && (
                          <div className="flex flex-wrap gap-1 pt-2">
                            {resource.services.split(',').slice(0, 3).map((service, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 glass-ochre rounded-full text-slate-300"
                              >
                                {service.trim()}
                              </span>
                            ))}
                          </div>
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
