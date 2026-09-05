import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");
const projectDir = fileURLToPath(new URL("..", import.meta.url));
const port = 4173;
const baseUrl = `http://127.0.0.1:${port}`;
let server;

before(async () => {
  server = spawn(process.execPath, [nextBin, "start", "-p", String(port)], {
    cwd: projectDir,
    env: { ...process.env, NODE_ENV: "production" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next.js server exited with code ${server.exitCode}`);
    try { const response = await fetch(baseUrl); if (response.ok) return; } catch { /* Server is still starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error("Next.js production server did not become ready");
});

after(() => { if (server && server.exitCode === null) server.kill(); });

async function expectPage(pathname, expectedText) {
  const response = await fetch(`${baseUrl}${pathname}`, { headers: { accept: "text/html" } });
  assert.equal(response.status, 200, `${pathname} returned ${response.status}`);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, expectedText);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton|Dr\. Kemi Adeyemi|Staff School, Ibadan|American Christian Academy/i);
}

const pages = [
  ["/", /Volunteer for/],
  ["/observations", /Volunteer for/],
  ["/partner", /Volunteer for/],
  ["/pilot", /Volunteer for/],
  ["/trust", /Volunteer for/],
  ["/student", /Volunteer for/],
  ["/student/missions", /Volunteer for/],
  ["/field", /Volunteer for/],
  ["/map", /Volunteer for/],
  ["/mentor", /Volunteer for/],
  ["/expert", /Volunteer for/],
  ["/teacher", /Volunteer for/],
  ["/teacher/projects/new", /Volunteer for/],
  ["/school", /Volunteer for/],
  ["/portal", /Volunteer for/],
  ["/auth", /Volunteer for/],
  ["/register", /Volunteer for/],
  ["/join", /Volunteer for/],
  ["/invite", /Volunteer for/],
  ["/admin/onboarding", /Volunteer for/],
];

for (const [pathname, expected] of pages) {
  test(`renders ${pathname}`, async () => { await expectPage(pathname, expected); });
}
