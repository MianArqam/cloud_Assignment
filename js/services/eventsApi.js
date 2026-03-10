import { fallbackEvents } from '../data/fallbackEvents.js';

const EVENTS_ENDPOINT =
  'https://kudago.com/public-api/v1.4/events/?lang=en&page_size=40&location=msk&fields=id,title,description,dates,place,images,site_url,categories';

const stripHtml = (text = '') => text.replace(/<[^>]+>/g, '');

const mapEvent = (event) => ({
  id: String(event.id),
  title: event.title || 'Untitled Event',
  description: stripHtml(event.description || 'No description available yet.').slice(0, 220),
  date: event?.dates?.[0]?.start
    ? new Date(event.dates[0].start * 1000).toISOString()
    : new Date().toISOString(),
  venue: event?.place?.title || 'Campus Venue TBA',
  category: event?.categories?.[0] || 'student-life',
  // Can later be replaced with S3 URL pattern: https://bucket.s3.region.amazonaws.com/events/<id>.jpg
  image:
    event?.images?.[0]?.image ||
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
  url: event.site_url || '#'
});

export async function fetchEvents() {
  try {
    const res = await fetch(EVENTS_ENDPOINT, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`API status ${res.status}`);

    const data = await res.json();
    if (!data?.results?.length) return fallbackEvents;
    return data.results.map(mapEvent);
  } catch (error) {
    console.warn('Using fallback events due to API issue:', error.message);
    return fallbackEvents;
  }
}
