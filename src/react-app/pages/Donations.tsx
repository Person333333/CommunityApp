import { motion } from 'framer-motion';
import { Heart, Users, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router';
import { SignedIn, SignedOut } from '@clerk/clerk-react';

export const mockCauses = [
  {
    id: 'food-bank',
    title: "Bothell Food Bank",
    category: "Hunger Relief",
    color: "emerald",
    subtitle: "Every $25 feeds a family for a week",
    description: "Emergency food assistance for 250 families every week. Fresh produce, canned goods, and essential staples distributed with dignity.",
    raised: 3369,
    goal: 5000,
    supporters: 89,
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 'youth-mentorship',
    title: "Youth Tech Mentorship",
    category: "Youth Programs",
    color: "blue",
    subtitle: "$100 funds one mentor for a month",
    description: "After-school programs connecting 200 at-risk youth with professional mentors, tutors, and skill-building workshops focusing on digital literacy.",
    raised: 8900,
    goal: 12000,
    supporters: 156,
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 'senior-care',
    title: "Northshore Senior Companions",
    category: "Senior Care",
    color: "purple",
    subtitle: "$30 delivers meals + companionship",
    description: "150 isolated seniors receive weekly home visits, warm meals, and the human connection that makes all the difference.",
    raised: 2700,
    goal: 4000,
    supporters: 62,
    image: "https://images.unsplash.com/photo-1516307365426-bea591f05011?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 'park-restoration',
    title: "Saint Edward Park Restoration",
    category: "Parks & Rec",
    color: "emerald",
    subtitle: "$200 funds new trail signage",
    description: "Revitalizing local state park trails, accessibility ramps, and clearing invasive species to maintain green spaces for every family.",
    raised: 9800,
    goal: 15000,
    supporters: 203,
    image: "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 'homeless-aid',
    title: "City Center Homeless Aid",
    category: "Housing Support",
    color: "rose",
    subtitle: "$75 provides 3 nights housing + meals",
    description: "Emergency shelter beds, hot meals, and case management services for 80 unhoused community members each month.",
    raised: 6700,
    goal: 10000,
    supporters: 98,
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 'paws-rescue',
    title: "PAWS Regional Pet Shelter",
    category: "Animal Rescue",
    color: "indigo",
    subtitle: "$50 vaccinates & feeds one dog",
    description: "Emergency veterinary care, vaccinations, and loving temporary homes for 150 rescued animals awaiting adoption.",
    raised: 5200,
    goal: 8000,
    supporters: 124,
    image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 'art-supply',
    title: "Public School Art Funds",
    category: "Education",
    color: "rose",
    subtitle: "$15 buys a student an art kit",
    description: "Ensuring every elementary student in the district has access to high-quality paints, sketchbooks, and creative materials.",
    raised: 1200,
    goal: 3000,
    supporters: 45,
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 'mental-health',
    title: "Community Crisis Clinic",
    category: "Health",
    color: "blue",
    subtitle: "$50 funds a free therapy session",
    description: "Providing accessible, sliding-scale mental health counseling for underinsured residents dealing with anxiety or depression.",
    raised: 14500,
    goal: 20000,
    supporters: 312,
    image: "https://images.unsplash.com/photo-1573497620053-ea5300f94f21?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: 'disaster-relief',
    title: "Local Flood Relief Fund",
    category: "Urgent",
    color: "purple",
    subtitle: "Immediate aid for affected families",
    description: "Assisting 30 local families displaced by recent river flooding with hotel vouchers, dry clothing, and rebuilding supplies.",
    raised: 28000,
    goal: 50000,
    supporters: 450,
    image: "https://images.unsplash.com/photo-1548817342-6e27a6f2b4c1?q=80&w=800&auto=format&fit=crop"
  }
];

export default function DonationsPage() {
  return (
    <div className="pt-24 pb-16 min-h-screen relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      
      {/* Background Ambient Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute top-[40%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-500/10 blur-[150px] pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Header section */}
        <div className="text-center max-w-3xl mx-auto mb-16 text-balance">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-layer border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold tracking-widest uppercase text-xs mb-6 shadow-[0_0_20px_rgba(16,185,129,0.2)] bg-card"
            >
                <Heart className="w-4 h-4 text-emerald-500" /> Community Impact Fund
            </motion.div>
            <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-4xl md:text-6xl font-black tracking-tighter text-foreground leading-tight mb-4"
            >
                Empower Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-indigo-500">Neighborhood</span>
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground font-medium text-sm md:text-base max-w-xl mx-auto"
            >
                100% of your tax-deductible donation goes directly to the organizations doing the groundwork. Choose a cause that speaks to your heart.
            </motion.p>
        </div>

        {/* Compact Grid Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockCauses.map((cause, index) => {
            const progress = Math.min(Math.round((cause.raised / cause.goal) * 100), 100);

            return (
              <motion.div
                key={cause.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: (index % 6) * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass-layer rounded-3xl border border-border group flex flex-col bg-card overflow-hidden shadow-xl"
              >
                {/* Image Header */}
                <div className="h-32 w-full relative overflow-hidden bg-muted">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  {cause.image ? (
                    <img 
                      src={cause.image} 
                      alt={cause.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground"><ImageIcon className="w-12 h-12 opacity-50" /></div>
                  )}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="py-1 px-3 rounded-full text-[10px] font-black uppercase tracking-widest text-white shadow-lg border border-white/20 backdrop-blur-md bg-black/40">
                      {cause.category}
                    </div>
                  </div>
                </div>

                {/* Content Panel */}
                <div className="p-5 flex flex-col flex-grow relative">
                  <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] rounded-full pointer-events-none opacity-10 transition-opacity group-hover:opacity-20
                    ${cause.color === 'emerald' ? 'bg-emerald-500' : 
                      cause.color === 'blue' ? 'bg-blue-500' : 
                      cause.color === 'purple' ? 'bg-purple-500' : 
                      cause.color === 'rose' ? 'bg-rose-500' : 'bg-indigo-500'}`} 
                  />

                  <div className="relative z-10 flex-grow">
                     <h3 className="text-lg font-black text-foreground leading-tight mb-1 truncate">{cause.title}</h3>
                     <p className={`text-[10px] font-bold mb-2 truncate
                        ${cause.color === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' : 
                          cause.color === 'blue' ? 'text-blue-600 dark:text-blue-400' : 
                          cause.color === 'purple' ? 'text-purple-600 dark:text-purple-400' : 
                          cause.color === 'rose' ? 'text-rose-600 dark:text-rose-400' : 'text-indigo-600 dark:text-indigo-400'}
                     `}>{cause.subtitle}</p>
                     
                     <p className="text-muted-foreground font-medium text-[11px] leading-relaxed mb-4 line-clamp-2">
                       {cause.description}
                     </p>
                  </div>

                  {/* Fund Details */}
                  <div className="relative z-10 mt-auto">
                      <div className="flex justify-between items-end mb-2">
                          <div>
                            <span className="text-xl font-black text-foreground">${cause.raised.toLocaleString()}</span>
                          </div>
                          <div className="text-right">
                             <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Goal ${cause.goal.toLocaleString()}</span>
                          </div>
                      </div>

                      {/* Animated Progress Track */}
                      <div className="h-2 w-full bg-secondary rounded-full overflow-hidden mb-3 relative drop-shadow-inner border border-border/50">
                          <motion.div 
                              initial={{ width: 0 }}
                              whileInView={{ width: `${progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.2 }}
                              className={`absolute top-0 left-0 h-full rounded-full 
                                ${cause.color === 'emerald' ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 
                                  cause.color === 'blue' ? 'bg-gradient-to-r from-blue-600 to-blue-400' : 
                                  cause.color === 'purple' ? 'bg-gradient-to-r from-purple-600 to-purple-400' : 
                                  cause.color === 'rose' ? 'bg-gradient-to-r from-rose-600 to-rose-400' : 
                                  'bg-gradient-to-r from-indigo-600 to-indigo-400'}
                              `}
                          />
                      </div>

                      <div className="flex justify-between items-center text-xs font-bold text-muted-foreground mb-4">
                          <span className="flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5" /> 
                            {cause.supporters} donors
                          </span>
                          <span>{progress}%</span>
                      </div>

                      {/* Authentication Protection for Donations */}
                      <SignedIn>
                        <Link 
                            to={`/checkout?cause=${cause.id}`}
                            className={`w-full py-2.5 rounded-lg font-black text-center uppercase tracking-widest text-[10px] transition-all shadow-lg flex items-center justify-center gap-2 group text-white
                                ${cause.color === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 
                                cause.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20' : 
                                cause.color === 'purple' ? 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20' : 
                                cause.color === 'rose' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 
                                'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20'}
                            `}
                        >
                            Donate Now <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </SignedIn>

                      <SignedOut>
                        <Link 
                            to="/sign-in"
                            className="w-full py-2.5 rounded-lg font-black text-center uppercase tracking-widest text-[10px] transition-colors shadow-lg flex items-center justify-center gap-2 group glass-layer border border-border text-foreground hover:bg-muted"
                        >
                            Sign In to Donate
                        </Link>
                      </SignedOut>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
