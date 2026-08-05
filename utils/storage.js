// Murasaki Immerse — Wrapper do chrome.storage.local
// Gerencia dados de imersão, cache de idioma e streak

const DATA_KEY = "immersion_data";
const LANG_CACHE_KEY = "immersion_lang_cache";
const STREAK_KEY = "immersion_streak";
const NATIVE_LANGUAGES_KEY = "immersion_native_languages";
const MAX_HISTORY_DAYS = 5 * 365; // mantém aproximadamente cinco anos de histórico

// ---------- Helpers de data ----------

/**
 * Retorna a data de hoje no formato ISO (YYYY-MM-DD).
 */
function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Retorna a chave de data para N dias atrás.
 * @param {number} daysAgo
 * @returns {string} YYYY-MM-DD
 */
function dateKeyDaysAgo(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d.toISOString().slice(0, 10);
}

// ---------- Imersão (tempo por idioma/dia) ----------

/**
 * Carrega todos os dados de imersão.
 * @returns {Promise<Object>} ex: { "2025-01-15": { "ja": 5400, "de": 1200 } }
 */
async function loadData() {
  const result = await chrome.storage.local.get(DATA_KEY);
  return result[DATA_KEY] || {};
}

/**
 * Salva os dados de imersão (faz prune de datas antigas).
 * @param {Object} data
 */
async function saveData(data) {
  // Remove datas com mais de MAX_HISTORY_DAYS
  const cutoff = dateKeyDaysAgo(MAX_HISTORY_DAYS);
  const pruned = {};
  for (const key of Object.keys(data)) {
    if (key >= cutoff) {
      pruned[key] = data[key];
    }
  }
  await chrome.storage.local.set({ [DATA_KEY]: pruned });
}

/**
 * Retorna os dados de hoje: total em segundos + breakdown por idioma.
 * @returns {Promise<{ totalSeconds: number, languages: Object<string, number> }>}
 */
export async function getToday() {
  const data = await loadData();
  const today = todayKey();
  const languages = data[today] || {};

  let totalSeconds = 0;
  for (const sec of Object.values(languages)) {
    totalSeconds += sec;
  }

  return { totalSeconds, languages };
}

/**
 * Adiciona segundos de imersão para um idioma na data atual.
 * @param {string} [date] — data no formato YYYY-MM-DD (padrão: hoje)
 * @param {string} language — código ISO do idioma (ex: 'ja')
 * @param {number} seconds — quantos segundos adicionar
 */
export async function addTime(date, language, seconds) {
  if (!language || seconds <= 0) return;

  const key = date || todayKey();
  const data = await loadData();

  if (!data[key]) {
    data[key] = {};
  }
  data[key][language] = (data[key][language] || 0) + seconds;

  await saveData(data);
}

/**
 * Retorna o histórico dos últimos N dias.
 * @param {number} days — quantos dias (padrão 7)
 * @returns {Promise<Array<{ date: string, totalSeconds: number, languages: Object }>>}
 */
export async function getHistory(days = 7) {
  const data = await loadData();
  const result = [];

  for (let i = 0; i < days; i++) {
    const key = dateKeyDaysAgo(i);
    const languages = data[key] || {};
    let totalSeconds = 0;
    for (const sec of Object.values(languages)) {
      totalSeconds += sec;
    }
    result.push({ date: key, totalSeconds, languages });
  }

  return result;
}

/**
 * Calcula a streak atual (dias consecutivos com imersão, incluindo hoje).
 * @returns {Promise<number>}
 */
export async function getStreak() {
  const data = await loadData();
  let streak = 0;

  for (let i = 0; i < MAX_HISTORY_DAYS; i++) {
    const key = dateKeyDaysAgo(i);
    const day = data[key];
    if (!day || Object.keys(day).length === 0) {
      break;
    }
    streak++;
  }

  return streak;
}

// ---------- Idiomas nativos ----------

/**
 * Retorna os idiomas nativos configurados. Uma lista vazia significa que o
 * usuário ainda não concluiu a configuração inicial e nada deve ser contado.
 * @returns {Promise<string[]>}
 */
export async function getNativeLanguages() {
  const result = await chrome.storage.local.get(NATIVE_LANGUAGES_KEY);
  return Array.isArray(result[NATIVE_LANGUAGES_KEY])
    ? result[NATIVE_LANGUAGES_KEY]
    : [];
}

/**
 * Salva idiomas nativos como códigos ISO-639-1 únicos.
 * @param {string[]} languages
 */
export async function setNativeLanguages(languages) {
  const normalized = [
    ...new Set(
      (languages || [])
        .filter((language) => typeof language === "string")
        .map((language) => language.toLowerCase().split("-")[0])
        .filter((language) => /^[a-z]{2,3}$/.test(language)),
    ),
  ];

  await chrome.storage.local.set({ [NATIVE_LANGUAGES_KEY]: normalized });
  return normalized;
}

// ---------- Backup ----------

const BACKUP_FORMAT = "murasaki-immerse-backup";
const BACKUP_VERSION = 1;

/** Cria um arquivo portável com os tempos e idiomas nativos do usuário. */
export async function createBackup() {
  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    nativeLanguages: await getNativeLanguages(),
    immersionData: await loadData(),
  };
}

function normalizeBackupData(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new Error("The backup has no valid immersion data.");
  }

  const normalized = {};
  for (const [date, languages] of Object.entries(data)) {
    if (
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      !languages ||
      typeof languages !== "object" ||
      Array.isArray(languages)
    )
      continue;

    const day = {};
    for (const [language, seconds] of Object.entries(languages)) {
      if (
        typeof language === "string" &&
        language &&
        Number.isFinite(seconds) &&
        seconds > 0
      ) {
        day[language] = seconds;
      }
    }
    if (Object.keys(day).length) normalized[date] = day;
  }
  return normalized;
}

function normalizeNativeLanguageList(languages) {
  return [
    ...new Set(
      (languages || [])
        .filter((language) => typeof language === "string")
        .map((language) => language.toLowerCase().split("-")[0])
        .filter((language) => /^[a-z]{2,3}$/.test(language)),
    ),
  ];
}

function mergeImmersionData(currentData, importedData) {
  const merged = normalizeBackupData(currentData);
  for (const [date, languages] of Object.entries(importedData)) {
    if (!merged[date]) merged[date] = {};
    for (const [language, seconds] of Object.entries(languages)) {
      merged[date][language] = (merged[date][language] || 0) + seconds;
    }
  }
  return merged;
}

/**
 * Restaura um backup ou soma seus valores aos dados existentes. O merge não
 * remove idiomas nativos: tempos na mesma data e idioma são simplesmente somados.
 */
export async function restoreBackup(backup, merge = false) {
  if (
    !backup ||
    backup.format !== BACKUP_FORMAT ||
    backup.version !== BACKUP_VERSION
  ) {
    throw new Error("This file is not a Murasaki Immerse backup.");
  }

  const importedData = normalizeBackupData(backup.immersionData);
  const importedNativeLanguages = normalizeNativeLanguageList(
    backup.nativeLanguages,
  );
  const data = merge
    ? mergeImmersionData(await loadData(), importedData)
    : importedData;
  const nativeLanguages = merge
    ? [
        ...new Set([
          ...(await getNativeLanguages()),
          ...importedNativeLanguages,
        ]),
      ]
    : importedNativeLanguages;

  await saveData(data);
  await chrome.storage.local.set({ [NATIVE_LANGUAGES_KEY]: nativeLanguages });

  return {
    merged: merge,
    nativeLanguages,
    importedDays: Object.keys(importedData).length,
  };
}

// ---------- Agregações ----------

/**
 * Últimos 7 dias com total por dia. Alias semântico para getHistory(7).
 * @returns {Promise<Array<{ date: string, totalSeconds: number, languages: Object }>>}
 */
export async function getWeekHistory() {
  return getHistory(7);
}

/**
 * Últimos 30 dias agrupados por semana (4 semanas).
 * @returns {Promise<Array<{ weekLabel: string, totalSeconds: number, languages: Object }>>}
 */
export async function getMonthHistory() {
  const data = await loadData();
  const weeks = [];

  for (let w = 0; w < 4; w++) {
    const endIdx = w * 7;
    const startIdx = (w + 1) * 7 - 1;
    let totalSeconds = 0;
    const languages = {};

    for (let d = startIdx; d >= endIdx; d--) {
      const key = dateKeyDaysAgo(d);
      const day = data[key];
      if (day) {
        for (const [lang, sec] of Object.entries(day)) {
          languages[lang] = (languages[lang] || 0) + sec;
          totalSeconds += sec;
        }
      }
    }

    weeks.push({
      weekLabel: `${dateKeyDaysAgo(startIdx)} – ${dateKeyDaysAgo(endIdx)}`,
      totalSeconds,
      languages,
    });
  }

  return weeks;
}

/**
 * Total de segundos por idioma nos últimos N dias.
 * @param {number} days — quantos dias (padrão 30)
 * @returns {Promise<Object<string, number>>}
 */
export async function getTotalByLanguage(days = 30) {
  const data = await loadData();
  const totals = {};

  for (let i = 0; i < days; i++) {
    const key = dateKeyDaysAgo(i);
    const day = data[key];
    if (day) {
      for (const [lang, sec] of Object.entries(day)) {
        totals[lang] = (totals[lang] || 0) + sec;
      }
    }
  }

  return totals;
}

// ---------- Cache de idioma (videoId → language) ----------

/**
 * Obtém o mapa de cache videoId → language.
 * @returns {Promise<Object<string, string>>}
 */
export async function getLanguageCache() {
  const result = await chrome.storage.local.get(LANG_CACHE_KEY);
  return result[LANG_CACHE_KEY] || {};
}

/**
 * Salva uma entrada no cache de idiomas.
 * @param {string} videoId
 * @param {string} language
 */
export async function setLanguageCache(videoId, language) {
  const cache = await getLanguageCache();
  cache[videoId] = language;

  // Limita o cache a 500 entradas (FIFO simples)
  const keys = Object.keys(cache);
  if (keys.length > 500) {
    const toRemove = keys.slice(0, keys.length - 500);
    for (const key of toRemove) {
      delete cache[key];
    }
  }

  await chrome.storage.local.set({ [LANG_CACHE_KEY]: cache });
}
