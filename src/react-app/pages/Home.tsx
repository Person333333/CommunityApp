import { motion } from 'framer-motion';
import { Search, MapPin, Heart, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';
import AnimatedCompass from '@/react-app/components/AnimatedCompass';
import GlassButton from '@/react-app/components/GlassButton';
import GlassCard from '@/react-app/components/GlassCard';
import ResourceDetailModal from '@/react-app/components/ResourceDetailModal';
import LocationRequest from '@/react-app/components/LocationRequest';
import { useEffect, useState, useMemo } from 'react';
import { ResourceType } from '@/shared/types';
import { useLocation, calculateDistance } from '@/react-app/hooks/useLocation';
import { fetchResourcesFromDB, fetchStatsFromDB } from '@/react-app/services/database';

export default function Home() {
  const { location: userLocation, loading: locationLoading, error: locationError, requestLocation } = useLocation();
  const [allFeaturedResources, setAllFeaturedResources] = useState<ResourceType[]>([]);
  const [stats, setStats] = useState({ totalResources: 0, categories: [] });
  const [selectedResource, setSelectedResource] = useState<ResourceType | null>(null);

  // Only fetch featured resources when we have user location
  useEffect(() => {
    if (!userLocation) {
      setAllFeaturedResources([]);
      return;
    }

    // Fetch featured resources and stats
    const fetchData = async () => {
      try {
        const [featuredData, statsData] = await Promise.all([
          fetchResourcesFromDB({ featured: true }),
          fetchStatsFromDB()
        ]);
        
        const filtered = featuredData.filter((r: ResourceType) => r.address && r.latitude && r.longitude);
        setAllFeaturedResources(filtered);
        setStats(statsData as { totalResources: number; categories: string[] });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, [userLocation]);

  // Filter featured resources by distance - only show local featured resources
  const LOCAL_RADIUS_KM = 300;
  const featuredResources = useMemo(() => {
    if (!userLocation || allFeaturedResources.length === 0) {
      return [];
    }
    
    // Only show local featured resources
    return allFeaturedResources.filter(resource => {
      if (!resource.latitude || !resource.longitude) return false;
      const distance = calculateDistance(
        userLocation[0],
        userLocation[1],
        resource.latitude,
        resource.longitude
      );
      return distance <= LOCAL_RADIUS_KM;
    }).slice(0, 3); // Limit to 3 for display
  }, [allFeaturedResources, userLocation]);

  // Don't render home page content until we have location
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
    <div className="min-h-screen">
      {/* Hero Section with Parallax */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Animated background gradients */}
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(15, 118, 110, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(245, 158, 11, 0.3) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(15, 118, 110, 0.3) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Compass animation */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="mb-12"
            >
              <AnimatedCompass />
            </motion.div>

            {/* Hero text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center space-y-6"
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="block text-amber-400 mb-2">Find Your Path</span>
                <span className="block gradient-text">to Community Support</span>
              </h1>
              
              <p className="text-xl sm:text-2xl text-slate-300 max-w-3xl mx-auto">
                Discover local resources, connect with support services, and find the help you need—all in one place
              </p>

              {/* Search bar */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="max-w-2xl mx-auto mt-8"
              >
                <div className="glass-strong rounded-full p-2 flex items-center gap-2">
                  <Search className="w-6 h-6 text-teal-300 ml-4" />
                  <input
                    type="text"
                    placeholder="Search for food banks, housing, healthcare, and more..."
                    className="flex-1 bg-transparent border-none outline-none text-slate-100 placeholder-slate-400 px-4 py-3"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const value = e.currentTarget.value;
                        if (value) {
                          window.location.href = `/discover?q=${encodeURIComponent(value)}`;
                        }
                      }
                    }}
                  />
                  <Link to="/discover">
                    <GlassButton variant="primary" size="md">
                      Explore
                    </GlassButton>
                  </Link>
                </div>
              </motion.div>

              {/* Quick stats */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex justify-center gap-8 mt-8 text-sm text-slate-300"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-teal-400" />
                  <span>{stats.totalResources}+ Resources</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" />
                  <span>12+ Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-teal-400" />
                  <span>Local Support</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-teal-400/50 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-1.5 bg-teal-400 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Resources Spotlight */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-4">
              Spotlight Resources
            </h2>
            <p className="text-xl text-slate-300">
              Making an impact in our community
            </p>
          </motion.div>

          {featuredResources.length === 0 ? (
            <GlassCard variant="teal" className="text-center py-12">
              <p className="text-xl text-slate-300">
                No local featured resources found in your area. Check back soon!
              </p>
            </GlassCard>
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredResources.map((resource, index) => (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 30, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                <GlassCard 
                  hover 
                  variant="teal" 
                  className="h-full cursor-pointer"
                  onClick={() => setSelectedResource(resource)}
                >
                  <div className="space-y-4">
                    {resource.image_url && (
                      <div className="aspect-video rounded-lg overflow-hidden">
                        <img
                          src={resource.image_url}
                          alt={resource.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <span className="text-xs font-semibold text-amber-400 uppercase tracking-wide">
                        {resource.category}
                      </span>
                      <h3 className="text-2xl font-bold text-slate-100 mt-2">
                        {resource.title}
                      </h3>
                    </div>
                    <p className="text-slate-300 line-clamp-3">
                      {resource.description}
                    </p>
                    <div className="flex items-center justify-between pt-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedResource(resource);
                        }}
                        className="text-teal-300 hover:text-teal-200 flex items-center gap-2 group"
                      >
                        Learn More
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
          )}

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-center mt-12"
          >
            <Link to="/discover">
              <GlassButton variant="primary" size="lg">
                View All Resources
              </GlassButton>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-4xl">
          <GlassCard variant="strong" className="text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-100 mb-4">
                Know a Resource That Should Be Listed?
              </h2>
              <p className="text-lg text-slate-300 mb-8">
                Help us build a comprehensive directory by submitting community resources
              </p>
              <Link to="/submit">
                <GlassButton variant="primary" size="lg">
                  Submit a Resource
                </GlassButton>
              </Link>
            </motion.div>
          </GlassCard>
        </div>
      </section>

      {/* Resource Detail Modal */}
      <ResourceDetailModal
        resource={selectedResource}
        isOpen={!!selectedResource}
        onClose={() => setSelectedResource(null)}
      />
    </div>
  );
}
