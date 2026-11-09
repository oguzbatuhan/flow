import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { DICTS, detectLang, getLocale, setLang, t, tp } from "../src/lib/i18n.js";
import { groupLabel, relativeName } from "../src/lib/dates.js";
import { monthLabel } from "../src/lib/history.js";
import { human, humanMS } from "../src/lib/time.js";

// Every test leaves the language on English again, so the other test files are not affected
const withLang = (lang, fn) => {
  setLang(lang);
  try {
    return fn();
  } finally {
    setLang("en");
  }
};

test("English and Turkish dictionaries have exactly the same keys", () => {
  assert.deepEqual(Object.keys(DICTS.tr).sort(), Object.keys(DICTS.en).sort());
  for (const lang of ["en", "tr"]) {
    for (const [k, v] of Object.entries(DICTS[lang])) assert.ok(typeof v === "string" && v.length > 0, lang + ":" + k + " is empty");
  }
});

test("placeholders match between languages", () => {
  const holes = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(",");
  for (const k of Object.keys(DICTS.en)) assert.equal(holes(DICTS.tr[k]), holes(DICTS.en[k]), k);
});

test("every key used in the source exists", () => {
  const files = [];
  const walk = (dir) => {
    for (const name of readdirSync(dir)) {
      const p = join(dir, name);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.jsx?$/.test(name) && !p.endsWith(join("lib", "i18n.js"))) files.push(p);
    }
  };
  walk(new URL("../src", import.meta.url).pathname);
  const used = new Set();
  for (const f of files) {
    const src = readFileSync(f, "utf8");
    for (const m of src.matchAll(/"((?:app|toast|lang|common|time|status|timer|big|session|history|sync|err)\.[A-Za-z0-9_]+)"/g)) used.add(m[1]);
  }
  assert.ok(used.size > 40, "expected to find many keys, found " + used.size);
  for (const key of used) assert.ok(key in DICTS.en || key + "_one" in DICTS.en, "missing key: " + key);
});

test("English stays the default and the texts are unchanged", () => {
  assert.equal(t("app.today"), "Today");
  assert.equal(relativeName("2026-10-20", "2026-10-20"), "Today");
  assert.deepEqual(groupLabel("2026-10-19", "2026-10-20"), { primary: "Yesterday", secondary: "October 19 Monday" });
  assert.equal(human(2 * 3600000 + 15 * 60000), "2 h 15 min");
  assert.equal(humanMS(50 * 60000 + 12000), "50 min 12 sec");
});

test("Turkish dates and durations", () => {
  withLang("tr", () => {
    assert.equal(getLocale(), "tr-TR");
    assert.deepEqual(groupLabel("2026-10-19", "2026-10-20"), { primary: "Dün", secondary: "19 Ekim Pazartesi" });
    assert.equal(monthLabel("2025-03", "2026-10-20"), "Mart 2025");
    assert.equal(human(2 * 3600000 + 15 * 60000), "2 sa 15 dk");
    assert.equal(human(2 * 3600000), "2 sa");
    assert.equal(human(45 * 60000), "45 dk");
    assert.equal(humanMS(50 * 60000 + 12000), "50 dk 12 sn");
    assert.equal(humanMS(40000), "40 sn");
  });
});

test("plurals and placeholders", () => {
  assert.equal(tp("history.aria", 1), "History (1 day)");
  assert.equal(tp("history.aria", 3), "History (3 days)");
  withLang("tr", () => assert.equal(tp("history.aria", 3), "Geçmiş (3 gün)"));
  assert.equal(t("no.such.key"), "no.such.key");
});

test("language detection falls back to the browser language", () => {
  assert.equal(detectLang(), "en");
});
