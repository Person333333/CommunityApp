# Fulfilling the TSA Requirements: Feature Implementation Guide

> [!NOTE]
> The judges will be checking their rubrics against the strict requirements of the 2025-26 "Community Resource Hub" theme. Use this guide to explain exactly *how* you implemented every single mandated feature in a technically sophisticated way.

---

## Requirement 1: An Interactive Directory (Search & Filter)
*The prompt asked for a directory allowing users to search and filter resources.*

**How We Built It:**
We built the main `Discover.tsx` page to serve as the structural core of this requirement, but we took the "interactive" mandate to the next level. 
*   **The Interface:** We engineered a dual-pane layout. On the left, users have a responsive grid of `GlassCard` resource items. On the right, we implemented a dynamic `MapComponent` using `React-Leaflet`. As users scroll or hover over text, the map is meant to interactively guide them.
*   **The Filtering Logic:** Instead of searching the database every single time a user types a letter (which creates lag), we load the resources once and filter them entirely on the client-side using a React `useMemo` hook. Users can filter by **Category** (Food, Housing, Education, etc.), **Tags**, and importantly, **Distance**. 
*   **The Search Innovation:** We didn't just build a standard text-match search. We integrated a **Gemini AI Proxy**. If a user searches "I can't pay my rent", the AI comprehends the distress and automatically filters the directory to the "Financial Assistance" and "Housing" categories.

## Requirement 2: A Highlight Section (Spotlighting 3+ Resources)
*The prompt mandated spotlighting at least three community resources.*

**How We Built It:**
We placed this prominently on our `Home.tsx` landing page.
*   **The Implementation:** We created an auto-playing "Spotlight Resource Carousel". Rather than hardcoding three random HTML elements, we built a system that queries our Neon PostgreSQL database for resources flagged as `is_featured = true`. 
*   **The Design:** We used `Framer Motion` to create a smooth, staggering animation. Each highlighted resource card utilizes our "Matte Palette" and glassmorphism styling. They instantly display crucial information (Title, Category, transparent background image) with a bold call to action letting the user immediately click through to get directions or contact info.

## Requirement 3: A Form to Submit New Resources
*The prompt required a way for users to indicate new resources to add to the hub.*

**How We Built It:**
We dedicated the entire `Submit.tsx` page to this, treating it not just as a form, but as a secure data ingestion pipeline.
*   **The Multi-Step Interface:** A 30-field form is intimidating. We broke the UX down into a multi-step "Wizard" (1. Resource Details, 2. Contact Info, 3. Review). This increases the chance that a community organizer will actually finish submitting the form.
*   **Security & Auth:** We protected the form using **Clerk** authentication. Only signed-in users can post, preventing bot-spam. 
*   **AI Moderation (The Flex):** Instead of manually reading every submission, we built a Python serverless function that intercepts the submission. Before it hits our PostgreSQL database, the Gemini AI evaluates the text. If the title is "sdjfksdfjk" or "buy cheap rolexes", the AI flags it as invalid and blocks the database write, keeping our community hub pristine.

## Requirement 4: Additional Content (Enhancing the Hub)
*The prompt asked for additional content to enhance the resource hub for end-users.*

**How We Built It:**
A standard directory is boring. We surrounded the core hub with auxiliary tools that make it a true "Compass" for the community.
*   **Civic Engagement Calendar (`Events.tsx`):** We built an interactive event calendar. It doesn't just list events; it has functional logic allowing users to click "Add to Calendar" (generating a Google Calendar URL string) or "Get Directions" (linking directly to Google Maps using URI component encoding).
*   **Crowdfunding Hub (`Donations.tsx`):** We added a section to natively support the very non-profits listed in the directory. We built sophisticated UI cards that visually calculate and animate the "percentage to goal" progress bar.
*   **Universal Translation:** Because a community hub is useless if half the community can't read it, we built a custom translation service. Users can click the globe icon, and our `translate.py` backend instantly converts the *entire React DOM state* into their native language, caching it locally so it never has to load twice.
*   **The Helper AI Chatbot:** We added a persistent floating action button (`HelperButton.tsx`) that acts as a 24/7 concierge, guiding confused users exactly to the resources they need.
