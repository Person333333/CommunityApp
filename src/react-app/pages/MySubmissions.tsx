import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useNavigate } from 'react-router';
import { Trash2, Loader2, MapPin, Phone, Globe, Clock, User as UserIcon } from 'lucide-react';
import GlassCard from '@/react-app/components/GlassCard';
import { unifiedResourceService } from '@/react-app/services/unifiedResourceService';
import type { ResourceType } from '@/shared/types';

export default function MySubmissions() {
    const { user, isLoaded } = useUser();
    const navigate = useNavigate();
    const [resources, setResources] = useState<ResourceType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);

    useEffect(() => {
        if (!isLoaded) return;

        if (!user) {
            navigate('/sign-in');
            return;
        }

        fetchMySubmissions();
    }, [user, isLoaded, navigate]);

    const fetchMySubmissions = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const submissions = await unifiedResourceService.getUserSubmissions(user.id);
            setResources(submissions as ResourceType[]);
        } catch (error) {
            console.error('Failed to fetch submissions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (resourceId: number) => {
        if (!user || !window.confirm('Are you sure you want to delete this resource? This action cannot be undone.')) {
            return;
        }

        setIsDeleting(resourceId);
        try {
            const success = await unifiedResourceService.deleteResource(resourceId, user.id);
            if (success) {
                setResources(prev => prev.filter(r => r.id !== resourceId));
            } else {
                alert('Failed to delete resource. Please try again.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('Failed to delete resource. Please try again.');
        } finally {
            setIsDeleting(null);
        }
    };

    if (!isLoaded || loading) {
        return (
            <div className="min-h-screen pt-24 pb-16 px-4 sm:px-6 lg:px-8">
                <div className="container mx-auto max-w-7xl">
                    <div className="flex justify-center py-12">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-12 h-12 border-4 border-teal-400 border-t-transparent rounded-full"
                        />
                    </div>
                </div>
            </div>
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
                        My Submissions
                    </h1>
                    <p className="text-xl text-slate-300">
                        Manage the resources you've submitted to the community directory
                    </p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8"
                >
                    <GlassCard variant="teal" className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-teal-600 to-amber-600 rounded-full flex items-center justify-center">
                                <UserIcon className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Submissions</p>
                                <p className="text-3xl font-bold text-slate-100">{resources.length}</p>
                            </div>
                        </div>
                    </GlassCard>
                </motion.div>

                {/* Resources Grid */}
                {resources.length === 0 ? (
                    <GlassCard variant="teal" className="text-center py-12">
                        <div className="space-y-4">
                            <p className="text-xl text-slate-300">
                                You haven't submitted any resources yet
                            </p>
                            <button
                                onClick={() => navigate('/submit')}
                                className="px-6 py-3 bg-gradient-to-r from-teal-600 to-amber-600 text-white rounded-lg hover:from-teal-700 hover:to-amber-700 transition-all"
                            >
                                Submit Your First Resource
                            </button>
                        </div>
                    </GlassCard>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {resources.map((resource, index) => (
                            <motion.div
                                key={resource.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <GlassCard hover variant="teal" className="relative h-full flex flex-col">
                                    {/* Delete Button */}
                                    <button
                                        onClick={() => handleDelete(resource.id)}
                                        disabled={isDeleting === resource.id}
                                        className="absolute top-3 right-3 z-10 p-2 rounded-full glass hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                                        aria-label="Delete resource"
                                    >
                                        {isDeleting === resource.id ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <Trash2 className="w-5 h-5" />
                                        )}
                                    </button>

                                    {/* Image */}
                                    {resource.image_url && (
                                        <div className="aspect-video rounded-lg overflow-hidden mb-4 -mx-6 -mt-6">
                                            <img
                                                src={resource.image_url}
                                                alt={resource.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* Content */}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-semibold text-slate-100 mb-2 pr-8">
                                            {resource.title}
                                        </h3>
                                        <p className="text-sm text-slate-400 mb-3 line-clamp-3">
                                            {resource.description}
                                        </p>

                                        {/* Category Badge */}
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-400/30 mb-4">
                                            {resource.category}
                                        </span>

                                        {/* Details */}
                                        <div className="space-y-2 text-sm">
                                            {resource.address && (
                                                <div className="flex items-start gap-2 text-slate-300">
                                                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-400" />
                                                    <span>{resource.address}, {resource.city}, {resource.state} {resource.zip}</span>
                                                </div>
                                            )}
                                            {resource.phone && (
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Phone className="w-4 h-4 flex-shrink-0 text-teal-400" />
                                                    <span>{resource.phone}</span>
                                                </div>
                                            )}
                                            {resource.website && (
                                                <div className="flex items-center gap-2 text-slate-300">
                                                    <Globe className="w-4 h-4 flex-shrink-0 text-teal-400" />
                                                    <a
                                                        href={resource.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="hover:text-teal-300 transition-colors truncate"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        Visit Website
                                                    </a>
                                                </div>
                                            )}
                                            {resource.hours && (
                                                <div className="flex items-start gap-2 text-slate-300">
                                                    <Clock className="w-4 h-4 mt-0.5 flex-shrink-0 text-teal-400" />
                                                    <span>{resource.hours}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Status */}
                                        <div className="mt-4 pt-4 border-t border-white/10">
                                            <p className="text-xs text-slate-400">
                                                Status: <span className="text-teal-300">
                                                    {resource.is_approved ? 'Approved' : 'Pending Review'}
                                                </span>
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">
                                                Submitted: {new Date(resource.created_at || '').toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                </GlassCard>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
