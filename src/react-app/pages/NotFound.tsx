import { motion } from 'framer-motion';
import { Link } from 'react-router';
import { Compass, ArrowLeft, Search } from 'lucide-react';
import GlassButton from '@/react-app/components/GlassButton';

export default function NotFound() {
    return (
        <div className="min-h-screen pt-32 pb-16 px-4 bg-slate-50 flex items-center justify-center">
            <div className="w-full max-w-2xl text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="relative inline-block mb-8">
                        <Compass className="w-32 h-32 text-blue-200 animate-spin-slow" />
                        <Compass className="w-32 h-32 text-blue-600 absolute inset-0 mix-blend-overlay rotate-45" />
                    </div>

                    <h1 className="text-7xl sm:text-9xl font-black text-blue-900 mb-4 tracking-tighter mix-blend-multiply">
                        404
                    </h1>
                    <div className="h-1.5 w-24 bg-blue-500 rounded-full mx-auto mb-8" />

                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-4 uppercase tracking-widest">
                        We Lost Our Bearings
                    </h2>
                    <p className="text-slate-600 text-lg mb-12 font-bold max-w-lg mx-auto leading-relaxed">
                        The page you're looking for might have been moved, deleted, or possibly never existed. Let's get you back on track.
                    </p>

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link to="/">
                            <GlassButton variant="primary" size="lg" className="w-full sm:w-auto text-sm font-black uppercase tracking-widest px-8">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Return to Compass
                            </GlassButton>
                        </Link>
                        <Link to="/discover">
                            <GlassButton variant="secondary" size="lg" className="w-full sm:w-auto text-sm font-black uppercase tracking-widest px-8">
                                <Search className="w-5 h-5 mr-2" />
                                Explore Resources
                            </GlassButton>
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
