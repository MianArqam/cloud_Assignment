# UniEvent Planner ✨

UniEvent is a student-friendly university event platform with:

- A modern responsive frontend (glass UI + Three.js interaction)
- A backend events service that fetches from a public Events API
- A normalized `/api/events` response designed for the frontend
- Deployment patterns suitable for multi-instance AWS environments

---

## Recommended Project Structure (Frontend + Backend)

```text
cloud_Assignment/
├── index.html
├── styles.css
├── js/
│   ├── app.js
│   ├── threeScene.js
│   ├── data/
│   │   └── fallbackEvents.js
│   └── services/
│       └── eventsApi.js
├── backend/
│   ├── server.js
│   ├── data/
│   │   └── fallbackEvents.js
│   ├── services/
│   │   └── eventsService.js
│   └── examples/
│       ├── provider-request.http
│       ├── provider-response.sample.json
│       └── unievent-events.sample.json
├── deploy/
│   └── nginx/
│       └── unievent.conf
├── health.html
├── package.json
└── README.md
```

---

## Backend: Public Events API Integration

### Selected provider

- **KudaGo Public Events API** (JSON)
- Configured in: `backend/services/eventsService.js`

### Backend endpoints

- `GET /api/events` → returns normalized UniEvent event objects
- `GET /api/events?refresh=1` → force immediate refresh
- `GET /api/events/raw-sample` → last raw provider event sample
- `GET /health` → backend health status

### Event object shape returned to frontend

Each event includes:

- `title`
- `date`
- `venue`
- `description`
- `image`

And metadata for cloud image handling:

- `imageStorage.s3Bucket`
- `imageStorage.s3Region`
- `imageStorage.s3Key`
- `imageStorage.s3Url`

---

## Periodic Fetch Design

The backend performs scheduled refresh in memory:

- Interval: `REFRESH_INTERVAL_MS` (default `120000` ms)
- Triggered on startup and repeated with `setInterval`
- Cached response served quickly to frontend

This reduces frontend dependency on external provider latency and gives a stable internal API for all web clients.

---

## Example API Request and JSON Response

### Provider request example

See file: `backend/examples/provider-request.http`

### Provider response example

See file: `backend/examples/provider-response.sample.json`

### UniEvent normalized response example

See file: `backend/examples/unievent-events.sample.json`

---

## How to Run Locally

### 1) Start backend

```bash
npm run start:backend
```

Backend runs on `http://localhost:8080`.

### 2) Start frontend

```bash
npm run start:frontend
```

Frontend runs on `http://localhost:4173` and fetches events from backend.

---

## Running Backend on an EC2 Instance

1. Launch EC2 instance (Node.js runtime).
2. Copy project files to instance (for example `/opt/unievent`).
3. Set environment variables (example):

```bash
export PORT=8080
export HOST=0.0.0.0
export REFRESH_INTERVAL_MS=120000
export EVENTS_API_URL='https://kudago.com/public-api/v1.4/events/?lang=en&page_size=30&location=msk&fields=id,title,description,dates,place,images,site_url'
export S3_BUCKET='unievent-media'
export AWS_REGION='us-east-1'
export S3_PREFIX='events'
```

4. Start service:

```bash
npm run start:backend
```

5. (Recommended) Run with `systemd` or PM2 for auto-restart.

---

## S3 Image Storage Strategy

Current design supports immediate migration to S3 without frontend schema changes:

- Backend always emits `imageStorage` metadata (`s3Bucket`, `s3Key`, `s3Url`)
- Today, image may come from provider URL (`strategy: external-url`)
- Later, an image-ingestion worker can upload to S3 using key pattern:
  - `events/<event-id>.jpg`
- Once uploaded, backend can switch `image` to `imageStorage.s3Url`

This allows gradual migration from third-party images to managed S3 assets.

---

## AWS Architecture Alignment (Production)

### Target architecture

- Multiple EC2 instances in **private subnets**
- Application Load Balancer (ALB) in public subnets
- Backend instances registered in ALB target group
- S3 bucket for event media
- IAM role attached to EC2 instances for secure S3 access

### High availability behavior

- Backend is stateless (cache is in-memory and rebuildable)
- Any instance can serve `/api/events`
- If one instance fails, ALB routes traffic to healthy instances
- Service continues via other instances + periodic refresh

### IAM recommendations

Attach an instance profile role with least-privilege permissions such as:

- `s3:PutObject`
- `s3:GetObject`
- `s3:ListBucket`

scoped to the UniEvent media bucket/prefix.

---

## Validation Commands

```bash
npm run check
```

```bash
curl http://localhost:8080/api/events
```
