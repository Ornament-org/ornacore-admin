import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";

const chromePath = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const baseUrl = process.env.E2E_BASE_URL ?? "http://127.0.0.1:5173";
const email = process.env.E2E_ADMIN_EMAIL;
const password = process.env.E2E_ADMIN_PASSWORD;
const port = 9333;

if (!email || !password) {
  throw new Error("Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD");
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    "--disable-gpu",
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-extensions",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=/tmp/ornacore-admin-browser-${Date.now()}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let nextId = 0;
const pending = new Map();
const consoleErrors = [];

try {
  let targets;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      targets = await fetch(`http://127.0.0.1:${port}/json`).then((response) => response.json());
      break;
    } catch {
      await sleep(100);
    }
  }
  if (!targets?.length) throw new Error("Chrome DevTools endpoint did not start");
  const target = targets.find((candidate) => candidate.type === "page");
  if (!target) throw new Error("Chrome page target was not found");

  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });

  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(message.error.message));
      else resolve(message.result);
      return;
    }
    if (message.method === "Runtime.exceptionThrown") {
      consoleErrors.push(message.params.exceptionDetails.text);
    }
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") {
      consoleErrors.push(
        message.params.args.map((argument) => argument.value ?? argument.description).join(" "),
      );
    }
  });

  const send = (method, params = {}) =>
    new Promise((resolve, reject) => {
      const id = ++nextId;
      pending.set(id, { resolve, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });

  const evaluate = async (expression) => {
    const result = await send("Runtime.evaluate", {
      expression,
      awaitPromise: true,
      returnByValue: true,
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
    return result.result.value;
  };

  const waitFor = async (expression, timeout = 10000) => {
    const startedAt = Date.now();
    while (Date.now() - startedAt < timeout) {
      if (await evaluate(expression)) return;
      await sleep(100);
    }
    throw new Error(`Timed out waiting for ${expression}`);
  };

  const screenshot = async (path, width, height) => {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: width < 600,
    });
    await sleep(250);
    const image = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: false,
    });
    await writeFile(path, Buffer.from(image.data, "base64"));
  };

  await send("Page.enable");
  await send("Runtime.enable");
  await send("Network.enable");
  await send("Page.navigate", { url: `${baseUrl}/login` });
  await waitFor(`document.querySelector('form.login-form') !== null`);

  await evaluate(`document.querySelector('input[type="email"]').focus()`);
  await send("Input.insertText", { text: email });
  await evaluate(`document.querySelector('input[type="password"]').focus()`);
  await send("Input.insertText", { text: password });
  await evaluate(`document.querySelector('form.login-form').requestSubmit()`);

  await waitFor(`location.pathname === '/dashboard'`, 15000);
  await waitFor(`document.querySelector('.metric-grid') !== null`);
  await screenshot("/tmp/ornacore-admin-dashboard-desktop.png", 1440, 1000);
  await screenshot("/tmp/ornacore-admin-dashboard-mobile.png", 390, 844);

  const routes = [
    "/shopkeepers",
    "/catalog/metals",
    "/products",
    "/pricing/groups",
    "/inventory",
    "/orders",
    "/payments",
    "/staff",
    "/reports",
    "/audit-logs",
  ];
  for (const route of routes) {
    await send("Page.navigate", { url: `${baseUrl}${route}` });
    await waitFor(`location.pathname === ${JSON.stringify(route)}`);
    await waitFor(`document.querySelector('.page-stack') !== null`);
    const alert = await evaluate(`document.querySelector('.form-alert')?.textContent ?? ''`);
    if (alert) throw new Error(`${route}: ${alert.trim()}`);
  }

  console.log(
    JSON.stringify({
      ok: true,
      routesChecked: routes.length + 1,
      consoleErrors,
      screenshots: [
        "/tmp/ornacore-admin-dashboard-desktop.png",
        "/tmp/ornacore-admin-dashboard-mobile.png",
      ],
    }),
  );
  socket.close();
} finally {
  chrome.kill("SIGTERM");
}
