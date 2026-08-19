// Dev-only visual check: drives headless Chrome over CDP and captures the page
// at several scroll positions. Usage: node scripts/shots.mjs [outDir] [width] [height]
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { setTimeout as sleep } from "node:timers/promises";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const OUT = process.argv[2] || "./shots";
const W = Number(process.argv[3] || 1440);
const H = Number(process.argv[4] || 900);
const PORT = 9333;
const URL_BASE = process.env.BASE_URL || "http://localhost:3000";

mkdirSync(OUT, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORT}`,
  "--enable-unsafe-swiftshader",
  "--use-angle=swiftshader",
  "--hide-scrollbars",
  "--no-first-run",
  "--disable-background-timer-throttling",
  "--disable-renderer-backgrounding",
  "--disable-backgrounding-occluded-windows",
  "--disable-features=CalculateNativeWinOcclusion",
  "--user-data-dir=" + OUT + "/profile",
  `--window-size=${W},${H}`,
  "about:blank",
]);
chrome.stderr.on("data", () => {});

let target;
for (let i = 0; i < 60; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/list`);
    const list = await r.json();
    target = list.find((t) => t.type === "page");
    if (target) break;
  } catch {}
  await sleep(300);
}
if (!target) {
  chrome.kill();
  throw new Error("Chrome did not start");
}

const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((res) => (ws.onopen = res));
let id = 0;
const pending = new Map();
const logs = [];
const requests = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.method === "Network.requestWillBeSent" && /\.(png|jpg|webp)/.test(msg.params.request.url))
    requests.push("REQ " + msg.params.request.url.split("/").pop());
  if (msg.method === "Network.loadingFailed") requests.push("FAIL " + msg.params.errorText);
  if (msg.method === "Runtime.consoleAPICalled")
    logs.push(msg.params.type + ": " + msg.params.args.map((a) => a.value ?? a.description).join(" ").slice(0, 900));
  if (msg.method === "Runtime.exceptionThrown")
    logs.push("EXCEPTION: " + (msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text).slice(0, 900));
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result ?? msg.error);
    pending.delete(msg.id);
  }
};
const send = (method, params = {}) =>
  new Promise((res) => {
    const n = ++id;
    pending.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params }));
  });

const evaluate = async (expr) => {
  const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
  return r?.result?.value;
};

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");
await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: W < 700 });

const shot = async (name) => {
  // Headless composites on demand, so the first capture can return a stale frame.
  await send("Page.captureScreenshot", { format: "png" });
  await sleep(400);
  const r = await send("Page.captureScreenshot", { format: "png", fromSurface: true });
  writeFileSync(`${OUT}/${name}.png`, Buffer.from(r.data, "base64"));
  console.log("shot:", name);
};

const goto = async (path) => {
  await send("Page.navigate", { url: URL_BASE + path });
  await sleep(3500);
  // skip the one-time preloader
  await evaluate("sessionStorage.setItem('sb-loaded','1')");
};

const scrollTo = async (frac) => {
  await evaluate(`(() => { const y = (document.body.scrollHeight - innerHeight) * ${frac}; window.scrollTo(0, y); return y; })()`);
  await sleep(1600);
};

const plan = JSON.parse(process.env.SHOT_PLAN || "null") || [
  ["/", 0, "01-hero"],
  ["/", 0.07, "02-about"],
  ["/", 0.16, "03-journey-2022"],
  ["/", 0.26, "04-journey-2024"],
  ["/", 0.36, "05-journey-2026"],
  ["/", 0.47, "06-projects"],
  ["/", 0.6, "07-experience"],
  ["/", 0.7, "08-achievements"],
  ["/", 0.82, "09-skills"],
  ["/", 0.99, "10-contact"],
  ["/projects/krishibandhu", 0, "11-case-study"],
  ["/quick", 0, "12-quick"],
];

let lastPath = null;
for (const [path, frac, name] of plan) {
  if (path !== lastPath) {
    await goto(path);
    if (lastPath === null) {
      // first load happened before sessionStorage flag; reload to skip loader
      await send("Page.navigate", { url: URL_BASE + path });
      await sleep(4000);
    }
    lastPath = path;
  }
  await scrollTo(frac);
  await shot(name);
}

if (process.env.DEBUG_EVAL) {
  console.log(await evaluate(process.env.DEBUG_EVAL));
}
if (requests.length) console.log("--- network ---\n" + requests.slice(0, 12).join("\n"));
if (logs.length) console.log("--- console ---\n" + logs.slice(0, 20).join("\n"));
ws.close();
chrome.kill();
process.exit(0);
