// Murasaki Immerse — popup local do rastreador

import { LANGUAGES, getLanguageName } from "../utils/languages.js";

const BAR_COLOR = "#8b5cf6";
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
const refreshBtn = document.getElementById("refresh-btn");

let nativeLanguages = [];
let setupComplete = false;
let pendingImportMode = null;

document.addEventListener("DOMContentLoaded", init);

async function init() {
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
    setSettingsMessage("Could not load your settings. Please try again.", true);
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

function bindEvents() {
  refreshBtn.addEventListener("click", loadDashboard);
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
    '<option value="">Select a language</option>';
  for (const language of LANGUAGES) {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = language.name;
    nativeLanguageSelect.appendChild(option);
  }
}

function populateVideoLanguageDropdown() {
  videoLanguageSelect.innerHTML =
    '<option value="">Choose video language</option>';
  for (const language of LANGUAGES) {
    const option = document.createElement("option");
    option.value = language.code;
    option.textContent = language.name;
    videoLanguageSelect.appendChild(option);
  }
}

function addNativeLanguage() {
  const language = nativeLanguageSelect.value;
  if (!language) return setSettingsMessage("Choose a language to add.", true);
  if (!nativeLanguages.includes(language)) nativeLanguages.push(language);
  nativeLanguageSelect.value = "";
  setSettingsMessage("");
  renderNativeLanguages();
}

function renderNativeLanguages() {
  if (!nativeLanguages.length) {
    nativeLanguageChips.innerHTML =
      '<span class="chips-placeholder">No native languages added yet</span>';
  } else {
    nativeLanguageChips.innerHTML = nativeLanguages
      .map((language) => {
        const name = escapeHtml(getLanguageName(language));
        return (
          '<span class="language-chip">' +
          name +
          '<button type="button" data-language="' +
          escapeHtml(language) +
          '" aria-label="Remove ' +
          name +
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
      "Add at least one native language before starting.",
      true,
    );
  saveNativeLanguagesButton.disabled = true;
  saveNativeLanguagesButton.textContent = "Saving…";
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
    setSettingsMessage("Could not save your settings. Please try again.", true);
  } finally {
    saveNativeLanguagesButton.disabled = false;
    saveNativeLanguagesButton.textContent = "Save & start tracking";
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
    const date = new Date().toISOString().slice(0, 10);
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
    setBackupMessage("Backup download started.");
  } catch (error) {
    console.error("Backup export failed:", error);
    setBackupMessage("Could not export the backup. Please try again.", true);
  } finally {
    exportBackupButton.disabled = false;
  }
}

function chooseBackupFile(mode) {
  if (
    mode === "replace" &&
    !window.confirm(
      "Replace all current immersion data with this backup? This cannot be undone.",
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
    setBackupMessage("This backup file is too large.", true);
    return;
  }

  const mode = pendingImportMode;
  pendingImportMode = null;
  const buttons = [importBackupButton, mergeBackupButton];
  buttons.forEach((button) => {
    button.disabled = true;
  });
  setBackupMessage("Importing…");
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
        ? "Backup merged successfully."
        : "Backup imported successfully.",
    );
  } catch (error) {
    console.error("Backup import failed:", error);
    setBackupMessage(error.message || "Could not import this backup.", true);
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
    if (!tab) throw new Error("Open a YouTube video to adjust its language.");
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "GET_CURRENT_VIDEO_LANGUAGE",
    });
    if (!response?.videoId)
      throw new Error("Open a YouTube watch page to adjust its language.");
    const language = response.language;
    videoLanguageSelect.value = LANGUAGES.some((item) => item.code === language)
      ? language
      : "";
    currentVideoLanguage.textContent =
      language && language !== "unknown"
        ? "Detected: " + getLanguageName(language) + ". Change it if needed."
        : "Language was not detected. Choose it to start tracking.";
    saveVideoLanguageButton.disabled = false;
  } catch (error) {
    currentVideoLanguage.textContent =
      error.message || "Reload the YouTube page, then reopen this popup.";
    saveVideoLanguageButton.disabled = true;
  }
}

async function saveCurrentVideoLanguage() {
  const language = videoLanguageSelect.value;
  if (!language) {
    currentVideoLanguage.textContent = "Choose a language first.";
    return;
  }
  try {
    const tab = await getActiveYouTubeTab();
    if (!tab) throw new Error("Open a YouTube video first.");
    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "SET_CURRENT_VIDEO_LANGUAGE",
      payload: { language },
    });
    if (response?.error) throw new Error(response.error);
    currentVideoLanguage.textContent =
      "Tracking this video as " + getLanguageName(language) + ".";
  } catch (error) {
    currentVideoLanguage.textContent =
      error.message || "Could not change the video language.";
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
    lastUpdate.textContent = "Updated " + formatTime(new Date());
  } catch (error) {
    console.error("Dashboard load error:", error);
    lastUpdate.textContent = "Failed to load";
  }
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
  const entries = Object.entries(languages).sort((a, b) => b[1] - a[1]);
  if (!entries.length) {
    if (!languagesList.querySelector(".empty-hint")) {
      languagesList.innerHTML =
        '<div class="empty-hint">No immersion data yet. Start watching!</div>';
    }
    return;
  }

  const maxSeconds = entries[0][1];
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
    const name = getLanguageName(code);
    const barPercent = maxSeconds ? (seconds / maxSeconds) * 100 : 0;
    const percentage = totalSeconds
      ? Math.round((seconds / totalSeconds) * 100)
      : 0;
    row.title = name + ": " + percentage + "%";
    row.querySelector(".language-name").textContent = name;
    row.querySelector(".language-fill").style.cssText =
      "width:" + barPercent + "%;background:" + BAR_COLOR;
    row.querySelector(".language-time").textContent = formatDuration(seconds);
  });
}

function renderWeekChart(weekData) {
  if (!weekData.length) {
    weekChart.innerHTML = '<div class="empty-hint">No data yet</div>';
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
      const height = Math.max(4, (seconds / maxSeconds) * 60);
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
  if (totalSeconds <= 0) return "0s";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);
  if (hours > 0) return hours + "h " + minutes + "m " + seconds + "s";
  if (minutes > 0) return minutes + "m " + seconds + "s";
  return seconds + "s";
}

function formatDayLabel(dateString) {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
    new Date(dateString + "T00:00:00").getDay()
  ];
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
    googleConnectionStatus.textContent = "Connection status unavailable";
    setGoogleMessage("Could not check Google connection status.", true);
  }
}

function renderGoogleConnectionStatus(connected) {
  googleConnectionStatus.textContent = connected
    ? "Google connected"
    : "Google not connected";
  googleConnectionStatus.classList.toggle("is-connected", connected);
  connectGoogleButton.classList.toggle("hidden", connected);
  disconnectGoogleButton.classList.toggle("hidden", !connected);
}

async function connectGoogle() {
  setGoogleMessage("");
  connectGoogleButton.disabled = true;
  connectGoogleButton.textContent = "Connecting…";
  try {
    const response = await chrome.runtime.sendMessage({
      type: "CONNECT_GOOGLE",
    });
    if (response?.error || !response?.connected)
      throw new Error(
        response?.error || "Google authorization was not completed.",
      );
    renderGoogleConnectionStatus(true);
    setGoogleMessage(
      "Google connected. Only read-only YouTube video metadata is used when needed.",
    );
  } catch (error) {
    console.error("Google connection failed:", error);
    setGoogleMessage(getGoogleAuthErrorMessage(error), true);
  } finally {
    connectGoogleButton.disabled = false;
    connectGoogleButton.textContent = "Connect Google";
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
    setGoogleMessage("Google connection removed from this browser.");
  } catch (error) {
    console.error("Google disconnect failed:", error);
    setGoogleMessage(
      "Could not remove the Google connection. Please try again.",
      true,
    );
  } finally {
    disconnectGoogleButton.disabled = false;
  }
}

function setGoogleMessage(message, isError = false) {
  googleMessage.textContent = message;
  googleMessage.classList.toggle("is-error", Boolean(message && isError));
}
