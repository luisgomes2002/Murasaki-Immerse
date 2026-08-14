// Murasaki Immerse — Service Worker (ES Module)
// Coordena o rastreamento e as preferências salvas no próprio navegador.

import {
  addTime,
  getToday,
  getHistory,
  getWeekHistory,
  getMonthHistory,
  getTotalByLanguage,
  getStreak,
  getDailyGoal,
  getNativeLanguages,
  setNativeLanguages,
  createBackup,
  restoreBackup
} from './utils/storage.js';

/** @type {Map<number, { language: string, videoId: string }>} */
const tabState = new Map();
const LOGO_ICON_PATH = 'icons/logo.png';
const PLAY_ICON_PATH = 'icons/playbutton.png';
const PROGRESS_RING_COLOR = '#fde047';
const PROGRESS_RING_OUTLINE = 'rgba(15, 10, 25, 0.9)';

const iconImageDataCache = new Map();

async function getIconBitmap(path) {
  if (!iconImageDataCache.has(path)) {
    iconImageDataCache.set(
      path,
      fetch(chrome.runtime.getURL(path))
        .then(response => response.blob())
        .then(blob => createImageBitmap(blob))
    );
  }
  return iconImageDataCache.get(path);
}

async function getToolbarIconImageData(isPlaying) {
  const canvas = new OffscreenCanvas(32, 32);
  const context = canvas.getContext("2d");

  if (!isPlaying) {
    context.drawImage(await getIconBitmap(LOGO_ICON_PATH), 0, 0, 32, 32);
    return context.getImageData(0, 0, 32, 32);
  }

  const [playBitmap, today, goalSeconds] = await Promise.all([
    getIconBitmap(PLAY_ICON_PATH),
    getToday(),
    getDailyGoal()
  ]);
  const completed = today.totalSeconds > 0 &&
    today.totalSeconds % goalSeconds === 0;
  const progress = completed
    ? 1
    : (today.totalSeconds % goalSeconds) / goalSeconds;

  context.drawImage(playBitmap, 3, 3, 26, 26);
  context.beginPath();
  context.arc(16, 16, 14, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * progress);
  context.strokeStyle = PROGRESS_RING_OUTLINE;
  context.lineWidth = 5;
  context.lineCap = 'round';
  context.stroke();
  context.strokeStyle = PROGRESS_RING_COLOR;
  context.lineWidth = 3;
  context.stroke();
  return context.getImageData(0, 0, 32, 32);
}

async function setTabIcon(tabId, isPlaying) {
  if (!tabId || !chrome.action?.setIcon) return;
  try {
    await chrome.action.setIcon({
      tabId,
      imageData: await getToolbarIconImageData(isPlaying)
    });
  } catch {
    chrome.action.setIcon({
      tabId,
      path: isPlaying ? PLAY_ICON_PATH : LOGO_ICON_PATH
    });
  }
}

// chrome.storage.local não oferece incremento atômico. Como o content script
// pode enviar vários segundos rapidamente, as gravações precisam passar por
// uma fila para que uma atualização não sobrescreva a anterior.
let trackingQueue = Promise.resolve();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TRACK_TIME': {
      const { language, seconds, videoId } = message.payload;
      const tabId = sender.tab?.id;

      enqueueTrackTime(language, seconds)
        .then(result => {
          if (result.tracked && tabId) {
            tabState.set(tabId, { language, videoId });
            void setTabIcon(tabId, true);
          }
          sendResponse(result);
        })
        .catch(err => sendResponse({ error: err.message }));
      return true;
    }

    case 'SET_VIDEO_PLAYBACK': {
      const tabId = sender.tab?.id;
      const isPlaying = Boolean(message.payload?.isPlaying);
      void setTabIcon(tabId, isPlaying);
      sendResponse({ isPlaying });
      return false;
    }

    case 'GET_TODAY':
      getToday().then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_HISTORY': {
      const days = message.payload?.days || 7;
      getHistory(days).then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;
    }

    case 'GET_WEEK':
      getWeekHistory().then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_MONTH':
      getMonthHistory().then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_TOTALS': {
      const days = message.payload?.days || 30;
      getTotalByLanguage(days).then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;
    }

    case 'GET_STREAK':
      getStreak().then(streak => sendResponse({ streak })).catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_NATIVE_LANGUAGES':
      getNativeLanguages().then(languages => sendResponse({ languages })).catch(err => sendResponse({ error: err.message }));
      return true;

    case 'SET_NATIVE_LANGUAGES':
      setNativeLanguages(message.payload?.languages)
        .then(languages => sendResponse({ languages }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'EXPORT_BACKUP':
      createBackup().then(sendResponse).catch(err => sendResponse({ error: err.message }));
      return true;

    case 'IMPORT_BACKUP':
      restoreBackup(message.payload?.backup, Boolean(message.payload?.merge))
        .then(sendResponse)
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_TOKEN':
      getAuthToken(message.payload?.interactive)
        .then(token => sendResponse({ token }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    // These actions are deliberately initiated from a popup button. The
    // content script only ever makes non-interactive requests while detecting
    // a video's language, so watching a video cannot trigger a sign-in prompt.
    case 'CONNECT_GOOGLE':
      connectGoogleAuth()
        .then(() => sendResponse({ connected: true }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_GOOGLE_CONNECTION_STATUS':
      getAuthToken(false)
        .then(() => sendResponse({ connected: true }))
        .catch(() => sendResponse({ connected: false }));
      return true;

    case 'DISCONNECT_GOOGLE':
      clearGoogleAuth()
        .then(() => sendResponse({ connected: false }))
        .catch(err => sendResponse({ error: err.message }));
      return true;
  }

function enqueueTrackTime(language, seconds) {
  const task = trackingQueue.then(() => handleTrackTime(language, seconds));
  // Mantém a fila utilizável mesmo se uma gravação falhar.
  trackingQueue = task.catch(() => {});
  return task;
}

  return false;
});

/**
 * Persiste apenas o tempo em idiomas que não são nativos. A checagem ocorre
 * aqui, de modo que uma alteração no popup vale imediatamente para todas as
 * abas abertas do YouTube.
 */
async function handleTrackTime(language, seconds) {
  const nativeLanguages = await getNativeLanguages();
  const normalizedLanguage = String(language || '').toLowerCase().split('-')[0];

  if (nativeLanguages.length === 0) {
    return { ok: true, tracked: false, reason: 'setup_required' };
  }

  if (!normalizedLanguage || normalizedLanguage === 'unknown') {
    return { ok: true, tracked: false, reason: 'unknown_language' };
  }

  if (nativeLanguages.includes(normalizedLanguage)) {
    return { ok: true, tracked: false, reason: 'native_language' };
  }

  await addTime(null, normalizedLanguage, seconds);
  return { ok: true, tracked: true };
}

async function getAuthToken(interactive = true) {
  const result = await chrome.identity.getAuthToken({
    interactive
  });
  const token = typeof result === 'string' ? result : result?.token;
  if (!token) {
    throw new Error('Could not obtain the authentication token.');
  }
  return token;
}

/** Starts an explicit login without reusing a failed/stale OAuth attempt. */
async function connectGoogleAuth() {
  if (chrome.identity.clearAllCachedAuthTokens) {
    await chrome.identity.clearAllCachedAuthTokens();
  }
  return getAuthToken(true);
}


/** Clears Chrome's cached OAuth state without changing local immersion history. */
async function clearGoogleAuth() {
  if (!chrome.identity.clearAllCachedAuthTokens) {
    throw new Error('Disconnecting Google is not supported by this Chrome version.');
  }
  await chrome.identity.clearAllCachedAuthTokens();
}
