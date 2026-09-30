// Murasaki Immerse: popup local do rastreador

import { LANGUAGES, getLanguageName } from "../utils/languages.js";
import {
  getUiLanguagePreference,
  setUiLanguagePreference,
} from "../utils/storage.js";
import {
  applyTranslations,
  compareLanguageCodesByName,
  getLanguageDisplayName,
  initializeI18n,
  t,
} from "../utils/i18n.js";

const dashboard = document.getElementById("dashboard");
const nativeSettings = document.getElementById("native-settings");
const settingsToggle = document.getElementById("native-settings-toggle");
const settingsClose = document.getElementById("native-settings-close");
const nativeLanguageSelect = document.getElementById("native-language-select");
const videoLanguageSelect = document.getElementById("video-language-select");
const saveVideoLanguageButton = document.getElementById("save-video-language");
const currentVideoLanguage = document.getElementById("current-video-language");
const nativeLanguageChips = document.getElementById("native-language-chips");
const nativeLanguageMessage = document.getElementById(
  "native-language-message",
);
const addNativeLanguageButton = document.getElementById("add-native-language");
const saveNativeLanguagesButton = document.getElementById(
  "save-native-languages",
);
const exportBackupButton = document.getElementById("export-backup");
const importBackupButton = document.getElementById("import-backup");
const mergeBackupButton = document.getElementById("merge-backup");
const backupFileInput = document.getElementById("backup-file-input");
const backupMessage = document.getElementById("backup-message");
const connectGoogleButton = document.getElementById("connect-google");
const disconnectGoogleButton = document.getElementById("disconnect-google");
const googleConnectionStatus = document.getElementById(
  "google-connection-status",
);
const googleMessage = document.getElementById("google-message");
const todayValue = document.getElementById("today-value");
const weekValue = document.getElementById("week-value");
const monthValue = document.getElementById("month-value");
const languagesList = document.getElementById("languages-list");
const weekChart = document.getElementById("week-chart");
const lastUpdate = document.getElementById("last-update");
const localTimeZone = document.getElementById("local-time-zone");
const refreshBtn = document.getElementById("refresh-btn");
const appLanguageSelect = document.getElementById("app-language-select");

let nativeLanguages = [];
let setupComplete = false;
let pendingImportMode = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
  const languagePreference = await getUiLanguagePreference();
  initializeI18n(languagePreference);
  applyTranslations();
  appLanguageSelect.value = languagePreference;
  populateNativeLanguageDropdown();
  populateVideoLanguageDropdown();
  bindEvents();
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_NATIVE_LANGUAGES",
    });
    if (response?.error) throw new Error(response.error);
    nativeLanguages = response?.languages || [];
  } catch (error) {
    console.error("Native language settings failed to load:", error);
    setSettingsMessage(t("popup.settingsLoadFailed"), true);
  }
  setupComplete = nativeLanguages.length > 0;
  renderNativeLanguages();
  setSettingsOpen(!setupComplete);
  await loadGoogleConnectionStatus();
  if (setupComplete) {
    await loadDashboard();
    await loadCurrentVideoLanguage();
  }
  setInterval(() => {
    if (setupComplete) loadDashboard();
  }, 1000);
}

async function saveAppLanguagePreference() {
  await setUiLanguagePreference(appLanguageSelect.value);
  window.location.reload();
}

function bindEvents() {
  refreshBtn.addEventListener("click", loadDashboard);
  appLanguageSelect.addEventListener("change", saveAppLanguagePreference);
  saveVideoLanguageButton.addEventListener("click", saveCurrentVideoLanguage);
  settingsToggle.addEventListener("click", () => setSettingsOpen(true));
  settingsClose.addEventListener("click", () => {
    if (setupComplete) setSettingsOpen(false);
  });
  addNativeLanguageButton.addEventListener("click", addNativeLanguage);
  saveNativeLanguagesButton.addEventListener("click", saveNativeLanguages);
  exportBackupButton.addEventListener("click", exportBackup);
  importBackupButton.addEventListener("click", () =>
    chooseBackupFile("replace"),
  );
  mergeBackupButton.addEventListener("click", () => chooseBackupFile("merge"));
  backupFileInput.addEventListener("change", importBackupFile);
  connectGoogleButton.addEventListener("click", connectGoogle);
  disconnectGoogleButton.addEventListener("click", disconnectGoogle);
  nativeLanguageChips.addEventListener("click", (event) => {
    const button = event.target.closest("[data-language]");
    if (!button) return;
    nativeLanguages = nativeLanguages.filter(
      (language) => language !== button.dataset.language,
    );
    setSettingsMessage("");
    renderNativeLanguages();
  });
}

function populateNativeLanguageDropdown() {
  nativeLanguageSelect.innerHTML =
    '<option value="">' + t('popup.selectLanguage') + '</option>';
  for (const language of getSortedLanguages()) {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = getLanguageDisplayName(language.code, language.name);
    nativeLanguageSelect.appendChild(option);
  }
}

function populateVideoLanguageDropdown() {
  videoLanguageSelect.innerHTML =
    '<option value="">' + t('popup.chooseVideoLanguage') + '</option>';
  for (const language of getSortedLanguages()) {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = getLanguageDisplayName(language.code, language.name);
    videoLanguageSelect.appendChild(option);
  }
}

function getSortedLanguages() {
  return [...LANGUAGES].sort((first, second) =>
    compareLanguageCodesByName(first.code, second.code, first.name, second.name),
  );
}

function addNativeLanguage() {
  const language = nativeLanguageSelect.value;
  if (!language) return setSettingsMessage(t("popup.chooseLanguageToAdd"), true);
  if (!nativeLanguages.includes(language)) nativeLanguages.push(language);
  nativeLanguageSelect.value = "";
  setSettingsMessage("");
  renderNativeLanguages();
}

function renderNativeLanguages() {
  if (!nativeLanguages.length) {
    nativeLanguageChips.innerHTML =
      '<span class="chips-placeholder">' + t('popup.noNativeLanguages') + '</span>';
  } else {
    nativeLanguageChips.innerHTML = [...nativeLanguages]
      .sort((first, second) =>
        compareLanguageCodesByName(
          first,
          second,
          getLanguageName(first),
          getLanguageName(second),
        ),
      )
      .map((language) => {
        const name = getLanguageDisplayName(language, getLanguageName(language));
        return (
          '<span class="language-chip">' +
          escapeHtml(name) +
          '<button type="button" data-language="' +
          escapeHtml(language) +
          '" aria-label="' +
          escapeHtml(t('popup.removeLanguage', { language: name })) +
          '">×</button></span>'
        );
      })
      .join("");
  }
  for (const option of nativeLanguageSelect.options)
    option.disabled = nativeLanguages.includes(option.value);
}

async function saveNativeLanguages() {
  if (!nativeLanguages.length)
    return setSettingsMessage(
      t("popup.addNativeLanguage"),
      true,
    );
  saveNativeLanguagesButton.disabled = true;
  saveNativeLanguagesButton.textContent = t("popup.saving");
  try {
    const response = await chrome.runtime.sendMessage({
      type: "SET_NATIVE_LANGUAGES",
      payload: { languages: nativeLanguages },
    });
    if (response?.error) throw new Error(response.error);
    nativeLanguages = response?.languages || nativeLanguages;
    setupComplete = true;
    setSettingsMessage("");
    setSettingsOpen(false);
    await loadDashboard();
  } catch (error) {
    console.error("Native language settings failed to save:", error);
    setSettingsMessage(t("popup.settingsSaveFailed"), true);
  } finally {
    saveNativeLanguagesButton.disabled = false;
    saveNativeLanguagesButton.textContent = t("popup.saveTracking");
  }
}

async function exportBackup() {
  setBackupMessage("");
  exportBackupButton.disabled = true;
  try {
    const backup = await chrome.runtime.sendMessage({ type: "EXPORT_BACKUP" });
    if (backup?.error) throw new Error(backup.error);

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" }),
    );
    const now = new Date();
    const date =
      String(now.getFullYear()) +
      "-" +
      String(now.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(now.getDate()).padStart(2, "0");
    const filename = "murasaki-immerse-backup-" + date + ".json";
    if (chrome.downloads?.download) {
      await chrome.downloads.download({ url, filename, saveAs: true });
    } else {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
    }
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
    setBackupMessage(t("popup.backupStarted"));
  } catch (error) {
    console.error("Backup export failed:", error);
    setBackupMessage(t("popup.backupExportFailed"), true);
  } finally {
    exportBackupButton.disabled = false;
  }
}

function chooseBackupFile(mode) {
  if (
    mode === "replace" &&
    !window.confirm(
      t("popup.replaceConfirm"),
    )
  )
    return;
  pendingImportMode = mode;
  backupFileInput.value = "";
  backupFileInput.click();
}

async function importBackupFile() {
  const file = backupFileInput.files?.[0];
  if (!file || !pendingImportMode) return;
  if (file.size > 5 * 1024 * 1024) {
    setBackupMessage(t("popup.backupTooLarge"), true);
    return;
  }

  const mode = pendingImportMode;
  pendingImportMode = null;
  const buttons = [importBackupButton, mergeBackupButton];
  buttons.forEach((button) => {
    button.disabled = true;
  });
  setBackupMessage(t("popup.importing"));
  try {
    const backup = JSON.parse(await file.text());
    const response = await chrome.runtime.sendMessage({
      type: "IMPORT_BACKUP",
      payload: { backup, merge: mode === "merge" },
    });
    if (response?.error) throw new Error(response.error);

    nativeLanguages = response.nativeLanguages || [];
    setupComplete = nativeLanguages.length > 0;
    renderNativeLanguages();
    setSettingsOpen(true);
    if (setupComplete) await loadDashboard();
    setBackupMessage(
      mode === "merge"
        ? t("popup.backupMerged")
        : t("popup.backupImported"),
    );
  } catch (error) {
    console.error("Backup import failed:", error);
    setBackupMessage(error.message || t("popup.backupImportFailed"), true);
  } finally {
    buttons.forEach((button) => {
      button.disabled = false;
    });
  }
}

function setBackupMessage(message, isError = false) {
  backupMessage.textContent = message;
  backupMessage.classList.toggle("is-error", Boolean(message && isError));
}

function setSettingsOpen(open) {
  nativeSettings.classList.toggle("hidden", !open);
  dashboard.classList.toggle("hidden", open);
  settingsToggle.classList.toggle("hidden", open && !setupComplete);
  settingsClose.classList.toggle("hidden", !setupComplete);
}

function setSettingsMessage(message, isError = false) {
  nativeLanguageMessage.textContent = message;
  nativeLanguageMessage.classList.toggle(
    "is-error",
    Boolean(message && isError),
  );
}

async function getActiveYouTubeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab?.id || !/^https?:\/\/([a-z]+\.)?youtube\.com\//i.test(tab.url || ""))
    return null;
  return tab;
}

async function loadCurrentVideoLanguage() {
  try {
    const tab = await getActiveYouTubeTab();
    if (!tab) throw new Error(t('popup.openVideo'));
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "GET_CURRENT_VIDEO_LANGUAGE",
    });
    if (!response?.videoId)
      throw new Error(t('popup.openWatchPage'));
    const language = response.language;
    videoLanguageSelect.value = LANGUAGES.some((item) => item.code === language)
      ? language
      : "";
    currentVideoLanguage.textContent =
      language && language !== "unknown"
        ? t('popup.detectedLanguage', {
            language: getLanguageDisplayName(language, getLanguageName(language)),
          })
        : t('popup.languageNotDetected');
    saveVideoLanguageButton.disabled = false;
  } catch (error) {
    currentVideoLanguage.textContent =
      error.message || t('popup.reloadYouTube');
    saveVideoLanguageButton.disabled = true;
  }
}

async function saveCurrentVideoLanguage() {
  const language = videoLanguageSelect.value;
  if (!language) {
    currentVideoLanguage.textContent = t('popup.chooseLanguageFirst');
    return;
  }
  try {
    const tab = await getActiveYouTubeTab();
    if (!tab) throw new Error(t('popup.openVideoFirst'));
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "SET_CURRENT_VIDEO_LANGUAGE",
      payload: { language },
    });
    if (response?.error) throw new Error(response.error);
    currentVideoLanguage.textContent = t('popup.trackingVideoAs', {
      language: getLanguageDisplayName(language, getLanguageName(language)),
    });
  } catch (error) {
    currentVideoLanguage.textContent =
      error.message || t('popup.videoLanguageFailed');
  }
}

async function loadDashboard() {
  try {
    const [streakResp, todayResp, weekResp, monthResp] = await Promise.all([
      chrome.runtime.sendMessage({ type: "GET_STREAK" }),
      chrome.runtime.sendMessage({ type: "GET_TODAY" }),
      chrome.runtime.sendMessage({ type: "GET_WEEK" }),
      chrome.runtime.sendMessage({ type: "GET_MONTH" }),
    ]);
    renderStats(
      streakResp?.streak || 0,
      todayResp,
      weekResp || [],
      monthResp || [],
    );
    renderLanguages(todayResp?.languages || {}, todayResp?.totalSeconds || 0);
    renderWeekChart(weekResp || []);
    renderLocalTimeZone();
    lastUpdate.textContent = t('popup.updated', { time: formatTime(new Date()) });
  } catch (error) {
    console.error("Dashboard load error:", error);
    lastUpdate.textContent = t('popup.loadFailed');
  }
}

function renderLocalTimeZone() {
  const now = new Date();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local browser time";
  const offsetMinutes = -now.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  const absoluteOffset = Math.abs(offsetMinutes);
  const hours = String(Math.floor(absoluteOffset / 60)).padStart(2, "0");
  const minutes = String(absoluteOffset % 60).padStart(2, "0");
  localTimeZone.textContent = t('popup.dayTimeZone', { timeZone, offset: sign + hours + ':' + minutes });
  localTimeZone.title = t('popup.timeZoneTitle');
}

function renderStats(streak, today, weekData, monthData) {
  document.getElementById("streak-value").textContent = streak;
  todayValue.textContent = formatDuration(today?.totalSeconds || 0);
  weekValue.textContent = formatDuration(
    weekData.reduce((sum, day) => sum + (day.totalSeconds || 0), 0),
  );
  monthValue.textContent = formatDuration(
    monthData.reduce((sum, week) => sum + (week.totalSeconds || 0), 0),
  );
}

function renderLanguages(languages, totalSeconds) {
  const entries = Object.entries(languages).sort(([first], [second]) =>
    compareLanguageCodesByName(
      first,
      second,
      getLanguageName(first),
      getLanguageName(second),
    ),
  );
  if (!entries.length) {
    if (!languagesList.querySelector(".empty-hint")) {
      languagesList.innerHTML =
        '<div class="empty-hint">' + t('popup.noImmersion') + '</div>';
    }
    return;
  }

  const maxSeconds = Math.max(...entries.map(([, seconds]) => seconds));
  const currentCodes = [...languagesList.querySelectorAll(".language-bar")].map(
    (row) => row.dataset.language,
  );
  const nextCodes = entries.map(([code]) => code);

  if (currentCodes.join(",") !== nextCodes.join(",")) {
    languagesList.innerHTML = entries
      .map(
        ([code]) =>
          '<div class="language-bar" data-language="' +
          escapeHtml(code) +
          '"><span class="language-name"></span><div class="language-track"><div class="language-fill"></div></div><span class="language-time"></span></div>',
      )
      .join("");
  }

  entries.forEach(([code, seconds], index) => {
    const row = languagesList.querySelector(
      '[data-language="' + CSS.escape(code) + '"]',
    );
    const name = getLanguageDisplayName(code, getLanguageName(code));
    const barPercent = maxSeconds ? (seconds / maxSeconds) * 100 : 0;
    const percentage = totalSeconds
      ? Math.round((seconds / totalSeconds) * 100)
      : 0;
    row.title = name + ": " + percentage + "%";
    row.querySelector(".language-name").textContent = name;
    row.querySelector(".language-fill").style.width = barPercent + "%";
    row.querySelector(".language-time").textContent = formatDuration(seconds);
  });
}

function renderWeekChart(weekData) {
  const isEmpty = !weekData.length || weekData.every((day) => !(day.totalSeconds > 0));
  weekChart.classList.toggle("is-empty", isEmpty);
  if (isEmpty) {
    weekChart.innerHTML = '<div class="empty-hint">' + t('popup.noData') + '</div>';
    return;
  }
  const maxSeconds = Math.max(
    1,
    ...weekData.map((day) => day.totalSeconds || 0),
  );
  weekChart.innerHTML = [...weekData]
    .reverse()
    .map((day) => {
      const seconds = day.totalSeconds || 0;
      const label = formatDayLabel(day.date);
      const height = Math.max(4, (seconds / maxSeconds) * 50);
      return (
        '<div class="week-bar-wrap" title="' +
        label +
        ": " +
        formatDuration(seconds) +
        '"><div class="week-bar' +
        (seconds === 0 ? " empty" : "") +
        '" style="height:' +
        height +
        'px;"></div><span class="week-label">' +
        label +
        "</span></div>"
      );
    })
    .join("");
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  const pad = (n) => String(n).padStart(2, "0");
  if (totalSeconds >= 3600) return pad(hours) + ":" + pad(minutes) + ":" + pad(seconds);
  return pad(minutes) + ":" + pad(seconds);
}

function formatDayLabel(dateString) {
  return new Intl.DateTimeFormat(document.documentElement.lang || navigator.language, {
    weekday: 'short',
  }).format(new Date(dateString + 'T00:00:00'));
}

function formatTime(date) {
  return (
    String(date.getHours()).padStart(2, "0") +
    ":" +
    String(date.getMinutes()).padStart(2, "0")
  );
}

function escapeHtml(value) {
  const div = document.createElement("div");
  div.textContent = value || "";
  return div.innerHTML;
}

async function loadGoogleConnectionStatus() {
  try {
    const response = await chrome.runtime.sendMessage({
      type: "GET_GOOGLE_CONNECTION_STATUS",
    });
    if (response?.error) throw new Error(response.error);
    renderGoogleConnectionStatus(Boolean(response?.connected));
  } catch (error) {
    console.error("Google connection status failed to load:", error);
    googleConnectionStatus.textContent = t('popup.connectionUnavailable');
    setGoogleMessage(t('popup.connectionCheckFailed'), true);
  }
}

function renderGoogleConnectionStatus(connected) {
  googleConnectionStatus.textContent = connected
    ? t('popup.googleConnected')
    : t('popup.googleNotConnected');
  googleConnectionStatus.classList.toggle("is-connected", connected);
  connectGoogleButton.classList.toggle("hidden", connected);
  disconnectGoogleButton.classList.toggle("hidden", !connected);
}

async function connectGoogle() {
  setGoogleMessage("");
  connectGoogleButton.disabled = true;
  connectGoogleButton.textContent = t('popup.connecting');
  try {
    const response = await chrome.runtime.sendMessage({
      type: "CONNECT_GOOGLE",
    });
    if (response?.error || !response?.connected)
      throw new Error(
        response?.error || t('popup.googleAuthorizationFailed'),
      );
    renderGoogleConnectionStatus(true);
    setGoogleMessage(t('popup.googleConnectedMessage'));
  } catch (error) {
    console.error("Google connection failed:", error);
    setGoogleMessage(getGoogleAuthErrorMessage(error), true);
  } finally {
    connectGoogleButton.disabled = false;
    connectGoogleButton.textContent = t('popup.connect');
  }
}

function getGoogleAuthErrorMessage(error) {
  const detail = String(error?.message || "Unknown authorization error.");
  const extensionId = chrome.runtime.id;
  if (/authorization page could not be loaded/i.test(detail)) {
    return "Google could not open the consent page. Sign in to Chrome, allow accounts.google.com, and add your Google account under Google Auth Platform > Audience > Test users. Then reload the extension and try again.";
  }
  if (/bad client id|invalid_client|oauth2/i.test(detail)) {
    return (
      "OAuth client mismatch. Register this Chrome extension ID in Google Cloud: " +
      extensionId +
      ". Details: " +
      detail
    );
  }
  return "Google was not connected: " + detail;
}

async function disconnectGoogle() {
  setGoogleMessage("");
  disconnectGoogleButton.disabled = true;
  try {
    const response = await chrome.runtime.sendMessage({
      type: "DISCONNECT_GOOGLE",
    });
    if (response?.error) throw new Error(response.error);
    renderGoogleConnectionStatus(false);
    setGoogleMessage(t('popup.googleDisconnectedMessage'));
  } catch (error) {
    console.error("Google disconnect failed:", error);
    setGoogleMessage(t('popup.googleDisconnectFailed'), true);
  } finally {
    disconnectGoogleButton.disabled = false;
  }
}

function setGoogleMessage(message, isError = false) {
  googleMessage.textContent = message;
  googleMessage.classList.toggle("is-error", Boolean(message && isError));
}
