// Murasaki Immerse — Service Worker (ES Module)
// Coordinator de tracking: recebe tempo do content script, acumula no storage,
// responde queries do popup (dashboard), gerencia OAuth e region switch.

import { addTime, getToday, getHistory, getWeekHistory, getMonthHistory, getTotalByLanguage, getStreak } from './utils/storage.js';

// ---------- Constantes do cookie PREF ----------

const PREF_COOKIE = {
  name: 'PREF',
  domain: '.youtube.com',
  path: '/',
  url: 'https://www.youtube.com/',
  secure: true
};

// ---------- Estado em memória (tracking por tab) ----------

/** @type {Map<number, { language: string, videoId: string }>} */
const tabState = new Map();

// ---------- Message Listener ----------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {

    // --- Tracking ---

    case 'TRACK_TIME': {
      const { language, seconds, videoId } = message.payload;
      const tabId = sender.tab?.id;

      addTime(null, language, seconds)
        .then(() => {
          // Atualiza estado da tab
          if (tabId) {
            tabState.set(tabId, { language, videoId });
          }
          sendResponse({ ok: true });
        })
        .catch(err => sendResponse({ error: err.message }));
      return true;
    }

    // --- Dashboard queries ---

    case 'GET_TODAY':
      getToday()
        .then(data => sendResponse(data))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_HISTORY': {
      const days = message.payload?.days || 7;
      getHistory(days)
        .then(data => sendResponse(data))
        .catch(err => sendResponse({ error: err.message }));
      return true;
    }

    case 'GET_WEEK':
      getWeekHistory()
        .then(data => sendResponse(data))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_MONTH':
      getMonthHistory()
        .then(data => sendResponse(data))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_TOTALS': {
      const days = message.payload?.days || 30;
      getTotalByLanguage(days)
        .then(data => sendResponse(data))
        .catch(err => sendResponse({ error: err.message }));
      return true;
    }

    case 'GET_STREAK':
      getStreak()
        .then(streak => sendResponse({ streak }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    // --- OAuth ---

    case 'GET_TOKEN':
      getAuthToken(message.payload?.interactive)
        .then(token => sendResponse({ token }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    // --- Region Switch (feature secundária) ---

    case 'SET_REGION':
      handleSetRegion(message.payload)
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'GET_REGION':
      handleGetRegion()
        .then(result => sendResponse(result))
        .catch(err => sendResponse({ error: err.message }));
      return true;

    case 'CLEAR_REGION':
      handleClearRegion()
        .then(() => sendResponse({ success: true }))
        .catch(err => sendResponse({ error: err.message }));
      return true;
  }

  return false;
});

// ---------- OAuth ----------

/**
 * Obtém um token OAuth via Chrome Identity API.
 * @param {boolean} [interactive=true] — se true, mostra o diálogo de login
 * @returns {Promise<string>} o access token
 */
async function getAuthToken(interactive = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive }, (token) => {
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

// ---------- Region Switch (Cookie PREF) ----------

/**
 * Define o cookie PREF com hl e gl para o país desejado.
 * @param {{ countryCode: string, hl: string }} payload
 */
async function handleSetRegion({ countryCode, hl }) {
  const cookieValue = `f6=40000000&hl=${hl}&gl=${countryCode}`;

  await chrome.cookies.set({
    url: PREF_COOKIE.url,
    name: PREF_COOKIE.name,
    value: cookieValue,
    domain: PREF_COOKIE.domain,
    path: PREF_COOKIE.path,
    secure: PREF_COOKIE.secure,
    sameSite: 'no_restriction'
  });
}

/**
 * Lê o cookie PREF e extrai o país (gl) atual.
 * @returns {Promise<{ countryCode: string } | {}>}
 */
async function handleGetRegion() {
  return new Promise((resolve, reject) => {
    chrome.cookies.get({
      url: PREF_COOKIE.url,
      name: PREF_COOKIE.name
    }, (cookie) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (!cookie) {
        resolve({});
        return;
      }

      // Extrai gl=XX do valor do cookie (ex: "hl=ja&gl=JP")
      const glMatch = cookie.value.match(/gl=([A-Z]{2,3})/);
      const countryCode = glMatch ? glMatch[1] : null;

      resolve(countryCode ? { countryCode } : {});
    });
  });
}

/**
 * Remove o cookie PREF, restaurando a região padrão do YouTube.
 */
async function handleClearRegion() {
  return new Promise((resolve, reject) => {
    chrome.cookies.remove({
      url: PREF_COOKIE.url,
      name: PREF_COOKIE.name
    }, (details) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }
      resolve();
    });
  });
}
