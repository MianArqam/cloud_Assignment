# UniEvent 🎓

A modern, responsive, Gen-Z style **university event management web app** with dynamic event browsing and cloud-friendly deployment structure.

## 1) Full Project Folder Structure

```text
cloud_Assignment/
├── index.html
├── styles.css
├── health.html
├── js/
│   ├── app.js
│   ├── data/
│   │   └── fallbackEvents.js
│   └── services/
│       └── eventsApi.js
├── deploy/
│   └── nginx/
│       └── unievent.conf
└── README.md
```

## 2) Frontend Implementation Delivered

- Responsive navbar with search
- Hero landing section
- Card-based event grid layout
- Event detail modal popup
- Dark/light theme toggle (saved in localStorage)
- Loading animation
- Smooth card hover transitions
- Mobile-first responsive design
- Date filtering (today/week/month)
- Manual refresh button + automatic refresh every 2 minutes

## 3) Sample API Integration Logic

The app fetches events from KudaGo public API:

- Source file: `js/services/eventsApi.js`
- Endpoint:
  - `https://kudago.com/public-api/v1.4/events/?lang=en&page_size=40&location=msk&fields=id,title,description,dates,place,images,site_url,categories`

Flow:
1. Fetch JSON data from external API.
2. Normalize fields (`title`, `date`, `venue`, `description`, `image`, `url`, `category`).
3. If API fails, automatically fallback to local sample data (`js/data/fallbackEvents.js`).
4. Frontend refreshes data every 120 seconds.

### S3-ready image design

Image references are URL-based and can be migrated directly to AWS S3 object URLs later:

```js
image: `https://<bucket>.s3.<region>.amazonaws.com/events/${event.id}.jpg`
```

## 4) AWS EC2 Deployment Instructions

### Option A: Single EC2 (quick setup)

1. Launch Ubuntu/Amazon Linux EC2.
2. Install Nginx.
3. Copy repo content to `/var/www/unievent`.
4. Use `deploy/nginx/unievent.conf` as Nginx site config.
5. Restart Nginx and open EC2 public IP.

### Option B: Multi-instance EC2 behind ALB (scalable)

1. Deploy same static files to multiple EC2 instances.
2. Put instances into an Auto Scaling Group.
3. Attach instances to an Application Load Balancer target group.
4. Configure ALB health check path to `/health`.
5. Route traffic to ALB DNS (or Route53 record).

## 5) Architecture Awareness for Cloud Scale

- **Stateless frontend** -> safe for horizontal scaling behind ELB/ALB.
- **No in-instance persistence** -> instances can be replaced safely.
- **External API data source** -> independent of instance lifecycle.
- **S3-compatible asset strategy** -> easy migration for event images and static media.

## Run Locally

Because this is static + ES modules, use any local static server:

```bash
python3 -m http.server 4173
```

Then open:

- `http://localhost:4173`
