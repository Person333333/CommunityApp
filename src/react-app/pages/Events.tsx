import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Clock, Calendar as CalendarIcon, ArrowRight, Share2, Plus, Info, ChevronLeft, ChevronRight } from 'lucide-react';

const mockEvents = [
  // March 2026
  { id: 101, title: "City Council Zoning Meeting", date: "2026-03-05", time: "06:00 PM - 08:30 PM", location: "Bothell City Hall", category: "Civic", color: "blue", desc: "Open forum discussing the proposed zoning changes for the downtown business district. Public comments welcomed." },
  { id: 102, title: "Spring Tree Planting", date: "2026-03-14", time: "09:00 AM - 01:00 PM", location: "Northshore Park", category: "Environment", color: "emerald", desc: "Volunteer to plant 200 native tree saplings along the river edge to combat erosion. Tools and lunch provided." },
  { id: 103, title: "Teen Financial Literacy Workshop", date: "2026-03-22", time: "04:00 PM - 06:00 PM", location: "Bothell Library", category: "Education", color: "indigo", desc: "Local bankers teach high schoolers the basics of budgeting, compound interest, and student loans." },

  // April 2026
  { id: 1, title: "Community Cleanup Drive", date: "2026-04-04", time: "09:00 AM - 12:00 PM", location: "Bothell Landing Park", category: "Environment", color: "emerald", desc: "Join neighbors in a city-wide cleanup! We'll provide gloves, bags, and high-visibility vests. Meet at the main bandstand area." },
  { id: 2, title: "UW Bothell Spring Tech Mixer", date: "2026-04-10", time: "05:30 PM - 08:30 PM", location: "UW Bothell ARC", category: "Employment", color: "purple", desc: "Network with local tech employers, startup founders, and UW faculty. Bring your resume!" },
  { id: 3, title: "Northshore Food Drive", date: "2026-04-15", time: "10:00 AM - 02:00 PM", location: "Pop Keeney Stadium", category: "Food", color: "blue", desc: "Help stock the Hopelink Bothell food bank. Drop off non-perishable items, canned goods, and baby supplies." },
  { id: 4, title: "Clothing & Essentials Drive", date: "2026-04-18", time: "11:00 AM - 04:00 PM", location: "Community Center", category: "Housing", color: "rose", desc: "Collecting new and gently used clothing, thick socks, and hygienic supplies. All items go directly to the Northshore emergency shelter network." },
  { id: 5, title: "Earth Day River Walk", date: "2026-04-22", time: "04:30 PM - 06:30 PM", location: "Sammamish River Trail", category: "Environment", color: "emerald", desc: "Guided nature walk with a local ecologist discussing native species and conservation efforts." },
  { id: 6, title: "Local Artists Showcase", date: "2026-04-25", time: "10:00 AM - 06:00 PM", location: "Main Street Gallery", category: "Art", color: "rose", desc: "Support local painters, sculptors, and photographers. Free entry, artwork available for purchase." },

  // May 2026
  { id: 7, title: "Community Garden Workshop", date: "2026-05-02", time: "10:00 AM - 12:00 PM", location: "Bothell Resource Center", category: "Environment", color: "emerald", desc: "Learn how to start a sustainable balcony or backyard garden. Free seeds and compost given to all attendees." },
  { id: 8, title: "Small Business Mentor Session", date: "2026-05-06", time: "06:00 PM - 08:00 PM", location: "Chamber of Commerce", category: "Business", color: "indigo", desc: "Free 1-on-1 mentoring for aspiring entrepreneurs looking to start a local business." },
  { id: 9, title: "Senior Health & Wellness Fair", date: "2026-05-10", time: "09:00 AM - 01:00 PM", location: "Northshore Senior Center", category: "Health", color: "rose", desc: "Free blood pressure checks, vision screenings, and nutritional seminars for older adults in our community." },
  { id: 10, title: "Cascadia College Career Fair", date: "2026-05-15", time: "10:00 AM - 04:00 PM", location: "Cascadia College Campus", category: "Employment", color: "blue", desc: "Connect with over 40 local employers actively hiring across various industries. Resume reviews provided on-site." },
  { id: 11, title: "Bicycle Safety Rodeo", date: "2026-05-22", time: "09:00 AM - 12:30 PM", location: "City Hall Plaza", category: "Health", color: "emerald", desc: "Kids and families learn essential bike safety, get free helmet fittings, and complete a fun obstacle course." },
  { id: 12, title: "Mental Health Awareness Symposium", date: "2026-05-28", time: "05:00 PM - 08:30 PM", location: "Bothell High School Auditorium", category: "Health", color: "purple", desc: "Panel discussion with local therapists, counselors, and advocates on breaking the stigma of mental health." },

  // June 2026
  { id: 13, title: "Summer Reading Kickoff", date: "2026-06-05", time: "01:00 PM - 04:00 PM", location: "Bothell Regional Library", category: "Education", color: "indigo", desc: "Sign up for the summer reading program! Free books, ice cream, and a special storytelling performance by local authors." },
  { id: 14, title: "Riverfront Music Festival", date: "2026-06-12", time: "12:00 PM - 08:00 PM", location: "Park at Bothell Landing", category: "Community", color: "purple", desc: "A day of free, family-friendly live music showcasing local artists. Food trucks will be on site." },
  { id: 15, title: "Farmers Market Opening Day", date: "2026-06-19", time: "09:00 AM - 02:00 PM", location: "Main Street", category: "Food", color: "emerald", desc: "Celebrate the first day of the community farmers market with fresh, locally grown produce and artisanal goods." },
  { id: 16, title: "Downtown Block Party", date: "2026-06-20", time: "04:00 PM - 09:00 PM", location: "Bothell Way NE", category: "Community", color: "rose", desc: "Street fair with local vendors, games, a beer garden, and live entertainment." },
  { id: 17, title: "Housing Rights Seminar", date: "2026-06-25", time: "06:00 PM - 08:00 PM", location: "Community Center", category: "Legal", color: "blue", desc: "Free legal seminar offering guidance on tenant rights, rent assistance programs, and eviction prevention." },
  { id: 18, title: "Pride Parade & Picnic", date: "2026-06-28", time: "11:00 AM - 04:00 PM", location: "Downtown Bothell", category: "Community", color: "purple", desc: "Annual pride celebration featuring a march, community picnic, and resource fair." },

  // July 2026
  { id: 19, title: "4th of July Parade Prep", date: "2026-07-02", time: "05:00 PM - 08:00 PM", location: "Downtown Bothell", category: "Community", color: "blue", desc: "Help organizers decorate floats and set up barriers and signage for the massive regional parade." },
  { id: 20, title: "Bothell Freedom Festival", date: "2026-07-04", time: "12:00 PM - 10:00 PM", location: "Pop Keeney Stadium", category: "Community", color: "rose", desc: "Live music, food, and the region's largest professional fireworks display. Free entry." },
  { id: 21, title: "Youth Tech Boot Camp", date: "2026-07-11", time: "09:00 AM - 04:00 PM", location: "Innovation Hub", category: "Education", color: "indigo", desc: "A free all-day intensive boot camp teaching high schoolers Python web development and AI fundamentals." },
  { id: 22, title: "River Cleanup & BBQ", date: "2026-07-18", time: "10:00 AM - 03:00 PM", location: "Sammamish River Trail", category: "Environment", color: "emerald", desc: "Volunteer to clean the riverbanks, followed by a free community BBQ to celebrate the hard work." },
  { id: 23, title: "Startup Pitch Night", date: "2026-07-24", time: "06:00 PM - 09:00 PM", location: "UW Bothell East", category: "Business", color: "blue", desc: "Watch local founders pitch their community-focused startups to regional investors." },

  // August 2026
  { id: 24, title: "Back-to-School Backpack Drive", date: "2026-08-05", time: "09:00 AM - 03:00 PM", location: "Northshore District HQ", category: "Education", color: "purple", desc: "Stuffing and distributing backpacks full of school supplies for low-income families in the district." },
  { id: 25, title: "Outdoor Movie Night", date: "2026-08-14", time: "08:00 PM - 10:30 PM", location: "Bothell Landing Park", category: "Community", color: "indigo", desc: "Bring a blanket and enjoy a free family movie under the stars. Popcorn provided!" },
  { id: 26, title: "Emergency Prep Workshop", date: "2026-08-20", time: "06:00 PM - 08:00 PM", location: "Fire Station 42", category: "Civic", color: "rose", desc: "Learn CPR basics, earthquake preparedness, and how to build a 72-hour emergency kit." },
  { id: 27, title: "End of Summer Charity Run", date: "2026-08-29", time: "08:00 AM - 12:00 PM", location: "Sammamish River Trail", category: "Health", color: "blue", desc: "5K and 10K fun run raising funds for local homeless shelters. All ages welcome." }
];

export default function EventsPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 3, 1)); // April 2026 default
  const [selectedEvent, setSelectedEvent] = useState(mockEvents[3]); // Default to one event in April
  const [notification, setNotification] = useState("");

  const triggerNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(""), 3000);
  };

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Calendar logic
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0(Sun) - 6(Sat)
  
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDaysBefore = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Events in current month
  const eventsInMonth = mockEvents.filter(e => {
    const [y, m] = e.date.split('-');
    return parseInt(y) === currentYear && parseInt(m) - 1 === currentMonth;
  });

  const activeDays = eventsInMonth.map(e => parseInt(e.date.split('-')[2], 10));

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const getDayForDate = (dateStr: string) => parseInt(dateStr.split('-')[2], 10);
  
  const handleDayClick = (day: number) => {
    const evt = eventsInMonth.find(e => getDayForDate(e.date) === day);
    if(evt) setSelectedEvent(evt);
  };

  const handleDirections = (event: typeof mockEvents[0]) => {
    triggerNotification(`Opening maps for ${event.location}...`);
    const q = encodeURIComponent(event.location);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, '_blank');
  };

  const handleAddToCalendar = (event: typeof mockEvents[0]) => {
    triggerNotification(`Opening Google Calendar for ${event.title}...`);
    const startStr = event.date.replace(/-/g, '') + 'T090000Z';
    const endStr = event.date.replace(/-/g, '') + 'T110000Z'; // Mocking end time
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${startStr}/${endStr}&details=${encodeURIComponent(event.desc)}&location=${encodeURIComponent(event.location)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="pt-24 pb-16 min-h-screen relative bg-background text-foreground transition-colors duration-300">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -50, x: '-50%' }}
            className="fixed top-24 left-1/2 z-50 glass-layer bg-emerald-500/20 border border-emerald-500 text-emerald-900 dark:text-emerald-100 px-6 py-3 rounded-full flex items-center gap-2 font-bold shadow-2xl backdrop-blur-md"
          >
            <Info className="w-5 h-5 text-emerald-500" /> {notification}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        
        {/* Header section - Next Events Pinned */}
        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black tracking-tighter mb-4 text-emerald-600 dark:text-emerald-400"
          >
            Featured Events
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-2xl mx-auto font-medium"
          >
            Click an event below or a date on the calendar to view details.
          </motion.p>
        </div>

        {/* Pinned Event & Calendar Area */}
        <div className="flex flex-col lg:flex-row gap-8 mb-20 items-stretch justify-center">
          
          {/* Calendar Widget */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="glass-layer p-6 rounded-3xl border border-border bg-card w-full lg:w-96 flex-shrink-0 relative overflow-hidden flex flex-col shadow-xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="flex justify-between items-center mb-6 relative z-10">
              <h3 className="text-xl font-black text-foreground">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h3>
              <div className="flex gap-2 text-muted-foreground">
                <button onClick={handlePrevMonth} className="p-1 hover:bg-muted hover:text-foreground rounded-full transition-colors"><ChevronLeft className="w-6 h-6" /></button>
                <button onClick={handleNextMonth} className="p-1 hover:bg-muted hover:text-foreground rounded-full transition-colors"><ChevronRight className="w-6 h-6" /></button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-black text-muted-foreground mb-2 relative z-10">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => <div key={d}>{d}</div>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-sm relative z-10 flex-grow content-start font-bold">
              {emptyDaysBefore.map(d => <div key={`empty-${d}`} className="aspect-square" />)}
              
              {daysArray.map(day => {
                const isSelected = selectedEvent.date === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const hasEvent = activeDays.includes(day);
                
                return (
                  <div 
                    key={day} 
                    onClick={() => handleDayClick(day)}
                    className={`aspect-square flex items-center justify-center rounded-xl transition-all 
                      ${isSelected ? 'bg-emerald-500 text-white font-black transform scale-105 shadow-[0_0_15px_rgba(16,185,129,0.5)] cursor-default' : 
                        hasEvent ? 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-500/30 cursor-pointer hover:bg-indigo-500/20 dark:hover:bg-indigo-500/40 relative' : 
                        'text-muted-foreground hover:bg-muted cursor-pointer'}`}
                  >
                    {day}
                    {hasEvent && !isSelected && <div className="absolute bottom-1 w-1 h-1 bg-indigo-500 rounded-full" />}
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Pinned Event Details */}
          <AnimatePresence mode="wait">
            <motion.div 
              key={selectedEvent.id}
              initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
              animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
              transition={{ duration: 0.3 }}
              className="glass-layer p-8 rounded-3xl border border-border bg-card w-full max-w-2xl relative overflow-hidden group flex flex-col justify-between shadow-xl"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
              <div className={`absolute -top-10 -right-10 w-64 h-64 blur-[80px] rounded-full pointer-events-none opacity-20 transition-all duration-500
                ${selectedEvent.color === 'emerald' ? 'bg-emerald-500' : 
                  selectedEvent.color === 'indigo' ? 'bg-indigo-500' : 
                  selectedEvent.color === 'blue' ? 'bg-blue-500' : 
                  selectedEvent.color === 'rose' ? 'bg-rose-500' : 'bg-purple-500'}`} 
              />
              
              <div className="flex flex-col sm:flex-row gap-8 items-start relative z-10">
                <div className={`w-32 h-32 rounded-[2rem] flex flex-col items-center justify-center flex-shrink-0 shadow-lg border
                  ${selectedEvent.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 
                    selectedEvent.color === 'indigo' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400' : 
                    selectedEvent.color === 'blue' ? 'bg-blue-500/10 border-blue-500/20 text-blue-600 dark:text-blue-400' : 
                    selectedEvent.color === 'rose' ? 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400' : 
                    'bg-purple-500/10 border-purple-500/20 text-purple-600 dark:text-purple-400'}`}
                >
                  <span className="font-black text-5xl">{getDayForDate(selectedEvent.date)}</span>
                  <span className="font-bold text-sm uppercase tracking-widest mt-1">{new Date(selectedEvent.date).toLocaleDateString('en-US', { month: 'short' })}</span>
                </div>
                
                <div className="flex-1">
                  <div className={`inline-block px-4 py-1.5 text-xs font-black uppercase tracking-widest rounded-full mb-4
                    ${selectedEvent.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' : 
                      selectedEvent.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-500/20' : 
                      selectedEvent.color === 'blue' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20' : 
                      selectedEvent.color === 'rose' ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20' : 
                      'bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-500/20'}`}
                  >
                    {selectedEvent.category} Event
                  </div>
                  <h2 className="text-3xl md:text-4xl font-black text-foreground mb-4 leading-tight">{selectedEvent.title}</h2>
                  <p className="text-muted-foreground font-medium text-base mb-6 leading-relaxed line-clamp-3">{selectedEvent.desc}</p>
                  
                  <div className="flex flex-col gap-3 text-sm font-bold text-foreground bg-secondary/50 p-4 rounded-2xl w-fit border border-border">
                    <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-emerald-500" /> {selectedEvent.time}</span>
                    <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-500" /> {selectedEvent.location}</span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap gap-4 relative z-10 pt-6 border-t border-border">
                <button 
                  onClick={() => handleDirections(selectedEvent)}
                  className={`flex-1 sm:flex-none px-8 py-3.5 rounded-xl font-black uppercase tracking-widest text-sm transition-all transform active:scale-95 shadow-lg group flex items-center justify-center gap-2 text-white
                    ${selectedEvent.color === 'emerald' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' : 
                      selectedEvent.color === 'indigo' ? 'bg-indigo-500 hover:bg-indigo-600 shadow-indigo-500/20' : 
                      selectedEvent.color === 'blue' ? 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/20' : 
                      selectedEvent.color === 'rose' ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/20' : 
                      'bg-purple-500 hover:bg-purple-600 shadow-purple-500/20'}`}
                >
                  Get Directions <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => handleAddToCalendar(selectedEvent)}
                  className="flex-1 sm:flex-none glass-layer border border-border px-8 py-3.5 rounded-xl font-bold uppercase tracking-widest text-sm hover:bg-muted text-foreground transition-colors flex items-center justify-center gap-2 transform active:scale-95"
                >
                  <Plus className="w-4 h-4" /> Add to Calendar
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className="h-px w-full max-w-xs mx-auto bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent mb-20" />

        {/* Mark Your Calendar Section */}
        <div className="mb-10 text-center">
           <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-black tracking-tighter mb-4 text-foreground"
          >
            All Upcoming Events
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground font-medium text-base"
          >
            Explore our curated list of events. Click any card to feature it above.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockEvents.map((event, index) => {
            const isEventSelected = event.id === selectedEvent.id;
            return (
                <motion.div
                key={event.id}
                onClick={() => {
                    setSelectedEvent(event);
                    // Parse date and update calendar view immediately
                    const [y, m] = event.date.split('-');
                    setCurrentDate(new Date(parseInt(y), parseInt(m)-1, 1));
                    window.scrollTo({ top: 100, behavior: 'smooth' });
                }}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: (index % 6) * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className={`glass-layer p-6 rounded-3xl border group cursor-pointer transition-all duration-300 flex flex-col justify-between h-full bg-card
                    ${isEventSelected ? 'border-emerald-500/50 shadow-2xl ring-2 ring-emerald-500/20' : 'border-border hover:border-emerald-500/30 shadow-lg'}`}
                style={{
                  boxShadow: isEventSelected ? `0 0 30px ${event.color === 'emerald' ? 'rgba(16,185,129,0.2)' : event.color === 'indigo' ? 'rgba(99,102,241,0.2)' : event.color === 'blue' ? 'rgba(59,130,246,0.2)' : event.color === 'rose' ? 'rgba(244,63,94,0.2)' : 'rgba(168,85,247,0.2)'}` : 'none'
                }}
                >
                <div>
                  <div className="flex justify-between items-start mb-4">
                      <div className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border
                      ${event.color === 'emerald' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20' : 
                          event.color === 'indigo' ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20' : 
                          event.color === 'blue' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20' : 
                          event.color === 'purple' ? 'bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20' : 
                          'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20'}
                      `}>
                      {event.category}
                      </div>
                      <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            navigator.clipboard.writeText(window.location.origin + '/events').then(() => triggerNotification(`Event link copied!`)); 
                          }}
                          className="text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100 bg-secondary p-2 rounded-full border border-border"
                      >
                          <Share2 className="w-4 h-4" />
                      </button>
                  </div>

                  <h3 className="text-xl font-bold text-foreground mb-4 line-clamp-2 leading-tight group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {event.title}
                  </h3>
                  
                  <div className="space-y-3 mb-6 bg-secondary/50 p-4 rounded-2xl border border-border/50">
                      <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                        <div className="bg-background border border-border p-1.5 rounded-md shadow-sm"><CalendarIcon className="w-4 h-4 text-emerald-500" /></div>
                        <span>{new Date(event.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                        <div className="bg-background border border-border p-1.5 rounded-md shadow-sm"><Clock className="w-4 h-4 text-emerald-500" /></div>
                        <span>{event.time}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium text-foreground">
                        <div className="bg-background border border-border p-1.5 rounded-md shadow-sm"><MapPin className="w-4 h-4 text-emerald-500" /></div>
                        <span className="truncate">{event.location}</span>
                      </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex justify-between items-center text-sm font-bold text-emerald-600/80 dark:text-emerald-400/80 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mt-auto">
                    <span>{isEventSelected ? 'Currently Viewing' : 'View Details'}</span> 
                    <ArrowRight className={`w-4 h-4 transition-transform ${isEventSelected ? 'rotate-90' : 'group-hover:translate-x-1'}`} />
                </div>
                </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
