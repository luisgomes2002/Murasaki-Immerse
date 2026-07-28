// Murasaki Immerse — Dashboard do popup
// Exibe streak (badge), cards today/week/month, breakdown por idioma, gráfico semanal e region switch.

import { LANGUAGES, COUNTRIES, getLanguageName } from '../utils/languages.js';

// ---------- Mapeamento país → hl ----------

const COUNTRY_TO_HL = {
  'AR': 'es', 'AU': 'en', 'AT': 'de', 'BE': 'nl', 'BR': 'pt',
  'CA': 'en', 'CL': 'es', 'CO': 'es', 'CZ': 'cs', 'DK': 'da',
  'EG': 'ar', 'FI': 'fi', 'FR': 'fr', 'DE': 'de', 'GR': 'el',
  'HK': 'zh', 'HU': 'hu', 'IN': 'hi', 'ID': 'id', 'IE': 'en',
  'IL': 'he', 'IT': 'it', 'JP': 'ja', 'KR': 'ko', 'MY': 'ms',
  'MX': 'es', 'NL': 'nl', 'NZ': 'en', 'NG': 'en', 'NO': 'no',
  'PE': 'es', 'PH': 'en', 'PL': 'pl', 'PT': 'pt', 'RO': 'ro',
  'RU': 'ru', 'SA': 'ar', 'SG': 'en', 'ZA': 'en', 'ES': 'es',
  'SE': 'sv', 'CH': 'de', 'TW': 'zh', 'TH': 'th', 'TR': 'tr',
  'UA': 'uk', 'GB': 'en', 'US': 'en', 'VN': 'vi'
};

// ---------- Cores das barras (ciclo) ----------

const BAR_COLORS = [
  '#8b5cf6', '#60a5fa', '#34d399', '#fbbf24', '#f87171',
  '#c084fc', '#fb923c', '#4ade80', '#f472b6', '#a78bfa'
];

// ---------- Elementos do DOM ----------

const todayValue = document.getElementById('today-value');
const weekValue = document.getElementById('week-value');
const monthValue = document.getElementById('month-value');
const languagesList = document.getElementById('languages-list');
const weekChart = document.getElementById('week-chart');
const lastUpdate = document.getElementById('last-update');
const refreshBtn = document.getElementById('refresh-btn');

// Region switch
const regionToggle = document.getElementById('region-toggle');
const regionChevron = document.getElementById('region-chevron');
const regionBody = document.getElementById('region-body');
const regionInactive = document.getElementById('region-inactive');
const regionActive = document.getElementById('region-active');
const regionCountrySelect = document.getElementById('region-country');
const regionSwitchBtn = document.getElementById('region-switch-btn');
const regionRestoreBtn = document.getElementById('region-restore-btn');
const regionCurrent = document.getElementById('region-current');

// ---------- Inicialização ----------

document.addEventListener('DOMContentLoaded', init);

async function init() {
  populateRegionDropdown();
  await loadDashboard();
  await checkRegionStatus();

  refreshBtn.addEventListener('click', loadDashboard);
  regionToggle.addEventListener('click', toggleRegion);
  regionSwitchBtn.addEventListener('click', onRegionSwitch);
  regionRestoreBtn.addEventListener('click', onRegionRestore);
}

// ---------- Dashboard ----------

async function loadDashboard() {
  try {
    const [streakResp, todayResp, weekResp, monthResp] = await Promise.all([
      chrome.runtime.sendMessage({ type: 'GET_STREAK' }),
      chrome.runtime.sendMessage({ type: 'GET_TODAY' }),
      chrome.runtime.sendMessage({ type: 'GET_WEEK' }),
      chrome.runtime.sendMessage({ type: 'GET_MONTH' })
    ]);

    renderStats(streakResp?.streak || 0, todayResp, weekResp || [], monthResp || []);
    renderLanguages(todayResp?.languages || {}, todayResp?.totalSeconds || 0);
    renderWeekChart(weekResp || []);

    lastUpdate.textContent = `Updated ${formatTime(new Date())}`;
  } catch (err) {
    console.error('Dashboard load error:', err);
    lastUpdate.textContent = 'Failed to load';
  }
}

// ---------- Stats ----------

function renderStats(streak, today, weekData, monthData) {
  // Streak badge no header
  document.getElementById('streak-value').textContent = streak;

  // Today
  const todaySec = today?.totalSeconds || 0;
  todayValue.textContent = formatDuration(todaySec);

  // This week — soma dos totalSeconds do array de 7 dias
  const weekSec = weekData.reduce((sum, day) => sum + (day.totalSeconds || 0), 0);
  weekValue.textContent = formatDuration(weekSec);

  // This month — soma dos totalSeconds do array de 4 semanas
  const monthSec = monthData.reduce((sum, week) => sum + (week.totalSeconds || 0), 0);
  monthValue.textContent = formatDuration(monthSec);
}

// ---------- Language breakdown ----------

function renderLanguages(languages, totalSeconds) {
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);

  if (entries.length === 0) {
    languagesList.innerHTML = '<div class="empty-hint">No immersion data yet. Start watching!</div>';
    return;
  }

  let html = '';
  const maxSec = entries[0][1];

  entries.forEach(([code, sec], i) => {
    const name = getLanguageName(code);
    const pct = totalSeconds > 0 ? Math.round((sec / totalSeconds) * 100) : 0;
    const barPct = maxSec > 0 ? (sec / maxSec) * 100 : 0;
    const color = BAR_COLORS[i % BAR_COLORS.length];

    html += `
      <div class="language-bar">
        <span class="language-name">${escapeHtml(name)}</span>
        <div class="language-track">
          <div class="language-fill" style="width:${barPct}%;background:${color};"></div>
        </div>
        <span class="language-time">${formatDuration(sec)}</span>
      </div>`;
  });

  languagesList.innerHTML = html;
}

// ---------- Week chart ----------

function renderWeekChart(weekData) {
  if (!weekData || weekData.length === 0) {
    weekChart.innerHTML = '<div class="empty-hint">No data yet</div>';
    return;
  }

  // Encontra o máximo para escala
  let maxSec = 1;
  for (const day of weekData) {
    if (day.totalSeconds > maxSec) maxSec = day.totalSeconds;
  }

  // Ordem cronológica: dia 6 atrás → hoje
  const ordered = [...weekData].reverse();

  let html = '';
  for (const day of ordered) {
    const height = maxSec > 0 ? Math.max(4, (day.totalSeconds / maxSec) * 60) : 4;
    const label = formatDayLabel(day.date);
    const isEmpty = day.totalSeconds === 0;

    html += `
      <div class="week-bar-wrap" title="${label}: ${formatDuration(day.totalSeconds)}">
        <div class="week-bar${isEmpty ? ' empty' : ''}" style="height:${height}px;"></div>
        <span class="week-label">${label}</span>
      </div>`;
  }

  weekChart.innerHTML = html;
}

// ---------- Region Switch ----------

function populateRegionDropdown() {
  while (regionCountrySelect.options.length > 0) {
    regionCountrySelect.remove(0);
  }

  for (const country of COUNTRIES) {
    const option = document.createElement('option');
    option.value = country.code;
    option.textContent = country.name;
    regionCountrySelect.appendChild(option);
  }
}

async function checkRegionStatus() {
  try {
    const response = await chrome.runtime.sendMessage({ type: 'GET_REGION' });
    if (response && response.countryCode) {
      const country = COUNTRIES.find(c => c.code === response.countryCode);
      regionCurrent.textContent = country ? country.name : response.countryCode;
      regionActive.classList.remove('hidden');
      regionInactive.classList.add('hidden');
    } else {
      regionActive.classList.add('hidden');
      regionInactive.classList.remove('hidden');
    }
  } catch {
    regionActive.classList.add('hidden');
    regionInactive.classList.remove('hidden');
  }
}

function toggleRegion() {
  const isOpen = !regionBody.classList.contains('hidden');
  if (isOpen) {
    regionBody.classList.add('hidden');
    regionToggle.classList.remove('open');
  } else {
    regionBody.classList.remove('hidden');
    regionToggle.classList.add('open');
  }
}

async function onRegionSwitch() {
  const countryCode = regionCountrySelect.value;
  if (!countryCode) return;

  const hl = COUNTRY_TO_HL[countryCode] || countryCode.toLowerCase();

  await chrome.runtime.sendMessage({
    type: 'SET_REGION',
    payload: { countryCode, hl }
  });

  reloadYouTubeTab(countryCode, hl);
  await checkRegionStatus();
}

async function onRegionRestore() {
  await chrome.runtime.sendMessage({ type: 'CLEAR_REGION' });

  reloadYouTubeTab();
  await checkRegionStatus();
}

function reloadYouTubeTab(countryCode, hl) {
  chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
    for (const tab of tabs) {
      if (countryCode && hl) {
        const newUrl = `https://www.youtube.com/?persist_gl=1&gl=${countryCode}&hl=${hl}`;
        chrome.tabs.update(tab.id, { url: newUrl });
      } else {
        chrome.tabs.update(tab.id, { url: 'https://www.youtube.com/' });
      }
    }
  });
}

// ---------- Formatação ----------

function formatDuration(totalSeconds) {
  if (totalSeconds <= 0) return '0m';

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatDayLabel(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[d.getDay()];
}

function formatTime(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str || '';
  return div.innerHTML;
}
