// Interface language (English / Turkish).
// The current language is kept in this module, so plain helpers (dates, durations ...) can translate without React.
// React components subscribe through the hook in src/i18n.jsx, which re-renders them when the language changes.
// Default is English (so the tests and any non-browser use are stable); the browser language picks Turkish in the app.

export const LANGS = ["en", "tr"];
export const LANG_KEY = "flow-lang-v1";
export const LOCALES = { en: "en-US", tr: "tr-TR" };

const en = {
  // App
  "app.title": "Flow",
  "app.description": "Measure your study time, save it by day, and back it up to Supabase by signing in with Google.",
  "app.today": "Today",
  "app.noRecords": "No records yet. Start the timer; when you finish, it is added under today.",
  "app.noRecordsToday": "No records today yet.",
  "app.todayRecords": "Today's records",
  "toast.deleted": "Record deleted",
  "app.undo": "Undo",

  // Language switch
  "lang.label": "Language",
  "lang.en": "English",
  "lang.tr": "Türkçe",

  // Common
  "common.close": "Close",
  "common.cancel": "Cancel",
  "common.delete": "Delete",
  "common.today": "Today",
  "common.tomorrow": "Tomorrow",
  "common.thisWeek": "This week",
  "common.nextWeek": "Next week",
  "common.weekN": "Week {n}",
  "common.yesterday": "Yesterday",

  // Durations
  "time.sec": "sec",
  "time.min": "min",
  "time.hour": "h",
  "time.timerAria": "{m} minutes {s} seconds",

  // Timer
  "status.idle": "Ready",
  "status.running": "Running",
  "status.paused": "Paused",
  "timer.aria": "Timer",
  "timer.bigScreen": "Big screen",
  "timer.tag": "Tag",
  "timer.tagPlaceholder": "Tag (e.g. Math)",
  "timer.recentTags": "Recently used tags",
  "timer.start": "Start",
  "timer.pause": "Pause",
  "timer.resume": "Resume",
  "timer.finish": "Finish",
  "timer.discardQ": "Discard without saving?",
  "timer.discard": "Discard",
  "timer.discardLink": "Discard without saving",
  "timer.screenOn": "Screen stays on",
  "timer.keepOpen": "Keep this page open so the screen stays on",
  "timer.noWake": "This browser can't keep the screen on. Increase your phone's screen timeout.",

  // Big screen
  "big.aria": "Big counter",
  "big.close": "Close big screen",
  "big.waiting": "Waiting for screen lock",
  "big.noWake": "This browser can't keep the screen on",

  // Records
  "session.untagged": "Untagged",
  "session.confirmDeletion": "Confirm deletion: {label}",
  "session.deleteQ": "Delete?",

  // History
  "history.title": "History",
  "history.aria_one": "History ({n} day)",
  "history.aria_other": "History ({n} days)",
  "history.stats": "{days} {dayWord} · {time}",
  "history.day_one": "day",
  "history.day_other": "days",
  "history.empty": "No past days yet.",
  "history.expandAll": "Expand all",
  "history.collapseAll": "Collapse all",

  // Cloud backup
  "sync.backUp": "Back up with Google",
  "sync.signInAgain": "Sign in again",
  "sync.ariaNeedsAuth": "Cloud backup: sign in again",
  "sync.ariaError": "Cloud backup: error",
  "sync.ariaSyncing": "Syncing",
  "sync.ariaDefault": "Cloud backup",
  "sync.errorStatus": "Sync error",
  "sync.expired": "Session expired. Sign in again to keep backing up.",
  "sync.googleAccount": "Google account",
  "sync.syncedAt": " · synced {time}",
  "sync.syncNow": "Sync now",
  "sync.tryAgain": "Try again",
  "sync.disconnect": "Disconnect",

  // Sync / server errors
  "err.offline": "No internet connection, will retry when it returns.",
  "err.unknown": "Unknown error",
  "err.signInStart": "Could not start sign-in",
  "err.unreachable": "Could not reach the server. Will retry when the connection returns.",
  "err.noTable": "Table '{table}' does not exist in Supabase. Run supabase/setup.sql in the SQL Editor.",
  "err.rls": "Access to the table was denied (RLS). Make sure you have run supabase/setup.sql.",
  "err.requestFailed": "Supabase request failed",
};

const tr = {
  // App
  "app.title": "Flow",
  "app.description": "Çalışma süreni ölç, günlere göre kaydet; Google ile giriş yaparak Supabase'e yedekle.",
  "app.today": "Bugün",
  "app.noRecords": "Henüz kayıt yok. Zamanlayıcıyı başlat; bitirdiğinde bugünün altına eklenir.",
  "app.noRecordsToday": "Bugün henüz kayıt yok.",
  "app.todayRecords": "Bugünün kayıtları",
  "toast.deleted": "Kayıt silindi",
  "app.undo": "Geri al",

  // Language switch
  "lang.label": "Dil",
  "lang.en": "English",
  "lang.tr": "Türkçe",

  // Common
  "common.close": "Kapat",
  "common.cancel": "İptal",
  "common.delete": "Sil",
  "common.today": "Bugün",
  "common.tomorrow": "Yarın",
  "common.thisWeek": "Bu hafta",
  "common.nextWeek": "Gelecek hafta",
  "common.weekN": "{n}. hafta",
  "common.yesterday": "Dün",

  // Durations
  "time.sec": "sn",
  "time.min": "dk",
  "time.hour": "sa",
  "time.timerAria": "{m} dakika {s} saniye",

  // Timer
  "status.idle": "Hazır",
  "status.running": "Çalışıyor",
  "status.paused": "Duraklatıldı",
  "timer.aria": "Zamanlayıcı",
  "timer.bigScreen": "Büyük ekran",
  "timer.tag": "Etiket",
  "timer.tagPlaceholder": "Etiket (ör. Matematik)",
  "timer.recentTags": "Son kullanılan etiketler",
  "timer.start": "Başlat",
  "timer.pause": "Duraklat",
  "timer.resume": "Devam et",
  "timer.finish": "Bitir",
  "timer.discardQ": "Kaydetmeden silinsin mi?",
  "timer.discard": "Sil",
  "timer.discardLink": "Kaydetmeden sil",
  "timer.screenOn": "Ekran açık kalıyor",
  "timer.keepOpen": "Ekranın açık kalması için bu sayfayı açık tut",
  "timer.noWake": "Bu tarayıcı ekranı açık tutamıyor. Telefonunun ekran zaman aşımını uzat.",

  // Big screen
  "big.aria": "Büyük sayaç",
  "big.close": "Büyük ekranı kapat",
  "big.waiting": "Ekran kilidi bekleniyor",
  "big.noWake": "Bu tarayıcı ekranı açık tutamıyor",

  // Records
  "session.untagged": "Etiketsiz",
  "session.confirmDeletion": "Silmeyi onayla: {label}",
  "session.deleteQ": "Silinsin mi?",

  // History
  "history.title": "Geçmiş",
  "history.aria_one": "Geçmiş ({n} gün)",
  "history.aria_other": "Geçmiş ({n} gün)",
  "history.stats": "{days} {dayWord} · {time}",
  "history.day_one": "gün",
  "history.day_other": "gün",
  "history.empty": "Henüz geçmiş gün yok.",
  "history.expandAll": "Tümünü aç",
  "history.collapseAll": "Tümünü kapat",

  // Cloud backup
  "sync.backUp": "Google ile yedekle",
  "sync.signInAgain": "Tekrar giriş yap",
  "sync.ariaNeedsAuth": "Bulut yedekleme: tekrar giriş yap",
  "sync.ariaError": "Bulut yedekleme: hata",
  "sync.ariaSyncing": "Eşitleniyor",
  "sync.ariaDefault": "Bulut yedekleme",
  "sync.errorStatus": "Eşitleme hatası",
  "sync.expired": "Oturum süresi doldu. Yedeklemeye devam etmek için tekrar giriş yap.",
  "sync.googleAccount": "Google hesabı",
  "sync.syncedAt": " · {time} eşitlendi",
  "sync.syncNow": "Şimdi eşitle",
  "sync.tryAgain": "Tekrar dene",
  "sync.disconnect": "Bağlantıyı kes",

  // Sync / server errors
  "err.offline": "İnternet bağlantısı yok, bağlantı gelince yeniden denenecek.",
  "err.unknown": "Bilinmeyen hata",
  "err.signInStart": "Giriş başlatılamadı",
  "err.unreachable": "Sunucuya ulaşılamadı. Bağlantı gelince yeniden denenecek.",
  "err.noTable": "'{table}' tablosu Supabase'de yok. SQL Editor'de supabase/setup.sql dosyasını çalıştır.",
  "err.rls": "Tabloya erişim reddedildi (RLS). supabase/setup.sql dosyasını çalıştırdığından emin ol.",
  "err.requestFailed": "Supabase isteği başarısız oldu",
};

export const DICTS = { en, tr };

let current = "en";

export const isLang = (v) => LANGS.includes(v);
export const getLang = () => current;
export const setLang = (lang) => {
  if (isLang(lang)) current = lang;
  return current;
};
export const getLocale = (lang = current) => LOCALES[lang] || LOCALES.en;

// Saved choice first, then the browser language (Turkish for "tr", English for everything else)
export function detectLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (isLang(saved)) return saved;
  } catch {}
  const nav = typeof navigator !== "undefined" ? navigator.languages?.[0] || navigator.language || "" : "";
  return String(nav).toLowerCase().startsWith("tr") ? "tr" : "en";
}

export function saveLang(lang) {
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {}
}

const fill = (str, params) =>
  params ? str.replace(/\{(\w+)\}/g, (m, k) => (params[k] === undefined ? m : String(params[k]))) : str;

// t("key", { name }) -> text in the current language (falls back to English, then to the key itself)
export function t(key, params) {
  return fill(DICTS[current]?.[key] ?? en[key] ?? key, params);
}

// Plural-aware: tp("toast.moved", 3, { ... }) picks "toast.moved_one" / "toast.moved_other"; {n} is filled in
export function tp(key, n, params) {
  const form = new Intl.PluralRules(getLocale()).select(n) === "one" ? "_one" : "_other";
  return t(key + form, { n, ...params });
}
