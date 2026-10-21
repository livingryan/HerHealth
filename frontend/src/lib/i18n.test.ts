import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const LOCALES = ["en", "hi", "mr", "kn"] as const;

const LOCALES_DIR = resolve(process.cwd(), "public", "locales");

const readLocale = (lng: string) =>
  JSON.parse(readFileSync(resolve(LOCALES_DIR, `${lng}.json`), "utf8"));

/** Flattens a nested locale object into dotted keys, e.g. "nav.home". */
const flatten = (obj: Record<string, unknown>, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return flatten(value as Record<string, unknown>, path);
    }
    return [path];
  });

describe("translation resources", () => {
  it.each(LOCALES)("%s.json is valid JSON", (lng) => {
    expect(() => readLocale(lng)).not.toThrow();
  });

  it("every locale exposes the same keys as the English source", () => {
    const en = flatten(readLocale("en")).sort();

    for (const lng of LOCALES.filter((l) => l !== "en")) {
      expect(flatten(readLocale(lng)).sort()).toEqual(en);
    }
  });

  it("has no blank translation values", () => {
    for (const lng of LOCALES) {
      const locale = readLocale(lng);
      const blank: string[] = [];

      const walk = (obj: Record<string, unknown>, prefix = "") => {
        for (const [key, value] of Object.entries(obj)) {
          const path = prefix ? `${prefix}.${key}` : key;
          if (value && typeof value === "object") {
            walk(value as Record<string, unknown>, path);
          } else if (typeof value !== "string" || value.trim() === "") {
            blank.push(path);
          }
        }
      };

      walk(locale);
      expect(blank).toEqual([]);
    }
  });
});
