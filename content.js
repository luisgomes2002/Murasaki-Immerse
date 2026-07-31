// Murasaki Immerse — Content Script
// Detector de idioma + timer engine para rastrear tempo de imersão no YouTube.
// IIFE (não module) — injetado diretamente nas páginas do YouTube.

(function () {
  'use strict';

  // ---------- Estado ----------

  let currentVideoId = null;
  let currentLanguage = null;
  let accumulatedSeconds = 0;
  let timerInterval = null;
  let isPlaying = false;

  const FLUSH_INTERVAL = 5; // envia a cada 5 segundos de play contínuo

  // ---------- Helpers ----------

  function getVideoId() {
    const params = new URLSearchParams(location.search);
    return params.get('v') || null;
  }

  function isWatchPage() {
    return location.pathname === '/watch';
  }

  // ---------- Cache de idioma (via chrome.storage.local direto) ----------

  const LANG_CACHE_KEY = 'immersion_lang_cache';

  async function getCachedLanguage(videoId) {
    try {
      const result = await chrome.storage.local.get(LANG_CACHE_KEY);
      const cache = result[LANG_CACHE_KEY] || {};
      return cache[videoId] || null;
    } catch {
      return null;
    }
  }

  async function setCachedLanguage(videoId, language) {
    try {
      const result = await chrome.storage.local.get(LANG_CACHE_KEY);
      const cache = result[LANG_CACHE_KEY] || {};
      cache[videoId] = language;

      // Limita a 500 entradas
      const keys = Object.keys(cache);
      if (keys.length > 500) {
        const toRemove = keys.slice(0, keys.length - 500);
        for (const key of toRemove) {
          delete cache[key];
        }
      }

      await chrome.storage.local.set({ [LANG_CACHE_KEY]: cache });
    } catch { /* silencioso */ }
  }

  // ---------- Detecção de idioma (DOM scraping) ----------

  /**
   * Tenta extrair o idioma do player do YouTube via DOM.
   * @returns {string|null} código ISO do idioma ou null
   */
  function detectLanguageDOM() {
    // O idioma do documento é a interface do YouTube, não necessariamente o
    // áudio do vídeo; por isso ele não é usado para contabilizar imersão.
    // 1. Procura track de legenda ativo no <video>.
    const video = document.querySelector('video');
    if (video && video.textTracks) {
      for (let i = 0; i < video.textTracks.length; i++) {
        const track = video.textTracks[i];
        if (track.mode === 'showing' && track.language) {
          return track.language.slice(0, 2).toLowerCase();
        }
      }
    }

    // 2. Tenta os metadados de idioma do próprio vídeo, quando disponíveis.
    const languageMeta = document.querySelector('meta[itemprop="inLanguage"]');
    const metadataLanguage = languageMeta?.getAttribute('content');
    if (metadataLanguage && metadataLanguage.length >= 2) {
      return metadataLanguage.slice(0, 2).toLowerCase();
    }

    // 3. Heurística por script detection no título
    const title = document.querySelector('h1.ytd-watch-metadata yt-formatted-string, h1 yt-formatted-string');
    if (title) {
      const text = title.textContent || '';
      if (/[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9fff]/.test(text)) return 'ja';
      if (/[\uac00-\ud7af]/.test(text)) return 'ko';
      if (/[\u0600-\u06ff]/.test(text)) return 'ar';
      if (/[\u0400-\u04ff]/.test(text)) return 'ru';
      if (/[\u0e00-\u0e7f]/.test(text)) return 'th';
      if (/[\u0590-\u05ff]/.test(text)) return 'he';
      if (/[\u0900-\u097f]/.test(text)) return 'hi';
    }

    return null;
  }

  // ---------- Detecção de idioma (API fallback) ----------

  /**
   * Fallback: chama a YouTube Data API v3 via OAuth.
   * @param {string} videoId
   * @returns {Promise<string|null>}
   */
  async function detectLanguageAPI(videoId) {
    try {
      const tokenResp = await chrome.runtime.sendMessage({
        type: 'GET_TOKEN',
        payload: { interactive: false }
      });

      if (tokenResp.error || !tokenResp.token) return null;

      const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${encodeURIComponent(videoId)}`;
      const resp = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${tokenResp.token}`,
          'Accept': 'application/json'
        }
      });

      if (!resp.ok) return null;

      const data = await resp.json();
      const items = data.items || [];
      if (items.length === 0) return null;

      const lang = items[0].snippet?.defaultAudioLanguage;
      return lang ? lang.toLowerCase().split('-')[0] : null;
    } catch {
      return null;
    }
  }

  // ---------- Pipeline: cache → DOM → API ----------

  /**
   * Detecta o idioma do vídeo: cache primeiro, depois DOM, depois API.
   * @param {string} videoId
   * @returns {Promise<string>} código ISO do idioma ou 'unknown'
   */
  async function detectLanguage(videoId) {
    if (!videoId) return 'unknown';

    // 1. Cache
    const cached = await getCachedLanguage(videoId);
    if (cached && cached !== 'unknown') return cached.toLowerCase().split('-')[0];

    // 2. DOM scraping
    const domLang = detectLanguageDOM();
    if (domLang) {
      await setCachedLanguage(videoId, domLang);
      return domLang;
    }

    // 3. API fallback
    const apiLang = await detectLanguageAPI(videoId);
    if (apiLang) {
      await setCachedLanguage(videoId, apiLang);
      return apiLang;
    }

    // Nada funcionou
    await setCachedLanguage(videoId, 'unknown');
    return 'unknown';
  }

  // ---------- Timer Engine ----------

  function startTimer() {
    if (timerInterval) return;
    isPlaying = true;

    timerInterval = setInterval(() => {
      if (!isPlaying) return;

      accumulatedSeconds++;

      // Flush a cada FLUSH_INTERVAL segundos
      if (accumulatedSeconds >= FLUSH_INTERVAL && accumulatedSeconds % FLUSH_INTERVAL === 0) {
        flushTime();
      }
    }, 1000);
  }

  function stopTimer() {
    isPlaying = false;
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  /**
   * Envia o tempo acumulado para o background e reseta o contador.
   */
  function flushTime() {
    const seconds = accumulatedSeconds;
    if (seconds <= 0 || !currentLanguage) return;

    accumulatedSeconds = 0;

    // O Chrome invalida o contexto deste script quando a extensão é
    // recarregada. Nesse caso, ignoramos o envio pendente sem poluir o console.
    try {
      const message = chrome.runtime.sendMessage({
        type: 'TRACK_TIME',
        payload: {
          language: currentLanguage,
          seconds,
          videoId: currentVideoId
        }
      });
      message?.catch(() => { /* background pode não estar pronto */ });
    } catch {
      // Extension context invalidated: a página ainda usa o script anterior.
    }
  }

  /**
   * Reseta o estado para um novo vídeo.
   * Envia tempo pendente do vídeo anterior e detecta o idioma do novo.
   * @param {string|null} videoId
   */
  async function resetForVideo(videoId) {
    // Flush pendente do vídeo anterior
    if (accumulatedSeconds > 0) {
      flushTime();
    }
    stopTimer();

    currentVideoId = videoId;
    accumulatedSeconds = 0;
    currentLanguage = null;

    if (videoId) {
      currentLanguage = await detectLanguage(videoId);

      // Se o player já estiver tocando, inicia o timer
      const video = document.querySelector('video');
      if (video && !video.paused) {
        startTimer();
      }
    }
  }

  // ---------- Observador do <video> ----------

  function observePlayer() {
    const tryBind = () => {
      const video = document.querySelector('video');
      if (!video) {
        // Tenta de novo em 1s
        setTimeout(tryBind, 1000);
        return;
      }

      if (video._murasakiBound) return;
      video._murasakiBound = true;

      video.addEventListener('play', () => {
        if (!currentVideoId) return;
        startTimer();
      });

      video.addEventListener('pause', () => {
        stopTimer();
        // Flush do tempo acumulado no pause
        if (accumulatedSeconds > 0) {
          flushTime();
        }
      });

      video.addEventListener('seeking', () => {
        // Pausa o acúmulo durante seek
        stopTimer();
      });

      video.addEventListener('seeked', () => {
        // Retoma se o player estiver tocando após o seek
        if (video && !video.paused && currentVideoId) {
          startTimer();
        }
      });

      // Se já estiver tocando ao carregar
      if (!video.paused && currentVideoId) {
        startTimer();
      }
    };

    tryBind();

    // Re-bind quando o <video> é recriado (SPA)
    const observer = new MutationObserver(() => {
      const video = document.querySelector('video');
      if (video && !video._murasakiBound) {
        tryBind();
      }
    });

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // ---------- SPA Navigation ----------

  function watchNavigation() {
    let lastUrl = location.href;
    let lastVideoId = getVideoId();

    // Inicializa na página atual
    if (isWatchPage() && lastVideoId) {
      resetForVideo(lastVideoId);
    }

    // Observer de mutations para detectar navegação SPA
    const navObserver = new MutationObserver(() => {
      if (location.href !== lastUrl) {
        lastUrl = location.href;
        const newVideoId = getVideoId();

        if (newVideoId !== lastVideoId) {
          lastVideoId = newVideoId;

          if (isWatchPage() && newVideoId) {
            resetForVideo(newVideoId);
          } else {
            // Saiu da watch page
            if (accumulatedSeconds > 0) {
              flushTime();
            }
            stopTimer();
            currentVideoId = null;
            currentLanguage = null;
            accumulatedSeconds = 0;
          }
        }
      }
    });

    navObserver.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });

    // Fallback: popstate
    window.addEventListener('popstate', () => {
      setTimeout(() => {
        const newVideoId = getVideoId();
        if (newVideoId !== lastVideoId) {
          lastVideoId = newVideoId;
          if (isWatchPage() && newVideoId) {
            resetForVideo(newVideoId);
          }
        }
      }, 300);
    });
  }

  // ---------- Init ----------

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      observePlayer();
      watchNavigation();
    });
  } else {
    observePlayer();
    watchNavigation();
  }
})();
