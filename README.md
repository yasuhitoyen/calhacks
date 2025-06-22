**Inspiration**
In San Francisco, finding basic help, like a place to sleep, get a meal, or use a clean restroom, is often way harder than it should be. While resources exist, they’re scattered across websites, PDFs, and phone lines, making it confusing or impossible to find help quickly.
More than 8,300 people are unhoused on any given night, and over 20,000 seek homeless services each year. But still, more than half sleep outside. Food insecurity is also high, 117,000 residents struggle to get enough to eat. And though the city provides public restrooms and water fountains, they're not always easy to locate. In fact, one restroom program logged 750,000 visits in just 9 months, showing how urgent the need is.
That’s why we built CareMap: a tool that brings together real local services like shelters, food banks, and restrooms. You just enter your ZIP code and preferences and get a clean, AI-powered summary of what’s nearby and open now.
Because in a moment of crisis, no one should be digging through a dozen websites.

**What it does**
CareMap helps users:
📍 Find local help fast by entering a ZIP code and choosing preferences (like ID required, walk-ins welcome, multilingual staff, etc.)
🧠 Get an AI-generated summary (via Claude 3) explaining the best matches
🗺️ View results visually on a live interactive map
💬 Chat with an AI to ask questions like “Where can I get food tonight?”
We prioritize accessibility, urgency, and clarity to serve those who need help the most.

**How we built it**
Frontend React + TypeScript
TailwindCSS for UI, Lucide for icons
Leaflet.js for mapping
Backend Node.js and FastAPI hybrid
Claude API (Anthropic) to summarize filtered service results
Service dataset: shelters, public restrooms, water fountains, food programs — all manually cleaned and annotated
Custom preference system: flags for requires_id, lgbtq_friendly, multilingual_staff, and more

**Challenges we ran into**
Mapping inconsistent real-world data (bad ZIPs, missing lat/lng)
Managing geolocation and ZIP code fallbacks in the UI
Syncing the hybrid backend setup between Node.js and FastAPI
Making the map work smoothly with filtering and user location

**Accomplishments that we're proud of**
🧠 Deployed Claude 3 to generate natural, helpful responses
🗺️ Built a fully working interactive map with real SF data
📊 Created a clean CSV dataset from messy public sources
Made the entire experience inclusive, intuitive, and fast

**What we learned**
How to clean and normalize geospatial datasets
How to use Claude effectively for real-time summarization
How to build voice-powered apps with Vapi
How to design for accessibility and urgency, not just aesthetics
That even small filters like “walk-ins welcome” can make a huge impact

**What's next for CareMap**
Live data integration: Sync with SF’s city APIs for real-time hours and service status
Expand to more cities: Starting with Oakland and LA
Mobile-first UX: Focused design for public kiosk or shelter use
Multilingual summaries and voice support
Partner with local orgs to keep service info verified and current
