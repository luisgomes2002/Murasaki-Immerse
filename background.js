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
  getNativeLanguages,
  setNativeLanguages,
  createBackup,
  restoreBackup
} from './utils/storage.js';

/** @type {Map<number, { language: string, videoId: string }>} */
const tabState = new Map();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TRACK_TIME': {
      const { language, seconds, videoId } = message.payload;
      const tabId = sender.tab?.id;

      handleTrackTime(language, seconds)
        .then(result => {
          if (result.tracked && tabId) tabState.set(tabId, { language, videoId });
          sendResponse(result);
        })
        .catch(err => sendResponse({ error: err.message }));
      return true;
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
      getAuthToken(true)
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
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive, enableGranularPermissions: true }, (token) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      if (!token) {
        reject(new Error('Could not obtain the authentication token.'));
        return;
      }
      resolve(token);
    });
  });
}


/** Clears Chrome's cached OAuth state without changing local immersion history. */
async function clearGoogleAuth() {
  if (!chrome.identity.clearAllCachedAuthTokens) {
    throw new Error('Disconnecting Google is not supported by this Chrome version.');
  }
  await chrome.identity.clearAllCachedAuthTokens();
}
