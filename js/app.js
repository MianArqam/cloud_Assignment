import { fetchEvents } from './services/eventsApi.js';

const REFRESH_INTERVAL_MS = 120000;
let allEvents = [];

const grid = document.getElementById('eventsGrid');
const loader = document.getElementById('loader');
const totalEventsCount = document.getElementById('totalEventsCount');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const modalOverlay = document.getElementById('eventModalOverlay');
const modal = document.getElementById('eventModal');

const fmtShort = (date) => new Date(date).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
const fmtFull = (date) => new Date(date).toLocaleString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });

function renderEvents(events) {
  if (!events.length) {
    grid.innerHTML = '<p class="event-meta">No events match your search. Try another keyword.</p>';
    return;
  }

  grid.innerHTML = events
    .map((event) => `
      <article class="event-card" data-id="${event.id}">
        <img src="${event.image}" alt="${event.title}" loading="lazy" />
        <div class="event-content">
          <h3>${event.title}</h3>
          <p class="event-meta">${fmtShort(event.date)}</p>
          <p class="event-meta">📍 ${event.venue}</p>
          <p class="event-description">${event.description}</p>
        </div>
      </article>
    `)
    .join('');
}

function openModal(event) {
  modal.innerHTML = `
    <button class="close-btn" aria-label="Close event details">×</button>
    <img src="${event.image}" alt="${event.title}" />
    <h2>${event.title}</h2>
    <p class="event-meta">${fmtFull(event.date)}</p>
    <p class="event-meta">📍 ${event.venue}</p>
    <p>${event.description}</p>
    ${event.url !== '#' ? `<a class="external-link" href="${event.url}" target="_blank" rel="noreferrer">View source event page</a>` : ''}
  `;
  modalOverlay.classList.remove('hidden');
}

async function loadEvents() {
  loader.classList.remove('hidden');
  allEvents = await fetchEvents();
  totalEventsCount.textContent = `${allEvents.length} live events`;
  renderEvents(allEvents);
  loader.classList.add('hidden');
}

searchInput.addEventListener('input', (e) => {
  const q = e.target.value.trim().toLowerCase();
  const filtered = !q
    ? allEvents
    : allEvents.filter((ev) => [ev.title, ev.venue, ev.description].some((t) => t.toLowerCase().includes(q)));
  renderEvents(filtered);
});

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  themeToggle.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay || e.target.classList.contains('close-btn')) {
    modalOverlay.classList.add('hidden');
  }
});

grid.addEventListener('click', (e) => {
  const card = e.target.closest('.event-card');
  if (!card) return;
  const event = allEvents.find((ev) => ev.id === card.dataset.id);
  if (event) openModal(event);
});

const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
  document.body.classList.remove('dark');
  themeToggle.textContent = '🌙';
}

await loadEvents();
setInterval(loadEvents, REFRESH_INTERVAL_MS);
