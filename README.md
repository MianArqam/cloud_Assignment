# UniEvent Planner ✨

A modern, responsive, glass-style **university event planner web app** with dynamic event browsing.

## Project Structure

```text
cloud_Assignment/
├── index.html
├── styles.css
├── health.html
├── js/
│   ├── app.js
│   ├── threeScene.js
│   ├── data/
│   │   └── fallbackEvents.js
│   └── services/
│       └── eventsApi.js
├── deploy/
│   └── nginx/
│       └── unievent.conf
└── README.md
```

## Features

- Modern glass-style UI inspired by contemporary landing pages
- Interactive Three.js hero animation (mouse-reactive 3D scene)
- Responsive navbar with search
- Hero section with quick stats
- Event cards with hover animation
- Event detail modal popup
- Dark/light theme toggle (saved in localStorage)
- Date filters (today / this week / this month)
- Manual refresh + automatic refresh every 2 minutes
- External API fetch with local fallback dataset

## Interactivity

- `js/threeScene.js` renders a realtime 3D glassy knot scene in the hero section using Three.js from CDN.
- Scene responds to pointer movement and adapts to viewport resize.

## API Integration

The app fetches events from KudaGo public API:

- Source file: `js/services/eventsApi.js`
- Endpoint:
  - `https://kudago.com/public-api/v1.4/events/?lang=en&page_size=40&location=msk&fields=id,title,description,dates,place,images,site_url,categories`

Flow:
1. Fetch JSON events.
2. Normalize data fields (`title`, `date`, `venue`, `description`, `image`, `url`, `category`).
3. Fall back to local sample events if API is unavailable.

## Run Locally

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment Notes

- App is static and can be served by Nginx.
- `deploy/nginx/unievent.conf` includes SPA fallback and cache headers.
- `/health` endpoint is included in the Nginx config for health checks.
