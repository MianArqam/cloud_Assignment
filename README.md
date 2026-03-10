# UniEvent 🎓

A modern, responsive, Gen-Z style **university event management web app**.

UniEvent is built as a static frontend (HTML/CSS/JavaScript) so it can be deployed easily to EC2 instances behind a load balancer. It fetches dynamic event data from a public events API and periodically refreshes the UI.

## 1) Project Folder Structure

```text
cloud_Assignment/
├── index.html
├── styles.css
├── js/
│   ├── app.js
│   ├── data/
│   │   └── fallbackEvents.js
│   └── services/
│       └── eventsApi.js
└── README.md
```

## 2) Complete Frontend Features

- Responsive navbar with search
- Hero landing section
- Card-based event grid layout
- Event detail modal popup
- Dark/light theme toggle (saved in localStorage)
- Loading animation
- Smooth hover and entry animations
- Mobile-first responsive design

## 3) Sample API Integration Logic

The app fetches events from KudaGo public API:

- Source file: `js/services/eventsApi.js`
- Endpoint (JSON):
  - `https://kudago.com/public-api/v1.4/events/?lang=en&page_size=30&location=msk&fields=id,title,description,dates,place,images,site_url`

Flow:
1. Fetch JSON events.
2. Normalize fields (`title`, `date`, `venue`, `description`, `image`, `url`).
3. If API fails, fallback to local sample events (`js/data/fallbackEvents.js`).

Periodic refresh is configured in `js/app.js` using:
- `setInterval(loadEvents, 120000)` (every 2 minutes).

## 4) AWS EC2 Deployment Instructions

### Option A: Single EC2 (quick start)

1. Launch Ubuntu/Amazon Linux EC2.
2. Install Nginx.
3. Copy project files to server.
4. Serve files with Nginx root (e.g., `/var/www/unievent`).
5. Set `index index.html;` in Nginx config.

### Option B: Multi-EC2 + Load Balancer (recommended)

1. Deploy same static UniEvent files to multiple EC2 instances.
2. Put instances in an Auto Scaling Group.
3. Place an **Application Load Balancer (ALB)** in front.
4. Configure target group health check to `/`.
5. Route traffic through ALB DNS.

This architecture supports horizontal scaling and high availability.

## 5) Cloud Architecture Awareness Built In

- **EC2-friendly:** static files, no server state.
- **ELB-ready:** identical stateless instances behind load balancer.
- **S3-ready images:** event image field already uses URL references and can be swapped to S3 object URLs later.
- **External API fetch:** event data pulled dynamically at runtime.

Example future S3 mapping (in `eventsApi.js`):

```js
image: `https://<bucket>.s3.<region>.amazonaws.com/events/${event.id}.jpg`
```

## Run Locally

Because this uses ES modules, run with any static server:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173`
