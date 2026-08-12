import {
  DEFAULT_DAILY_GOAL_SECONDS,
  getDailyGoal,
  setDailyGoal,
} from "../utils/storage.js";

const languageNames = new Intl.DisplayNames([navigator.language], { type: 'language' });

const languageList = document.getElementById('language-list');
const refreshButton = document.getElementById('refresh');
const languageFilter = document.getElementById('language-filter');
const todayTotal = document.getElementById('today-total');
const weekTotal = document.getElementById('week-total');
const monthTotal = document.getElementById('month-total');
const activityGrid = document.getElementById('activity-grid');
let immersionData = {};
const yearFilter = document.getElementById('year-filter');
const monthFilter = document.getElementById('month-filter');
const periodDescription = document.getElementById('period-description');
const activityDescription = document.getElementById('activity-description');
const languageHeading = document.getElementById('language-heading');
const dailyGoalMinutes = document.getElementById('daily-goal-minutes');
const saveDailyGoalButton = document.getElementById('save-daily-goal');
const goalProgressLabel = document.getElementById('goal-progress-label');
const goalProgressBar = document.getElementById('goal-progress-bar');
const activeDaysValue = document.getElementById('active-days-value');
const weekChangeValue = document.getElementById('week-change-value');
const weekChangeDetail = document.getElementById('week-change-detail');
const averageDayValue = document.getElementById('average-day-value');
const trendChart = document.getElementById('trend-chart');

let dailyGoalSeconds = DEFAULT_DAILY_GOAL_SECONDS;

refreshButton.addEventListener('click', loadDetails);
saveDailyGoalButton.addEventListener('click', saveDailyGoal);
languageFilter.addEventListener('change', () => renderPeriod(immersionData));
yearFilter.addEventListener('change', () => {
  populateMonthFilter();
  renderPeriod(immersionData);
});
monthFilter.addEventListener('change', () => renderPeriod(immersionData));
loadDetails();

async function loadDetails() {
  try {
    // Lê diretamente o mesmo armazenamento local usado pelo popup. Isso evita
    // depender do ciclo de vida do service worker nesta página separada.
    const [result, savedDailyGoal] = await Promise.all([
      chrome.storage.local.get("immersion_data"),
      getDailyGoal(),
    ]);
    const data = result.immersion_data || {};
    dailyGoalSeconds = savedDailyGoal;
    dailyGoalMinutes.value = String(dailyGoalSeconds / 60);
    immersionData = data;
    populateLanguageFilter(data);
    populateYearFilter(data);
    populateMonthFilter();
    renderSummary(data);
    renderInsights(data);
    renderPeriod(data);
  } catch (error) {
    console.error('Could not load language totals:', error);
    languageList.innerHTML = '<p class="empty">Could not load details.</p>';
  }
}

function populateLanguageFilter(data) {
  const selectedLanguage = languageFilter.value;
  const languages = new Set();

  Object.values(data).forEach((dailyLanguages) => {
    Object.keys(dailyLanguages).forEach((language) => languages.add(language));
  });

  const options = [...languages].sort().map((language) => {
    const name = languageNames.of(language) || language;
    return '<option value="' + language + '">' + name + '</option>';
  });
  languageFilter.innerHTML = '<option value="all">All languages</option>' + options.join('');
  languageFilter.value = languages.has(selectedLanguage) ? selectedLanguage : 'all';
}

function populateYearFilter(data) {
  const selectedYear = yearFilter.value;
  const years = new Set(Object.keys(data).map((date) => date.slice(0, 4)));
  years.add(String(new Date().getFullYear()));

  const options = [...years].sort().reverse().map((year) => '<option value="' + year + '">' + year + '</option>');
  yearFilter.innerHTML = '<option value="all">All years</option>' + options.join('');
  yearFilter.value = years.has(selectedYear) ? selectedYear : 'all';
}

function populateMonthFilter() {
  const selectedMonth = monthFilter.value;
  const hasYear = yearFilter.value !== 'all';
  monthFilter.disabled = !hasYear;

  const months = Array.from({ length: 12 }, (_, index) => {
    return new Intl.DateTimeFormat(navigator.language, { month: 'long' }).format(new Date(2000, index, 1));
  });
  monthFilter.innerHTML = '<option value="all">All months</option>' + months.map((month, index) => '<option value="' + (index + 1) + '">' + month + '</option>').join('');
  monthFilter.value = hasYear && Number(selectedMonth) >= 1 && Number(selectedMonth) <= 12 ? selectedMonth : 'all';
}

function renderPeriod(data) {
  const entries = Object.entries(data).filter(([date]) => matchesSelectedPeriod(date));
  const label = getSelectedPeriodLabel();
  periodDescription.textContent = label + ', separated by language.';
  languageHeading.textContent = 'Time by language — ' + label;
  renderLanguageTotals(entries);
  renderActivity(data, languageFilter.value);
}

function renderLanguageTotals(entries) {
  const totals = {};
  entries.forEach(([, languages]) => {
    Object.entries(languages).forEach(([language, seconds]) => {
      totals[language] = (totals[language] || 0) + Number(seconds || 0);
    });
  });
  const languages = Object.entries(totals).sort((a, b) => b[1] - a[1]);
  if (!languages.length) {
    languageList.innerHTML = '<p class="empty">No immersion data in this period.</p>';
    return;
  }
  const maxSeconds = languages[0][1];
  languageList.innerHTML = languages.map(() => '<div class="language-row"><span class="language-name"></span><div class="track"><div class="fill"></div></div><span class="time"></span></div>').join('');
  languages.forEach(([code, seconds], index) => {
    const row = languageList.children[index];
    row.querySelector('.language-name').textContent = languageNames.of(code) || code;
    row.querySelector('.fill').style.width = ((seconds / maxSeconds) * 100) + '%';
    row.querySelector('.time').textContent = formatDuration(seconds);
  });
}

function matchesSelectedPeriod(date) {
  if (yearFilter.value !== 'all' && date.slice(0, 4) !== yearFilter.value) return false;
  if (monthFilter.value !== 'all' && Number(date.slice(5, 7)) !== Number(monthFilter.value)) return false;
  return true;
}

function getSelectedPeriodLabel() {
  if (yearFilter.value === 'all') return 'All saved history';
  if (monthFilter.value === 'all') return yearFilter.value;
  const date = new Date(Number(yearFilter.value), Number(monthFilter.value) - 1, 1);
  return new Intl.DateTimeFormat(navigator.language, { month: 'long', year: 'numeric' }).format(date);
}

async function saveDailyGoal() {
  try {
    dailyGoalSeconds = await setDailyGoal(Number(dailyGoalMinutes.value) * 60);
    dailyGoalMinutes.value = String(dailyGoalSeconds / 60);
    renderInsights(immersionData);
  } catch (error) {
    console.error("Could not save daily goal:", error);
  }
}

function renderInsights(data) {
  const recentThirtyDays = getRecentDayEntries(data, 30);
  const activeDays = recentThirtyDays.filter((day) => day.seconds > 0);
  const todaySeconds = recentThirtyDays[0].seconds;
  const progress = Math.min(100, Math.round((todaySeconds / dailyGoalSeconds) * 100));
  const currentWeek = getRecentDayEntries(data, 7);
  const previousWeek = getRecentDayEntries(data, 7, 7);
  const currentWeekTotal = currentWeek.reduce((total, day) => total + day.seconds, 0);
  const previousWeekTotal = previousWeek.reduce((total, day) => total + day.seconds, 0);
  const averageActiveDay = activeDays.length
    ? activeDays.reduce((total, day) => total + day.seconds, 0) / activeDays.length
    : 0;

  goalProgressLabel.textContent = formatDuration(todaySeconds) + " of " + formatDuration(dailyGoalSeconds) + " (" + progress + "%)";
  goalProgressBar.style.width = progress + "%";
  activeDaysValue.textContent = activeDays.length;
  averageDayValue.textContent = formatDuration(averageActiveDay);

  if (previousWeekTotal === 0) {
    weekChangeValue.textContent = currentWeekTotal > 0 ? "New" : "—";
    weekChangeDetail.textContent = currentWeekTotal > 0 ? "first active week" : "no activity yet";
  } else {
    const change = Math.round(((currentWeekTotal - previousWeekTotal) / previousWeekTotal) * 100);
    weekChangeValue.textContent = (change > 0 ? "+" : "") + change + "%";
    weekChangeDetail.textContent = formatDuration(Math.abs(currentWeekTotal - previousWeekTotal)) + (change >= 0 ? " more" : " less") + " than previous 7 days";
  }

  renderTrend(getRecentDayEntries(data, 14).reverse());
}

function getRecentDayEntries(data, days, startOffset = 0) {
  const entries = [];
  const today = new Date();

  for (let offset = startOffset; offset < startOffset + days; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    const key = getDateKey(date);
    entries.push({ date: key, seconds: getDayTotal(data[key], "all") });
  }

  return entries;
}

function renderTrend(days) {
  const maxSeconds = Math.max(...days.map((day) => day.seconds), 1);
  trendChart.innerHTML = days.map(({ date, seconds }) => {
    const height = seconds === 0 ? 3 : Math.max(6, Math.round((seconds / maxSeconds) * 100));
    return "<div class=\"trend-bar-wrap\" title=\"" + date + ": " + formatDuration(seconds) + "\"><i class=\"trend-bar\" style=\"height:" + height + "%\"></i><span>" + date.slice(8) + "</span></div>";
  }).join("");
}

function renderSummary(data) {
  todayTotal.textContent = formatDuration(totalInRecentDays(data, 1));
  weekTotal.textContent = formatDuration(totalInRecentDays(data, 7));
  monthTotal.textContent = formatDuration(totalInRecentDays(data, 30));
}

function renderActivity(data, language) {
  const dates = getActivityDates();
  activityGrid.style.setProperty('--activity-columns', Math.max(1, Math.ceil(dates.length / 7)));
  const days = dates.map((date) => {
    const key = getDateKey(date);
    return { date: key, seconds: getDayTotal(data[key], language) };
  });

  const maxSeconds = Math.max(...days.map((day) => day.seconds), 1);
  activityGrid.innerHTML = days.map(({ date, seconds }) => {
    const level = seconds === 0 ? 0 : Math.max(1, Math.ceil((seconds / maxSeconds) * 4));
    return '<span class="activity-day" data-level="' + level + '" title="' + date + ': ' + formatDuration(seconds) + '"></span>';
  }).join('');
}
function getActivityDates() {
  const dates = [];
  const today = new Date();
  let start;
  let end;

  if (yearFilter.value === 'all') {
    start = new Date(today);
    start.setDate(today.getDate() - 83);
    end = today;
    activityDescription.textContent = 'Last 12 weeks';
  } else {
    const year = Number(yearFilter.value);
    const month = monthFilter.value === 'all' ? null : Number(monthFilter.value);
    start = new Date(year, month === null ? 0 : month - 1, 1);
    end = month === null ? new Date(year, 11, 31) : new Date(year, month, 0);
    if (end > today) end = today;
    activityDescription.textContent = getSelectedPeriodLabel();
  }

  for (const date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(new Date(date));
  }

  return dates;
}
function totalInRecentDays(data, days) {
  let total = 0;
  const today = new Date();

  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - offset);
    total += getDayTotal(data[getDateKey(date)], 'all');
  }
  return total;
}

function getDayTotal(languages, language) {
  if (!languages) return 0;
  if (language !== 'all') return Number(languages[language] || 0);
  return Object.values(languages).reduce((total, seconds) => total + Number(seconds || 0), 0);
}

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (n) => String(n).padStart(2, '0');
  if (totalSeconds >= 3600) return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
  return pad(minutes) + ':' + pad(seconds);
}
