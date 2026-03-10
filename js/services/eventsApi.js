import { fallbackEvents } from '../data/fallbackEvents.js';

const API_BASE = window.__UNIEVENT_API_BASE || 'http://localhost:8080';
const BACKEND_EVENTS_ENDPOINT = `${API_BASE}/api/events`;

function normalizeBackendEvent(event) {
  return {
    id: String(event.id),
    title: event.title || 'Untitled Event',
    description: (event.description || 'No description available').slice(0, 220),
    date: event.date || new Date().toISOString(),
    venue: event.venue || 'Campus Venue TBA',
    category: event.category || 'student-life',
    image:
      event.image ||
      event?.imageStorage?.s3Url ||
      'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',
    url: event.sourceUrl || '#'
  };
}

export async function fetchEvents() {
  try {
    const response = await fetch(BACKEND_EVENTS_ENDPOINT, {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`UniEvent backend request failed with status ${response.status}`);
    }

    const data = await response.json();

    if (!data?.events?.length) {
      return fallbackEvents;
    }

    return data.events.map(normalizeBackendEvent);
  } catch (error) {
    console.warn('Using frontend fallback events because backend is unavailable:', error.message);
    return fallbackEvents;
  }
}
