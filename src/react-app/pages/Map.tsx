import { motion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';
import { MapPin, Navigation, Phone, Globe, Layers, BarChart3, MapPinned } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import MapComponent from '@/react-app/components/MapComponent';
import LocationRequest from '@/react-app/components/LocationRequest';
import { ResourceType } from '@/shared/types';
import { useLocation, calculateDistance } from '@/react-app/hooks/useLocation';

export default function Map() {
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation } = useLocation();
  const [allResources, setAllResources] = useState<ResourceType[]>([]);
  const [resourcesLoading, setResourcesLoading] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showLocalOnly, setShowLocalOnly] = useState(true);

  // Only fetch resources when we have user location
  useEffect(() => {
    if (!userLocation) {
      setAllResources([]);
      return;
    }

    setResourcesLoading(true);
    fetch('/api/resources')
      .then(res => res.json())
      .then(data => {
        const filtered = data.filter((r: ResourceType) => r.address && r.latitude && r.longitude);
        setAllResources(filtered);
        setResourcesLoading(false);
      })
      .catch(() => {
        setResourcesLoading(false);
      });
  }, [userLocation]);

  // Filter resources based on local filter toggle
  // Local means within approximately 300km (about 200 miles) - roughly state-level area
  const LOCAL_RADIUS_KM = 300;
  const resources = useMemo(() => {
    // If local filter is off, show all resources
    if (!showLocalOnly || !userLocation) {
      return allResources;
    }
    
    // Filter resources within the local radius
    return allResources.filter(resource => {
      if (!resource.latitude || !resource.longitude) return false;
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        resource.latitude,
        resource.longitude
      );
      return distance <= LOCAL_RADIUS_KM;
    });
  }, [allResources, showLocalOnly, userLocation]);

  // Don't render map until we have location
  if (locationLoading || !userLocation) {
    return (
      <LocationRequest
        onRequestLocation={requestLocation}
        loading={locationLoading}
        error={locationError}
      />
    );
  }

  const mapCenter = userLocation;

  const handleResourceClick = (resource: ResourceType) => {
    setSelectedResource(resource);
  };

  const categoryStats = resources.reduce((acc, resource) => {
    acc[resource.category] = (acc[resource.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
            Interactive Map
          </h1>
          <p className="text-xl text-slate-300">
            Explore community resources with advanced mapping features
          </p>
        </motion.div>

        {/* Local Filter Notice */}
        {showLocalOnly && allResources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
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

        {/* Map Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex flex-wrap gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowHeatmap(!showHeatmap)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                showHeatmap 
                  ? 'bg-teal-500/20 border-teal-400/50 text-teal-300' 
                  : 'glass border-white/10 text-slate-300 hover:border-teal-400/30'
              } border`}
            >
              <BarChart3 className="w-4 h-4" />
              Density View
            </motion.button>
            
            {!showLocalOnly && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowLocalOnly(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg glass border border-white/10 text-slate-300 hover:border-teal-400/30 transition-all"
              >
                <MapPinned className="w-4 h-4" />
                Show Local Only
              </motion.button>
            )}
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-2 glass px-4 py-2 rounded-lg border border-white/10"
            >
              <Layers className="w-4 h-4 text-teal-400" />
              <span className="text-slate-300">{resources.length} Resources</span>
            </motion.div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2"
          >
            <GlassCard variant="strong" className="aspect-[4/3] lg:aspect-auto lg:h-[600px]">
              {resourcesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full"
                  />
                </div>
              ) : (
                <MapComponent
                  resources={resources}
                  onResourceClick={handleResourceClick}
                  center={mapCenter}
                  zoom={13}
                  showHeatmap={showHeatmap}
                />
              )}
            </GlassCard>
          </motion.div>

          {/* Resource List & Stats */}
          <div className="space-y-6">
            {/* Category Statistics */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <GlassCard>
                <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                  Resource Distribution
                </h3>
                <div className="space-y-2">
                  {Object.entries(categoryStats)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 6)
                    .map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm text-slate-300">{category}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-amber-500 rounded-full"
                            style={{
                              width: `${(count / Math.max(...Object.values(categoryStats))) * 100}%`
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-teal-300 w-6 text-right">
                          {count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Resource List */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-slate-100 mb-4 flex items-center gap-2">
                <Navigation className="w-6 h-6 text-teal-400" />
                Nearby Resources ({resources.length})
              </h2>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {resources.map((resource, index) => (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.02 }}
                  >
                    <GlassCard
                      hover
                      variant={selectedResource?.id === resource.id ? 'teal' : 'default'}
                      className="cursor-pointer"
                      onClick={() => handleResourceClick(resource)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-100 truncate">
                              {resource.title}
                            </h3>
                            <p className="text-sm text-slate-400 truncate">
                              {resource.address}, {resource.city}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="inline-block text-xs px-2 py-1 glass-ochre rounded-full text-slate-300">
                            {resource.category}
                          </span>
                          {resource.is_featured && (
                            <span className="inline-block text-xs px-2 py-1 bg-amber-500/20 text-amber-300 rounded-full">
                              Featured
                            </span>
                          )}
                        </div>

                        {selectedResource?.id === resource.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="pt-3 border-t border-white/10 space-y-2"
                          >
                            <p className="text-sm text-slate-300 line-clamp-2">
                              {resource.description}
                            </p>
                            
                            {resource.audience && (
                              <p className="text-xs text-slate-400">
                                <span className="font-medium">Target:</span> {resource.audience}
                              </p>
                            )}
                            
                            {resource.hours && (
                              <p className="text-xs text-slate-400">
                                <span className="font-medium">Hours:</span> {resource.hours}
                              </p>
                            )}
                            
                            <div className="flex gap-2 pt-2">
                              {resource.phone && (
                                <motion.a
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  href={`tel:${resource.phone}`}
                                  className="flex items-center gap-1 text-xs bg-green-500/20 text-green-300 border border-green-400/30 px-2 py-1 rounded-full hover:bg-green-500/30 transition-colors"
                                >
                                  <Phone className="w-3 h-3" />
                                  Call
                                </motion.a>
                              )}
                              
                              {resource.website && (
                                <motion.a
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  href={resource.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-1 rounded-full hover:bg-blue-500/30 transition-colors"
                                >
                                  <Globe className="w-3 h-3" />
                                  Visit
                                </motion.a>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
