import { initThreeHero } from './threeScene.js';
import { fetchEvents } from './services/eventsApi.js';

const REFRESH_INTERVAL_MS = 120000;
let allEvents = [];
let modalOpen = false;

const grid = document.getElementById('eventsGrid');
const loader = document.getElementById('loader');
const totalEventsCount = document.getElementById('totalEventsCount');
const searchInput = document.getElementById('searchInput');
const themeToggle = document.getElementById('themeToggle');
const modalOverlay = document.getElementById('eventModalOverlay');
const modal = document.getElementById('eventModal');
const dateFilter = document.getElementById('dateFilter');
const refreshBtn = document.getElementById('refreshBtn');
const heroCanvas = document.getElementById('heroCanvas');

const fmtShort = (date) =>
  new Date(date).toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

const fmtFull = (date) =>
  new Date(date).toLocaleString([], {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

const capitalize = (value = '') => value.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

function dateMatchesFilter(date, filter) {
  if (filter === 'all') return true;

  const now = new Date();
  const target = new Date(date);
  const diffMs = target - now;

  if (filter === 'today') {
    return target.toDateString() === now.toDateString();
  }

  if (filter === 'week') {
    return diffMs >= 0 && diffMs <= 7 * 24 * 60 * 60 * 1000;
  }

  if (filter === 'month') {
    return target.getMonth() === now.getMonth() && target.getFullYear() === now.getFullYear();
  }

  return true;
}

function renderEvents(events) {
  if (!events.length) {
    grid.innerHTML = '<p class="event-meta empty-message">No events match your filters. Try another keyword.</p>';
    return;
  }

  grid.innerHTML = events
    .map(
      (event) => `
      <article class="event-card" data-id="${event.id}">
        <img src="${event.image}" alt="${event.title}" loading="lazy" />
        <div class="event-content">
          <p class="event-tag">${capitalize(event.category || 'student-life')}</p>
          <h3>${event.title}</h3>
          <p class="event-meta">${fmtShort(event.date)}</p>
          <p class="event-meta">📍 ${event.venue}</p>
          <p class="event-description">${event.description}</p>
        </div>
      </article>
    `
    )
    .join('');
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();
  const selectedDate = dateFilter.value;

  const filtered = allEvents.filter((ev) => {
    const textMatch = !q || [ev.title, ev.venue, ev.description, ev.category || ''].some((t) => t.toLowerCase().includes(q));
    const dateMatch = dateMatchesFilter(ev.date, selectedDate);
    return textMatch && dateMatch;
  });

  renderEvents(filtered);
}

function openModal(event) {
  modal.innerHTML = `
    <button class="close-btn" aria-label="Close event details">×</button>
    <img src="${event.image}" alt="${event.title}" />
    <h2>${event.title}</h2>
    <p class="event-tag">${capitalize(event.category || 'student-life')}</p>
    <p class="event-meta">${fmtFull(event.date)}</p>
    <p class="event-meta">📍 ${event.venue}</p>
    <p>${event.description}</p>
    ${event.url !== '#' ? `<a class="external-link" href="${event.url}" target="_blank" rel="noreferrer">View source event page</a>` : ''}
  `;
  modalOverlay.classList.remove('hidden');
  modal.focus();
  modalOpen = true;
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  modalOpen = false;
}

async function loadEvents() {
  loader.classList.remove('hidden');
  refreshBtn.disabled = true;
  allEvents = await fetchEvents();
  totalEventsCount.textContent = `${allEvents.length} live events`;
  applyFilters();
  loader.classList.add('hidden');
  refreshBtn.disabled = false;
}

let debounceTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(applyFilters, 180);
});

dateFilter.addEventListener('change', applyFilters);

refreshBtn.addEventListener('click', loadEvents);

themeToggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  const dark = document.body.classList.contains('dark');
  themeToggle.textContent = dark ? '☀️' : '🌙';
  localStorage.setItem('theme', dark ? 'dark' : 'light');
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay || e.target.classList.contains('close-btn')) {
    closeModal();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modalOpen) {
    closeModal();
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

const destroyThree = initThreeHero(heroCanvas);

await loadEvents();
setInterval(loadEvents, REFRESH_INTERVAL_MS);

window.addEventListener('beforeunload', () => {
  destroyThree();
});
