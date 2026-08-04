// Murasaki Immerse — bridge executado no contexto principal do YouTube.
// O content script não pode acessar variáveis JavaScript da página diretamente.
(function () {
  'use strict';

  function publishAudioLanguage() {
    try {
      const player = document.getElementById('movie_player');
      const response = window.ytInitialPlayerResponse || player?.getPlayerResponse?.();
      const defaultLanguage = response?.videoDetails?.defaultAudioLanguage;
      const audioTrack = response?.streamingData?.adaptiveFormats
        ?.find(format => format.audioTrack?.audioIsDefault)?.audioTrack;
      const language = defaultLanguage || audioTrack?.id?.split('.')[0];
      if (!language) return;

      document.documentElement.dataset.murasakiAudioLanguage = language
        .toLowerCase()
        .split('-')[0];
      window.dispatchEvent(new Event('murasaki-audio-language-ready'));
    } catch {
      // O player pode ainda estar em transição entre vídeos.
    }
  }

  publishAudioLanguage();
  window.addEventListener('yt-navigate-finish', () => {
    delete document.documentElement.dataset.murasakiAudioLanguage;
    setTimeout(publishAudioLanguage, 0);
    setTimeout(publishAudioLanguage, 1000);
  });
  setInterval(publishAudioLanguage, 1500);
})();
