# Community Compass: Complete Architecture & Technical Documentation

> [!IMPORTANT]
> This document serves as the comprehensive technical reference for the Community Compass project. It covers the full development lifecycle, architectural choices, design philosophies, and an exhaustive file-by-file breakdown of the frontend and backend systems. Use this guide to fully understand the intricate workings of the codebase, ideal for TSA preparation or onboarding.

---

## 1. The Development Process (Our Journey)

The Community Compass project was born out of a critical observation during a local community outreach sprint: **information fragmentation**. Residents were overwhelmed trying to find local support—food banks, housing assistance, youth programs—because the data was scattered across outdated council websites, chaotic social media groups, and physical bulletin boards. 

We set out on an intensive development cycle with a clear mission: *build a centralized, accessible, and intelligent hub for community resources.*

### Phase 1: Ideation & Architecture Planning
We started by mapping out the core user personas:
1. **The Seeker:** Someone in urgent need of support (e.g., food, housing) who needs a frictionless, fast, and translated experience.
2. **The Contributor:** A local organizer or volunteer wanting to share a new resource easily.
3. **The Guest:** A casual browser looking for local civic events or donation opportunities.

We chose a modern, highly performant stack to ensure accessibility and speed: **React 19, Vite, and Node.js/Python serverless functions.** For the database, we needed something robust yet easily scalable, leading us to **Neon (Serverless PostgreSQL)**. 

### Phase 2: Design Language & The "Compass" Theme
The name "Community Compass" inspired our entire design philosophy. A compass represents guidance, finding one's way, and safety. We wanted the app to feel like a guiding light rather than a sterile government directory.
*   **The Matte Palette:** We opted for a deep "Matte" color scheme (dark slates, rich emeralds, deep indigos). This isn't just an aesthetic choice; it reduces eye strain and provides high-contrast legibility, which is crucial for accessibility.
*   **Glassmorphism:** We used frosted glass effects (`backdrop-blur`) to create depth and hierarchy without relying on harsh shadows or borders. This makes the UI feel light, modern, and fluid.
*   **Micro-interactions:** From the spinning compass needle on scroll to the cinematic intro, these animations (powered by Framer Motion) are designed to make the platform feel alive, welcoming, and premium.

### Phase 3: AI & Localization Integration
We realized that searching by keyword isn't always enough. Someone might search "I'm hungry" instead of "Food Bank". Thus, we integrated **Gemini AI** as a proxy layer to map natural language to structured categories. 
Furthermore, recognizing our diverse community, we implemented a seamless translation layer using `deep-translator` (Google Translate API wrapper) combined with `i18next`, caching translations locally to ensure blazing fast sub-sequent loads.

### Phase 4: Refinement & The "Unified" Data Model
Initially, we struggled with handling curated database resources vs. user-submitted resources. Our solution was the `UnifiedResourceService`, a robust abstraction layer that merges both data streams, applies spatial filtering (using user GPS or ZIP coords), and serves a single array of resources to the frontend.

---

## 2. Design & Architectural Choices

### The Tech Stack
*   **Frontend:** React 19 (TypeScript) via Vite. Gives us the latest concurrent rendering features and lightning-fast HMR during development.
*   **Styling:** Tailwind CSS. We heavily customized the `tailwind.config.js` to include custom matte colors, glass utility classes, and complex animations.
*   **Routing:** React Router v7.
*   **Animations:** Framer Motion for complex scroll-driven animations, exit transitions, and micro-interactions.
*   **Maps:** React-Leaflet combined with OpenStreetMap tiles. Offers a free, reliable mapping solution without heavy API key dependencies.
*   **Database:** Neon (PostgreSQL). Serverless SQL gives us the power of relational data with zero-friction scaling.
*   **Backend:** Vercel Serverless Functions (Python `BaseHTTPRequestHandler`). We chose Python for the backend proxies because of its excellent text-processing libraries and seamless Gemini AI integration.

### The Compass Motif
The compass isn't just a logo; it's a structural motif. 
*   **AnimatedCompass:** Found on the homepage, it reacts to device orientation (gyroscope) if available, and scroll position otherwise. It grounds the user in the "guidance" theme.
*   **Cinematic Intro:** The app loads with a dramatic scaling compass animation to set a premium tone before revealing the content.

### Accessibility First
We built an `AccessibilityWidget` and heavily integrated keyboard navigation (like the **Command Palette** triggered via `Ctrl+K`). High-contrast mode and large text options are strictly implemented via CSS variable overrides in `index.css`.

---

## 3. Frontend Architecture: File-by-File Breakdown

### Root Environment
*   **`package.json`**: Defines all dependencies. Key libraries include `react`, `framer-motion`, `lucide-react` (for iconography), `@clerk/clerk-react` (auth), and `leaflet`.
*   **`vite.config.ts`**: The Vite bundler configuration. Critically, it sets up proxy rules for `/api` so that frontend API calls in local development are routed to our local Python server on port 3002.
*   **`tailwind.config.js`**: Extends the default Tailwind theme. It defines our custom color variables (like `border`, `background`, `primary`) mapping to CSS variables defined in `index.css`. It also sets up custom keyframes for accordion animations.
*   **`vercel.json`**: Instructs Vercel on how to build and route the application. It maps the `/api/*` endpoints to our serverless Python functions and configures caching headers.

### Global Setup & State
*   **`src/react-app/main.tsx`**: The React entry point. It wraps the app in the `ClerkProvider` for authentication, the custom `LocationProvider`, and renders the `<App />`. 
    *   *Design Choice:* Clerk is used for rapid, secure auth without managing passwords ourselves.
*   **`src/react-app/App.tsx`**: The main orchestration component. It manages global state like the `showIntro` flag (running the CinematicIntro only once), handles the ambient background setup, and lays out the routing wrapper (`<Routes>`) alongside global utilities like the `Navbar`, `Footer`, `CommandPalette`, and `HelperButton`.
*   **`src/react-app/index.css`**: The monolithic stylesheet. Beyond standard Tailwind imports, it defines the entire HSL-based color palette for light and dark modes, sets up standard glassmorphism utility classes (`.glass-layer`, `.glass-strong`), and applies global typographic rules.

### Core Contexts & Hooks
*   **`src/react-app/context/LocationContext.tsx`**: A vital piece of state. It attempts to grab the user's GPS coordinates. If that fails or isn't requested, it allows setting a ZIP code. It uses fallback geocoding (Zippopotam.us) to map ZIPs to rough Lat/Lng coordinates so the app can calculate distance-based filtering.
*   **`src/react-app/hooks/useLocation.ts`**: The hook consumer for the above context. Also exports the `calculateDistance` utility (Haversine formula) to filter resources within a radius.

### Services Layer (The Brains)
*   **`src/react-app/services/database.ts`**: Handles direct SQL-like bridging to Neon PostgreSQL via backend endpoints (or direct queries if configured). It manages fetching `curated_resources`, updating `click_count`, and handling favorite statuses.
*   **`src/react-app/services/unifiedResourceService.ts`**: The orchestrator. Instead of components fetching from different tables or APIs, they call this service. It merges curated database resources with user-generated submissions (`resource_submissions` table) into a single standard `ResourceType` array.
*   **`src/react-app/services/aiSearchVercel.ts`**: The frontend bridge to our Gemini Python backend. It handles natural language search, generating contextual help messages for the `HelperButton`, and evaluating user submissions for quality. It has extensive local fallback dictionaries in case the AI is rate-limited.
*   **`src/react-app/services/translateService.ts`**: Wraps our Python `/api/translate` endpoint. It uses `localStorage` caching extensively to ensure that once a paragraph is translated, we never pay the network penalty to translate it again.

### Shared Logic
*   **`src/shared/types.ts`**: Defines TypeScript interfaces and Zod schemas. Crucially, it defines `ResourceType`, ensuring our frontend components and backend expectations match exactly regarding fields like `id`, `latitude`, `longitude`, `services`, and `tags`.
*   **`src/shared/categoryHierarchy.ts`**: A hierarchical map of all resource categories (e.g., Housing -> Emergency Shelter, Rent Assistance). This powers our dropdowns and helps the AI categorize natural language queries.

### Page Components
*   **`src/react-app/pages/Home.tsx`**: The landing page. Features a massive Hero section with the `AnimatedCompass`. It uses `framer-motion` `useScroll` to create a 3D parallax effect on the background and stars. It dynamically fetches featured, localized resources and renders them in an auto-playing carousel. It heavily leverages staggered animations mapping over impact stats.
*   **`src/react-app/pages/Discover.tsx`**: The core application workspace. 
    *   *Features:* A powerful search bar, zip code locator, and dropdown filters (Category, Cost, Tags). 
    *   *Layout:* A responsive grid that splits between a list of resource cards and a sticky sidebar containing a mini-map (`MapComponent`) and "Popular/Recent" lists.
    *   *Logic:* It filters the `allResources` array locally in a `useMemo` block based on search term, ZIP radius, and selected tags to ensure immediate UI feedback.
*   **`src/react-app/pages/Submit.tsx`**: The contribution portal. This is a complex, 3-step wizard (Resource Details -> Contact Info -> Review). It includes experimental features like Drag-and-Drop image uploading, GPS auto-location for the organization's address, and AI-validation step before allowing the submission to hit the database.
*   **`src/react-app/pages/About.tsx`**: The project narrative. Uses a highly advanced, sticky scroll animation (`StickyAboutStory`) where the compass spins, stops, and points to the "Challenge" and "Solution" cards as the user scrolls down.
*   **`src/react-app/pages/Events.tsx`**: A civic engagement calendar. Renders a custom-built month grid calendar. Clicking dates synchronizes with a detailed event card that offers "Add to Calendar" and "Get Directions" functionalities.
*   **`src/react-app/pages/Donations.tsx`**: A crowdfunding hub. Displays beautifully designed cards for local charities. It incorporates animated progress bars for fundraising goals and uses Clerk's `<SignedIn>/<SignedOut>` wrappers to conditionally render donation buttons versus prompting a login.

### Key Global Components
*   **`src/react-app/components/Navbar.tsx`**: The unified top navigation. Handles mobile hamburger menus, Clerk `<UserButton>`, theme toggling, and language selection dropdowns.
*   **`src/react-app/components/CommandPalette.tsx`**: The pro-user tool. Triggered by `Ctrl+K`, it renders a modal allowing users to instantly jump to routes, search categories, or toggle Dark Mode using just their keyboard.
*   **`src/react-app/components/MapComponent.tsx`**: A heavy wrapper around `react-leaflet`. It dynamically parses the `resources` array passed to it, rendering `Marker` components on the map with popup cards detailing the resource.
*   **`src/react-app/components/HelperButton.tsx`**: A persistent floating action button containing a contextual chatbot. It leverages the AI proxy to answer user questions about how to use the site (e.g., "How do I find food?").
*   **`src/react-app/components/CinematicIntro.tsx`**: An overlay that renders on first visit. It orchestrates a multi-step Framer sequence: A dot appears -> morphs into a compass -> spins aggressively -> text drops in.

---

## 4. Backend Proxies & Serverless Functions (Python)

To bypass CORS, securely handle API keys, and perform heavy text processing, we use Vercel Serverless Python functions located in the `/api` directory. They all inherit from `BaseHTTPRequestHandler`.

*   **`api/ai.py`**: The interface to Google's Gemini Models. 
    *   *How it works*: It receives a JSON payload identifying the `task` (e.g., `search`, `validate_submission`, `helper_chat`). 
    *   *Validation Task*: If validating a submission, it injects the user's draft data into a strict prompt demanding a JSON response confirming if the text is coherent and not spam.
    *   *Helper Task*: It provides the AI with a hardcoded `site_info` variable to give the AI context about what "Community Compass" actually is so it answers accurately.
*   **`api/translate.py`**: The translation engine using `deep-translator`. 
    *   *Optimization*: It implements a hybrid caching model. It queries an in-memory dictionary. If it misses, it queries the `translations` table in PostgreSQL. If that misses, it hits the external API, dynamically batching strings into groups of 50 to avoid rate limits, then saves the result back to the database.
*   **`api/submissions.py`**: The data ingestion layer. It receives the validated JSON payload from the frontend frontend's `Submit.tsx`, parses out the fields, establishes a secure `psycopg2` connection to Neon, and executes an `INSERT INTO resource_submissions ... RETURNING id` command.

---

## 5. Database Architecture & Data Models

We utilize **Neon Serverless PostgreSQL**. The schema revolves around a unified structure to handle diverse data types.

### Primary Tables
1. **`curated_resources`**: The "official" database. Populated by admins or imported datasets (like 211 data). Considered the ground truth.
2. **`resource_submissions`**: The community contributions. Designed to structurally mirror `curated_resources` but includes fields like `user_id` and `status` (pending/approved) for moderation.
3. **`translations`**: The persistent dictionary. 
   - Columns: `src_lang`, `dest_lang`, `original_text`, `translated_text`.
   - Used to drastically cut down on API calls to translation services.

### Core Data Structure (`ResourceType`)
```typescript
interface ResourceType {
  id: number;
  title: string;
  description: string;
  category: string;
  // Spatial Data
  latitude?: number;
  longitude?: number;
  address?: string;
  city?: string;
  zip?: string;
  // Metadata
  is_featured?: boolean;
  click_count?: number;
  tags?: string;
  // Contact & Logistics
  phone?: string;
  website?: string;
  hours?: string;
}
```

---

## 6. Closing Thoughts on the Architecture

The Community Compass architecture effectively marries the speed and aesthetic power of a Single Page Application (React/Vite) with the secure, scalable data processing of Serverless functions (Python/Neon). 

By heavily abstracting the data merging process (`UnifiedResourceService`), abstracting translation caching, and providing broad spatial fallbacks (GPS to Zipcode to Global), the application achieves extreme resilience. If GPS fails, zip codes work. If the AI fails, local dictionary fallbacks trigger. If translation APIs throttle, the database cache serves the text. 

This resilience was the primary engineering objective, ensuring that those in need of community resources never face a technical barrier to entry.
