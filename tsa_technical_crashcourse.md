# TSA Technical Crash Course — What You NEED to Know

> [!CAUTION]
> This is your survival guide. Even if you didn't write every line of code, you MUST be able to explain these concepts naturally. Judges won't ask you to write code live — they'll ask you to EXPLAIN how things work. If you can explain it, you "built" it. Read this document twice tonight.

---

## 🧠 PART 1: Vocabulary You MUST Know (They WILL use these words)

| Term | What it actually means | How to say it naturally |
|---|---|---|
| **React** | A JavaScript library for building UIs as reusable pieces called "components" | "React lets us build the site as reusable Lego blocks — write a card once, use it 100 times" |
| **Component** | A self-contained piece of UI with its own logic and look | "Our GlassCard component is used on every page — Discover, Events, Donations — same code, different data" |
| **TypeScript** | JavaScript but with strict type checking — catches bugs before the code runs | "TypeScript is like spell-check for code — it tells us 'hey, this variable should be a number, not a string' before we even run the app" |
| **Vite** | The tool that bundles and serves our React code during development | "Vite is our build tool — it compiles our TypeScript and React into optimized files the browser can run" |
| **Tailwind CSS** | A CSS framework where you style things with utility classes directly in HTML | "Instead of writing a separate CSS file, we write `bg-emerald-500 rounded-xl p-4` right on the element — it's faster to prototype" |
| **Framer Motion** | An animation library for React | "Framer Motion handles every animation — the spinning compass, the scroll effects, the page transitions" |
| **PostgreSQL** | A relational database that stores data in structured tables with rows and columns | "Think of it like a very strict Excel spreadsheet — every resource has exactly the same columns: title, category, lat, long, phone" |
| **Neon** | The cloud hosting provider for our PostgreSQL database — it's "serverless" | "Neon hosts our database in the cloud so we don't manage a server — it scales up and down automatically" |
| **Serverless** | Code that only runs when called, not on a 24/7 server | "Like a vending machine — it doesn't run until you press the button, then it does its job and goes idle" |
| **Vercel** | The platform that hosts our website and runs our serverless backend functions | "Vercel deploys our site automatically when we push code to GitHub — frontend and backend" |
| **API** | A URL endpoint that accepts requests and returns data (like a waiter taking your order) | "Our frontend sends a request to `/api/ai` and gets back a JSON response with the AI's answer" |
| **REST API** | A standard pattern for APIs using HTTP methods (POST, GET, etc.) | "We POST data to our endpoints and receive JSON responses — same pattern as Twitter or Spotify's APIs" |
| **JSON** | A text format for structured data: `{"name": "Food Bank", "category": "Food"}` | "It's like a dictionary — keys and values. Every API response is in JSON format" |
| **Clerk** | A third-party service that handles user login/signup securely | "Clerk handles passwords, sessions, and tokens — we never see or store raw passwords" |
| **Leaflet** | An open-source JavaScript library for interactive maps | "Leaflet renders the map, and React-Leaflet wraps it so we can use it as a React component" |
| **OpenStreetMap** | Free, open-source map tiles (the visual map images) | "We use OpenStreetMap instead of Google Maps because it's free — no API key that could expire during judging" |
| **Git / GitHub** | Version control — tracks every change to every file, by whom, and when | "Git is our safety net — if something breaks, we can revert to any previous version" |
| **Haversine Formula** | Math equation to calculate distance between two lat/long points on Earth's curved surface | "It's the standard formula GPS uses — we use it to calculate how far a resource is from the user" |
| **localStorage** | Browser storage that persists data even after you close the tab | "We save translations in localStorage so they load instantly next time — no server call needed" |
| **useMemo** | A React hook that caches a calculated value and only recalculates when inputs change | "Our filter runs inside useMemo so it only recalculates when the search text or filters actually change — not on every render" |
| **Props** | Data you pass INTO a React component (like function arguments) | "The MapComponent receives `resources` as a prop — the parent tells it what to display" |
| **State** | Data a component manages internally that, when changed, triggers a re-render | "When the user types in the search bar, that updates a `searchTerm` state, which triggers re-filtering" |
| **Context** | A way to share data globally across all components without passing props through every level | "Our LocationContext shares the user's coordinates with every component in the app" |
| **CSS Variables** | Custom properties like `--primary: 210 80% 55%` that you define once and use everywhere | "We change one variable and the entire site's color scheme updates — that's how our dark/light mode works" |
| **Glassmorphism** | A design trend using frosted-glass effects (semi-transparent backgrounds + blur) | "We use `backdrop-blur` and semi-transparent backgrounds to create depth without harsh borders" |
| **SPA (Single Page Application)** | A website that never fully reloads — React just redraws the parts that change | "When you click 'Discover,' the page doesn't reload — React swaps the content instantly" |
| **Proxy** | A middleman that forwards requests — our frontend calls Vercel, Vercel calls the AI | "The frontend never talks to Gemini directly — it goes through our Python proxy, which hides the API key" |
| **CORS** | A browser security rule that blocks websites from calling random servers | "CORS is why we need a backend proxy — the browser won't let React call Gemini directly" |
| **Environment Variables** | Secret values (API keys, passwords) stored outside the code | "Our database password is stored as an environment variable on Vercel — it's never in the source code" |

---

## 🔥 PART 2: The 10 Things You Absolutely Must Be Able to Explain

### 1. How the search works
"When you type, React filters the resource list instantly in the browser — no server call. At the same time, if it's a natural language phrase, we send it to our Python backend which asks Gemini AI to figure out which categories match. Both tracks work in parallel."

### 2. How the map works
"We use React-Leaflet with OpenStreetMap tiles. Each resource with coordinates gets a color-coded pin. Green = Food, Red = Healthcare, Blue = Housing. Click a pin, and a popup shows the resource details with Call and Visit buttons. The Density View clusters resources into circles sized by count."

### 3. How form submission works
"User fills the form → React validates fields → Clerk checks they're logged in → We send the data to our Python AI endpoint which checks if it's spam → Only if the AI approves, we write it to PostgreSQL. Four stages. Data only becomes permanent at stage four."

### 4. How translation works
"We check four places in order: browser localStorage, Python memory cache, PostgreSQL database, then Google Translate API. Once something is translated, it's saved at every level. We never translate the same string twice."

### 5. How the database is structured
"Three tables. `curated_resources` has the verified official data. `resource_submissions` has community-contributed data with a `user_id` and `status` field. `translations` caches every translated string. Our UnifiedResourceService merges the first two tables into one clean list for the frontend."

### 6. How location/distance works
"We ask for GPS. If denied, we ask for a ZIP code and convert it to coordinates using a geocoding API. Then we use the Haversine formula to calculate the distance from the user to every resource and hide anything outside their chosen radius."

### 7. Why we chose serverless
"A regular server runs 24/7 even when nobody's using it. Serverless only runs when someone makes a request. It scales automatically — 1 user or 10,000, Vercel handles it. And we don't have to maintain an operating system or worry about server crashes."

### 8. How authentication works
"Clerk handles everything. User clicks Sign In, Clerk shows a secure login form, handles password hashing, issues a JWT token stored in an HTTP-only cookie. Our code just checks 'is there a valid Clerk session?' before allowing submissions."

### 9. What happens when the AI fails
"Nothing crashes. If Gemini is slow or rate-limited, the search falls back to keyword matching. If translations can't reach the API, we serve from our database cache. If the database cache misses, localStorage has previous translations. Every external dependency has a Plan B."

### 10. Frontend vs Backend
"Frontend = what the user sees. Runs in the browser. React, TypeScript, Tailwind, animations. Backend = what happens behind the scenes. Runs on Vercel servers. Python, database queries, AI calls. The split exists for security — you can't put database passwords in frontend code because anyone can view browser source code."

---

## 💡 PART 3: If a Judge Points at Something on Screen and Asks "How Does This Work?"

### They point at the **Navbar**
"That's our Navbar component. It handles responsive navigation — on desktop it shows all links, on mobile it collapses into a hamburger menu. It also contains the Clerk UserButton for auth, the theme toggle for dark/light mode, and the language selector globe icon."

### They point at the **Map**
"That's React-Leaflet rendering OpenStreetMap tiles. Each pin is a resource from our database. Colors represent categories. Click any pin for a popup with the full resource details. The toggle at the top switches to Density View which clusters resources into heatmap circles."

### They point at a **Resource Card**
"That's our GlassCard component. It receives a resource object as a prop and displays the title, category, description, and action buttons. The frosted glass effect is CSS `backdrop-blur`. If you click it, it expands to show full details or navigates to the resource."

### They point at the **Search Bar**
"That input is controlled by React state. On every keystroke, a useMemo hook filters the full resource list by matching text against titles, descriptions, and tags. If the query is a sentence, it also dispatches to our AI backend for semantic category matching."

### They point at the **Submit Form**
"That's a multi-step wizard — Step 1 collects resource details, Step 2 collects contact info, Step 3 is a review screen. Each step validates before advancing. When you click Submit, it goes through four stages: React validation, Clerk auth check, AI spam check, then PostgreSQL insert."

### They point at the **Translation Button**
"That globe icon triggers our translation service. It sends every visible text string to our Python backend, which checks three cache levels before ever calling an external API. Results get saved so the same string is never translated twice."

### They point at the **Compass Animation**
"That's Framer Motion. The CinematicIntro component runs a multi-stage animation sequence: a dot scales up, morphs into a compass shape, the needle spins, and the title drops in. It only plays once — we store a flag in localStorage so returning users skip it."

### They point at the **Events Calendar**
"That's a custom-built calendar grid — not a plugin. We calculate `daysInMonth` and `firstDayOfMonth` using JavaScript Date objects to build the grid. Days with events are highlighted. Clicking a day syncs to the event detail card. The 'Add to Calendar' button generates a real Google Calendar URL."

### They point at the **Donation Progress Bar**
"That bar is Framer Motion's `whileInView` animation. When the card scrolls into view, the bar animates from 0% to the calculated percentage (`raised / goal * 100`). The visual width maps directly to the mathematical progress."

### They point at the **Helper Chat Button**
"That floating button opens our AI chatbot. When you type a question, it POST's to our Python `/api/ai` endpoint with `task: 'helper_chat'`. The Python function sends your question along with a `site_info` context pack to Gemini, so the AI knows everything about our platform and can give accurate guidance."

---

## 🎯 PART 4: The ONE thing to remember above all else

If you ever get asked something you genuinely don't know the answer to, say:

> "That's a great question. That particular implementation detail was handled more by my teammate [[Team Member 1]/[Team Member 2]], but from my understanding, [give your best high-level explanation]. [[Team Member 1]/[Team Member 2]], do you want to add the technical specifics?"

This does THREE things:
1. Shows honesty (judges respect that).
2. Shows you still have a general understanding.
3. Passes the ball to your teammate (judges WANT to see equal participation).

**NEVER say "I don't know" and stop talking. Always give your best understanding and then hand off.**
