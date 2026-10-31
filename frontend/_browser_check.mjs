// Temporary verification harness: drives headless Chrome over the DevTools
// Protocol to confirm the app mounts (non-blank #root), that no console/page
// errors occur, and that i18next requests /locales/*.json for each language.
import { spawn } from "node:child_process";
import { appendFileSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const LOG = "c:\\HerHealth\\frontend\\_browser_log.txt";
const log = (...parts) => appendFileSync(LOG, parts.join(" ") + "\n");

const CHROME = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const APP_URL = "http://127.0.0.1:5173/";
const PORT = 9333;

const profile = mkdtempSync(join(tmpdir(), "hh-cdp-"));
const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-sandbox",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${profile}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function getJson(path) {
  const res = await fetch(`http://127.0.0.1:${PORT}${path}`);
  return res.json();
}

async function waitForDevTools() {
  for (let i = 0; i < 60; i++) {
    try {
      return await getJson("/json/version");
    } catch {
      await sleep(250);
    }
  }
  throw new Error("Chrome DevTools endpoint never became available");
}

class Session {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    ws.addEventListener("message", (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
      } else if (msg.method) {
        this.events.push(msg);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
}

async function evaluate(session, expression) {
  const { result } = await session.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  return result?.value;
}

async function run(lang) {
  const target = await fetch(
    `http://127.0.0.1:${PORT}/json/new?about:blank`,
    { method: "PUT" }
  ).then((r) => r.json());

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  const session = new Session(ws);
  await session.send("Runtime.enable");
  await session.send("Log.enable");
  await session.send("Page.enable");
  await session.send("Network.enable");

  await session.send("Page.navigate", { url: APP_URL });
  await sleep(2500);

  if (lang) {
    await evaluate(
      session,
      `localStorage.setItem("herhealth-lang", ${JSON.stringify(lang)}); true`
    );
    session.events.length = 0;
    await session.send("Page.reload", { ignoreCache: true });
    await sleep(3500);
  }

  const dom = await evaluate(
    session,
    `(() => {
      const root = document.getElementById("root");
      return {
        rootExists: !!root,
        rootChildCount: root ? root.children.length : 0,
        rootHtmlLength: root ? root.innerHTML.length : 0,
        h1: document.querySelector("h1")?.textContent?.trim() ?? null,
        bodyTextLength: document.body.innerText.length,
        lang: document.documentElement.lang,
      };
    })()`
  );

  const localeRequests = session.events
    .filter((e) => e.method === "Network.requestWillBeSent")
    .map((e) => e.params.request.url)
    .filter((u) => u.includes("/locales/"));

  const consoleErrors = session.events
    .filter(
      (e) =>
        (e.method === "Runtime.consoleAPICalled" &&
          ["error", "warning"].includes(e.params.type)) ||
        e.method === "Runtime.exceptionThrown" ||
        (e.method === "Log.entryAdded" && e.params.entry.level === "error")
    )
    .map((e) => {
      if (e.method === "Runtime.exceptionThrown") {
        return `exception: ${e.params.exceptionDetails.text} ${
          e.params.exceptionDetails.exception?.description ?? ""
        }`;
      }
      if (e.method === "Log.entryAdded") {
        return `log(${e.params.entry.source}): ${e.params.entry.text}`;
      }
      return `console.${e.params.type}: ${e.params.args
        .map((a) => a.value ?? a.description ?? a.type)
        .join(" ")}`;
    });

  const failedRequests = session.events
    .filter(
      (e) =>
        e.method === "Network.loadingFailed" ||
        (e.method === "Network.responseReceived" && e.params.response.status >= 400)
    )
    .map((e) =>
      e.method === "Network.loadingFailed"
        ? `${e.params.requestId}: ${e.params.errorText}`
        : `${e.params.response.url}: ${e.params.response.status}`
    );

  ws.close();
  await fetch(`http://127.0.0.1:${PORT}/json/close/${target.id}`);

  return { lang, dom, localeRequests, consoleErrors, failedRequests };
}

try {
  log("starting, waiting for devtools");
  await waitForDevTools();
  log("devtools ready");

  const en = await run(null);
  log("en done", JSON.stringify(en));
  const hi = await run("hi");
  log("hi done");
  const mr = await run("mr");
  log("mr done");

  const result = { en, hi, mr };
  log("RESULT " + JSON.stringify(result));
  const { writeFileSync } = await import("node:fs");
  writeFileSync("c:\\HerHealth\\frontend\\_browser_check.json", JSON.stringify(result, null, 2));
} catch (err) {
  log("HARNESS ERROR: " + String(err?.stack ?? err));
  const { writeFileSync } = await import("node:fs");
  writeFileSync("c:\\HerHealth\\frontend\\_browser_check.err", String(err?.stack ?? err));
  process.exitCode = 1;
} finally {
  chrome.kill();
  await sleep(500);
  try {
    rmSync(profile, { recursive: true, force: true });
  } catch {
    /* best effort */
  }
}
