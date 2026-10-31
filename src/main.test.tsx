import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

/**
 * Regression guard for the blank-screen bug.
 *
 * The app rendered a blank white page because `src/main.tsx` called
 * `useEffect()` at module scope. Evaluating the module threw an
 * "Invalid hook call" error *before* `createRoot(...).render()` ever ran,
 * so `#root` stayed empty. The existing suite imported `App` directly and
 * therefore never executed the entry point, so the bug slipped through.
 *
 * These tests assert on the entry point's source so the failure mode is
 * caught statically, without needing a browser.
 */
const mainSource = readFileSync(resolve(__dirname, "main.tsx"), "utf8");

describe("app entry point (src/main.tsx)", () => {
  it("does not call React hooks at module scope", () => {
    // Any hook call that is not inside a component body is invalid.
    const hookCalls = mainSource.match(/^\s*(?:const\s+\{[^}]*\}\s*=\s*)?use[A-Z]\w*\s*\(/gm);

    expect(hookCalls ?? []).toEqual([]);
  });

  it("does not import React hooks", () => {
    expect(mainSource).not.toMatch(/import\s+React\s*,\s*\{[^}]*use[A-Z]/);
    expect(mainSource).not.toMatch(/import\s*\{[^}]*use[A-Z]\w*[^}]*\}\s*from\s*["']react["']/);
  });

  it("mounts the app into the #root element", () => {
    expect(mainSource).toMatch(/createRoot\s*\(\s*document\.getElementById\(\s*["']root["']\s*\)/);
    expect(mainSource).toMatch(/\.render\s*\(/);
  });

  it("wraps the app in the I18nextProvider", () => {
    expect(mainSource).toMatch(/I18nextProvider/);
  });
});
