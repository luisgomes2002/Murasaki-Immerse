// Murasaki Immerse — Wrapper da YouTube Data API v3
// Usado para detecção de idioma via API (fallback do DOM scraping).
// Usa apenas OAuth token, sem API key.

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

/**
 * Obtém o idioma padrão do áudio de um vídeo pela YouTube API.
 * @param {string} videoId
 * @param {string} accessToken — token OAuth
 * @returns {Promise<string|null>} código ISO do idioma (ex: 'ja') ou null
 */
export async function fetchVideoLanguage(videoId, accessToken) {
  const url = `${YOUTUBE_API_BASE}/videos?part=snippet&id=${encodeURIComponent(videoId)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) return null;

  const data = await response.json();

  const items = data.items || [];
  if (items.length === 0) return null;

  const lang = items[0].snippet?.defaultAudioLanguage;
  return lang || null;
}
