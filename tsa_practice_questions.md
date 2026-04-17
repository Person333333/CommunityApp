# TSA Match-Play: Practice Questions & Answer Keys

> [!CAUTION]
> Do not memorize paragraphs! Memorize the **"Sentence Gist"** keys so you can naturally converse and build your answers on the fly. The judges will ask questions in a random order, often interrupting or bouncing off your previous statements. Use this document to drill each other.

---

### **Q1: "Walk us through your design process. How did you decide on the look and feel of the site?"**
**Sentence Gist:** We focused on empathy and accessibility; we created a custom "Matte Palette" with Glassmorphism to reduce eye strain and make the site feel like a premium, comforting environment rather than a sterile government form.
*   **Expand on:** Mention Tailwind CSS being used to implement the matte colors (emerald, slate, indigo). Mention Framer Motion used for the cinematic intro and compass spinning to give users a sense of "guidance."

### **Q2: "What was the most difficult technical hurdle your team had to overcome?"**
**Sentence Gist:** Handling asynchronous data streams, specifically querying our PostgreSQL database while simultaneously pinging our AI proxy for language translation, without slowing down the website interface. 
*   **Expand on:** Explain the caching solution. Talk about how you used `localStorage` and a database caching table so that you only ever have to ask the AI for a translation *once*, saving massive loads of time and API rate limits.

### **Q3: "How does your website actually pull in data? Are these resources real?"**
**Sentence Gist:** We use a custom-built `UnifiedResourceService` that queries our Neon PostgreSQL database, merging curated official databases with user-submitted events, and then filters them based on the user's GPS or zip code distance.
*   **Expand on:** Mention the backend Python scripts that run securely on Vercel to protect the database credentials. Explain that it's a dynamic system, not just a hardcoded HTML list.

### **Q4: "If your website started getting 50,000 visitors a day, what would break, and how would you fix it?"**
**Sentence Gist:** Our Serverless database (Neon) and Serverless backend (Vercel) scale automatically, but our main bottleneck would be external API rate limits (like hitting the Google Gemini API too fast), which we'd fix by increasing our database-caching dependency so we don't have to rely on external services.
*   **Expand on:** Talk about how "Serverless" architecture was chosen specifically because it scales based on traffic without a physical server crashing.

### **Q5: "Why did you choose React instead of just building this with standard HTML, CSS, and Javascript?"**
**Sentence Gist:** React allowed us to build a "Single Page Application," meaning the website redraws instantly without the browser ever having to reload a white screen, providing a much faster, cohesive user experience.
*   **Expand on:** Mention "Component Reusability." We didn't have to code 100 resource cards; we coded *one* card template in React and told the database to loop over it 100 times, keeping our codebase clean and maintainable.

### **Q6: "How did you divide the workload among your team members?"**
**Sentence Gist:** We utilized a strategic division of labor with aggressive pair programming; [Team Member 1] led the Frontend UI/UX and React architecture, while [Team Member 2] led the Backend Python scripts, AI proxying, and Database schemas, but we collaborated daily to connect the two successfully.
*   **Expand on:** Give an example. "For instance, when [Team Member 2] built the submission database, [Team Member 1] and [Team Member 2] sat down together to ensure the React Form exactly matched the Python expectations." (Demonstrates 21st-century teamwork/collaboration skills).

### **Q7: "You mentioned using AI. How exactly are you using it, and why?"**
**Sentence Gist:** We use Google's Gemini AI as a natural-language bridge because standard keyword searching fails when people are in distress; the AI parses a phrase like "I'm hungry" and intelligently maps it to our "Food Assistance" database category.
*   **Expand on:** Also mention the secondary use of AI: acting as a quality-control bouncer that scans user-submitted resources to reject spam before it enters your PostgreSQL database.

### **Q8: "How do you ensure your website is accessible to people with disabilities or technical limitations?"**
**Sentence Gist:** Accessibility was our Day 1 priority; beyond our high-contrast Matte color palette to prevent eye strain, we built a Command Palette (`Ctrl+K`) for complete keyboard navigation, ensuring users don't even need a mouse to find resources.
*   **Expand on:** Mention the one-click universal translation feature that ensures non-English speakers aren't alienated from their local community resources.

### **Q9: "What would you change if you could start this project all over again?"**
**Sentence Gist:** We would have implemented an automated end-to-end testing framework like Cypress earlier in the process, rather than relying solely on manual testing, to ensure that as our codebase grew, we didn't accidentally break old features.
*   **Expand on:** You can also mention that you would build a dedicated Admin Dashboard for city officials to review the data, moving beyond the auto-approval pipeline currently used for the prototype.

### **Q10: "Can you explain how a user's location is processed?"**
**Sentence Gist:** We have a cascading location system; we first ask the browser for precise GPS coordinates, but if the user denies permission, we fall back to a manual Zip Code entry which we convert to coordinates using an external Geocoding API.
*   **Expand on:** Explain *why* this matters. Once you have coordinates, you run a math function (the Haversine formula) to calculate precisely how far away resources are, hiding anything further than the user's requested radius.

### **Q11: "How do you ensure that user-submitted data is safe, accurate, and not spam?"**
**Sentence Gist:** We integrated our Gemini AI directly into the submission pipeline where it reads the user's input to automatically block gibberish or harmful entries before they ever reach our Neon database.
*   **Expand on:** This is far more effective than just checking for bad words because AI understands context—meaning if someone submits a real need versus random keyboard smashing, the system knows the difference.

### **Q12: "Why did you choose Neon Serverless PostgreSQL over a NoSQL database like MongoDB?"**
**Sentence Gist:** Because civic data is highly structured, we needed the strict tables and relational consistency of SQL to prevent messy data, and Neon provides that while scaling up and down automatically like a serverless function.
*   **Expand on:** Explain that resources follow a strict schema (title, lat/long, category), making PostgreSQL the safer choice for guaranteeing data integrity.

### **Q13: "How does the site perform on mobile devices versus desktops?"**
**Sentence Gist:** We utilized a "Mobile-First" design philosophy with Tailwind CSS, meaning every component was engineered for a phone screen first and then scaled up for desktop, ensuring zero broken layouts on smaller devices.
*   **Expand on:** Mention how you handle the map and navigation specifically on mobile (e.g., hamburger menus, collapsible sidebars) to preserve screen real estate.

### **Q14: "What happens if your AI provider goes down or you run out of API credits?"**
**Sentence Gist:** We engineered the app to be highly fault-tolerant; if the AI proxy drops, the translation engine falls back to exactly matched database tables, and the search bar degrades gracefully to traditional keyword matching.
*   **Expand on:** Judges love to hear about "fail-safes." Emphasize that the user will never see a fatal crash; the site just reverts to basic functionality.

### **Q15: "How do you handle security and user authentication for submissions?"**
**Sentence Gist:** We completely outsourced the critical security elements to Clerk, guaranteeing that passwords and session tokens are entirely handled by a professional security provider rather than risking a custom-built login screen.
*   **Expand on:** Explain how integrating standard third-party tools like Clerk is a best practice in the industry over "reinventing the wheel."

### **Q16: "What are some specific details about your user interface that a judge might miss at first glance?"**
**Sentence Gist:** We focused heavily on what we call "Micro-interactions" via Framer Motion—little details like the compass reacting to device gyroscopes or buttons giving haptic-like scaling feedback to make the app feel alive.
*   **Expand on:** Subtlety makes the difference between a prototype and a "premium" product. Every interaction feeling snappy builds trust in the users.

### **Q17: "What was the most rewarding part of building this project for your team?"**
**Sentence Gist:** The most rewarding aspect was translating our complex architecture and backend scripts into something that is deeply human and capable of solving real-world civic fragmentation.
*   **Expand on:** This is the "feel good" closer. Pivot the tech into a community win. "Seeing the map populate with resources and realizing a local resident could genuinely use this today was our biggest milestone."

---

## BATCH 2: Specific Implementation Questions (Very Likely at Nationals)

---

### **Q18: "How exactly did you implement the search bar? Walk us through it technically."**
**Sentence Gist:** The search bar operates on two parallel tracks simultaneously — a standard client-side keyword filter that runs instantly as you type, AND an AI layer that interprets natural language intent and maps it to the correct resource category.
*   **Expand on:** When a user types into the search bar in `Discover.tsx`, a React `useMemo` hook recalculates the filtered list on every keystroke without touching the database. In parallel, if the query looks like a sentence or phrase (not just a keyword), we dispatch it to our `AISearchService` which calls our Python backend, which sends it to Google Gemini. The AI returns a JSON with suggested categories (e.g., `{categories: ["Food Assistance", "Housing"]}`), and those categories are applied as filters automatically. The user sees instant results from client filtering, then the AI results layer in on top.

### **Q19: "How did you apply 21st Century Skills in this project?"**
**Sentence Gist:** Every core 21st Century Skill — Collaboration, Critical Thinking, Communication, Creativity, and Technology Literacy — was baked into how we literally structured our codebase and workflow, not just our end product.
*   **Expand on with specific examples:**
    - **Collaboration:** We used a shared Git repository where [Team Member 1] pushed frontend components and [Team Member 2] pushed backend scripts. We reviewed each other's code before merging to prevent conflicts.
    - **Critical Thinking:** Every major architectural decision — choosing PostgreSQL over MongoDB, caching translations instead of hitting the AI every time, using Serverless over a dedicated server — came from analyzing tradeoffs, not just picking defaults.
    - **Communication:** We wrote TypeScript interfaces (basically contracts) so that when [Team Member 1] built the Submit Form, it outputted data in EXACTLY the shape [Team Member 2]'s Python expected. This forced precise team communication through code.
    - **Creativity:** The Matte Palette, the spinning compass intro, the density heatmap view, and the AI helper chatbot were all creative decisions that went far beyond the prompt requirements.
    - **Technology Literacy:** We used professional industry-grade tools — React 19, Vite, Neon PostgreSQL, Vercel Serverless, Google Gemini, and Clerk Auth — not beginner tools like WordPress or wix.

### **Q20: "I noticed your website has a translation button. How does that actually work under the hood?"**
**Sentence Gist:** When you click a language, our React app sends every visible text string to a Python serverless function, which checks a three-level cache before ever hitting the external translation API.
*   **Expand on:** Level 1 is an in-memory Python dictionary (fastest, lives during the server's session). Level 2 is our Neon PostgreSQL `translations` table. Level 3 is the `deep-translator` library which calls Google Translate. After any Level 3 call, the result is saved back to Levels 1 and 2 so it never needs to be called again. On the React side, we also save them in `localStorage` so subsequent page loads are essentially instant.

### **Q21: "What is the Compass theme about, and how did it influence your design decisions beyond just a logo?"**
**Sentence Gist:** The "Compass" metaphor is structural — it represents guidance and direction, which shaped every UI decision from the animated spinning needle on the About page to the way we framed the entire app as a "navigation tool" for people who feel lost in their community.
*   **Expand on:** The `CinematicIntro.tsx` starts with a single dot that morphs into a compass. The `AnimatedCompass` on the Home page responds to your phone's gyroscope, physically pointing you toward resources. The About page has a full sticky-scroll animation where the compass needle spins 810 degrees and points to our "Challenge" and "Solution" cards. Every feature decision asked: does this help somebody find their way?

### **Q22: "Tell me about the Events and Donations pages — those seem beyond the scope of the prompt. Why did you include them?"**
**Sentence Gist:** The TSA prompt explicitly requires "additional content to enhance the community resource hub" — the Events calendar and Donations hub are our answer to that requirement, turning a static directory into a full civic engagement platform.
*   **Expand on:** The Events page has a fully functional custom-built calendar — not a plugin. We wrote the month-grid logic manually in JavaScript. Clicking a day syncs to the event detail card above it, and users can click "Add to Google Calendar" or "Get Directions" to Google Maps, both of which generate real functional URLs. The Donations page displays animated fundraising progress bars powered by `Framer Motion` that fill up as the page loads, giving users immediate visual context on how much each cause has raised.

### **Q23: "How did you handle the form submission process? What happens from the moment a user clicks Submit?"**
**Sentence Gist:** Clicking Submit triggers a four-stage pipeline: client-side React validation, Clerk authentication check, Gemini AI content moderation, and finally a PostgreSQL database insert — only the last stage is permanent.
*   **Expand on in order:**
    1. **React Validation:** Checks required fields are filled in correctly (proper email format, non-empty fields).
    2. **Auth Gate:** Clerk confirms the user is signed in. If not, the form redirects them to sign in.
    3. **AI Moderation:** We POST the title, description, and category to our `api/ai.py` backend with `task: "validate_submission"`. Gemini evaluates if it's real content or spam/gibberish and returns `{isValid: true/false, feedback: "..."}`.
    4. **Database Write:** Only if Gemini returns `isValid: true` do we POST to `api/submissions.py`, which uses `psycopg2` to run an `INSERT INTO resource_submissions` SQL query and returns the new resource's ID.

### **Q24: "How do you know the distance between the user and a resource? What math is behind that?"**
**Sentence Gist:** We use the Haversine formula, which is the standard algorithm used by GPS systems to calculate the shortest distance between two points on a curved sphere like Earth using latitude and longitude coordinates.
*   **Expand on:** The Earth isn't flat, so you can't just subtract two coordinates. The Haversine formula accounts for Earth's curvature. We implemented it in our `LocationContext.tsx` as a `calculateDistance(lat1, lon1, lat2, lon2)` function. We take the user's coordinates and every resource's stored `latitude`/`longitude` from the database, run this formula, and filter out any resource whose distance exceeds the user's chosen radius.

### **Q25: "What does 'Serverless' mean? Why is that better than just renting a server?"**
**Sentence Gist:** Serverless means our backend Python code only runs when someone actually calls it — we're not paying for or managing a computer that runs 24/7 waiting for requests.
*   **Expand on:** A traditional server is like renting an entire office building. Even at 3 AM when no one is there, you're paying rent. Serverless is like renting a desk in a co-working space — you only pay when you actually use the desk. Vercel handles spinning up the Python function, running it, returning the result, and shutting it down in under a second. This also means it scales automatically: if 10,000 people submit resources simultaneously, Vercel spins up 10,000 parallel function instances and handles them all.

### **Q26: "What specific 'interactive' features did you add to the directory beyond just a list?"**
**Sentence Gist:** The directory has seven layers of interactivity: real-time keyword filtering, AI semantic category routing, radius-based distance filtering, a live interactive map that updates with the list, a density heatmap toggle, clickable resource cards with expandable details, and a "favorites" heart-button that persists to the user's account.
*   **Expand on:** None of these are page reloads. All filtering happens instantaneously client-side in a React `useMemo` hook that recalculates the filtered list every time the search, category, or radius inputs change. The map updates simultaneously — as you narrow the list, pins disappear from the map in real time.

### **Q27: "What is a 'component' in React, and what are some examples of components you built?"**
**Sentence Gist:** A React component is like a reusable Lego brick — a self-contained piece of UI with its own logic and styling that you can place anywhere in the app without rewriting code.
*   **Expand on:** We built dozens of custom components: `GlassCard` (the frosted glass container used everywhere), `GlassButton` (our branded button), `MapComponent` (the entire Leaflet map logic), `CommandPalette` (the Ctrl+K overlay), `CinematicIntro`, `AnimatedCompass`, `HelperButton` (the AI chatbot), and `Navbar`. Instead of writing navigation HTML on every single page, we wrote `Navbar` once and dropped it into the root layout — changes to it instantly propagate everywhere.

### **Q28: "How did your website go beyond just meeting the TSA prompt requirements?"**
**Sentence Gist:** We treated the four required elements as a floor, not a ceiling — every requirement was implemented with an extra intelligent or interactive layer that transformed a basic directory into a genuine civic platform.
*   **Expand on:**
    - Required: interactive directory → We added AI semantic search, distance filtering, and a live map.
    - Required: highlight section → We pulled featured resources dynamically from our database instead of hardcoding them.
    - Required: submission form → We added multi-step UX, Clerk authentication, and Gemini AI spam moderation.
    - Required: additional content → We added a full Events calendar, a Donations hub, universal translation, and a 24/7 AI Helper chatbot.

### **Q29: "Walk me through what happens the first time someone opens your website — what does the user experience?"**
**Sentence Gist:** The first experience is a cinematic compass intro — a dot blooms into a full spinning compass with the Community Compass title dropping in — before the full site fades in and the user lands on the Homepage.
*   **Expand on:** This intro only plays once (we store a "seen" flag in localStorage). After it finishes, the `App.tsx` renders the full layout. The user sees the Home page with the animated compass hero, impact statistics, and the featured resource spotlight carousel. The Location system quietly asks for GPS permission in the background. The navigation bar gives them access to Discover, Events, Submit, and Donations.

### **Q30: "How did you make sure your website looks professional and not like a school project?"**
**Sentence Gist:** We enforced a strict design system from day one — custom typography from Google Fonts, a curated HSL color palette, glassmorphism styling, and Framer Motion animations — so that every single page feels visually cohesive and intentional.
*   **Expand on:** We import `Inter` and `Outfit` from Google Fonts. All colors reference CSS variables (e.g., `hsl(var(--primary))`) defined in one file, so changing the brand color changes it everywhere instantly. Glassmorphism (the frosted-glass look) uses `backdrop-blur` and semi-transparent backgrounds to create depth. The animated compass intro and scrolling parallax effects on the About page are the kind of micro-experiences you see on premium software company websites, not school projects.

### **Q31: "Did you work collaboratively on the code? How did you make sure you didn't overwrite each other's work?"**
**Sentence Gist:** We used Git version control with a shared GitHub repository — [Team Member 1] and [Team Member 2] worked on separate branches and merged changes through pull requests to prevent conflicts.
*   **Expand on:** Git tracks every single line of code ever written and by whom. When [Team Member 1] finished a UI feature, he pushed it to his branch and opened a pull request. [Team Member 2] reviewed it before it merged into the main codebase. This is the exact same workflow used by professional engineering teams at companies like Google and Meta. We also caught several bugs during these code reviews that would have broken the site.

### **Q32: "What would a real city actually need before they could deploy this officially?"**
**Sentence Gist:** Three things: a human-moderated admin dashboard for reviewing submissions, professionally verified resource data vetted by city staff, and a secure production environment with proper environment variable management and HTTPS.
*   **Expand on:** Right now, submissions are auto-approved after AI validation — a real deployment would require human review. Our curated resources are accurate for prototype demonstration but would need to be officially verified. The database connection string currently lives in an environment variable on Vercel, but before going live, a full security audit and penetration test would be needed.
