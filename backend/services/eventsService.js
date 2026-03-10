import { fallbackEvents } from '../data/fallbackEvents.js';

const EVENTS_API_URL = process.env.EVENTS_API_URL ||
  'https://kudago.com/public-api/v1.4/events/?lang=en&page_size=30&location=msk&fields=id,title,description,dates,place,images,site_url';

const S3_BUCKET = process.env.S3_BUCKET || 'unievent-media';
const AWS_REGION = process.env.AWS_REGION || 'us-east-1';
const S3_PREFIX = process.env.S3_PREFIX || 'events';

let lastRawSample = null;

const stripHtml = (text = '') => text.replace(/<[^>]+>/g, '');

function buildImageStorageMetadata(eventId, imageUrl) {
  const key = `${S3_PREFIX}/${eventId}.jpg`;

  return {
    strategy: imageUrl ? 'external-url' : 's3-placeholder',
    s3Bucket: S3_BUCKET,
    s3Region: AWS_REGION,
    s3Key: key,
    s3Url: `https://${S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${key}`
  };
}

function mapProviderEvent(item) {
  const eventId = String(item.id);
  const imageUrl = item?.images?.[0]?.image || null;

  return {
    id: eventId,
    title: item.title || 'Untitled Event',
    date: item?.dates?.[0]?.start ? new Date(item.dates[0].start * 1000).toISOString() : new Date().toISOString(),
    venue: item?.place?.title || 'Venue TBA',
    description: stripHtml(item.description || 'No description provided.').slice(0, 280),
    image: imageUrl || `https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80`,
    imageStorage: buildImageStorageMetadata(eventId, imageUrl),
    sourceUrl: item.site_url || '#'
  };
}

export async function fetchEvents() {
  try {
    const response = await fetch(EVENTS_API_URL, {
      headers: { Accept: 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Provider request failed with status ${response.status}`);
    }

    const payload = await response.json();
    lastRawSample = payload?.results?.[0] || null;

    if (!payload?.results?.length) {
      return { events: fallbackEvents, source: 'fallback-empty-provider-result' };
    }

    return {
      events: payload.results.map(mapProviderEvent),
      source: 'kudago-live'
    };
  } catch (error) {
    console.warn('[eventsService] fallback activated:', error.message);
    return {
      events: fallbackEvents,
      source: 'fallback-provider-error'
    };
  }
}

export function getLastRawSample() {
  return lastRawSample;
}
