import assert from "node:assert/strict";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${pathname}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

async function expectPage(pathname, expectedText) {
  const response = await render(pathname);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, expectedText);
  assert.doesNotMatch(html, /codex-preview|Your site is taking shape|react-loading-skeleton/i);
  return html;
}

test("renders the student biodiversity dashboard", async () => {
  const html = await expectPage("/", /Good morning, Amina\./);
  assert.match(html, /Record an observation/);
  assert.match(html, /Your living school map/);
  assert.match(html, /Verified mentor/);
  assert.match(html, /Expert verified/);
});

test("renders the field-capture safety and evidence workflow", async () => {
  const html = await expectPage("/field", /Record what you observe\./);
  assert.match(html, /Protect people and wildlife/);
  assert.match(html, /Use my current location/);
  assert.match(html, /Submit for teacher review/);
});

test("renders mentor and expert workspaces", async () => {
  const mentor = await expectPage("/mentor", /Assigned schools/);
  assert.match(mentor, /Students need your insight/);
  const expert = await expectPage("/expert", /Review observations/);
  assert.match(expert, /AI suggestions remain unverified/);
  assert.match(expert, /Save expert decision/);
});

test("renders invite-only Supabase sign in", async () => {
  const html = await expectPage("/auth", /Sign in securely/);
  assert.match(html, /Email me a sign-in link/);
  assert.match(html, /Protected school access/);
});

test("renders safe registration and supervised student joining", async () => {
  const registration = await expectPage("/register", /Choose how you want to join/);
  assert.match(registration, /School/);
  assert.match(registration, /Mentor/);
  assert.match(registration, /Expert/);
  const join = await expectPage("/join", /Join your school project/);
  assert.match(join, /School-managed email/);
  assert.match(join, /teacher must verify/i);
});

test("renders onboarding administration and staff invitation routes", async () => {
  const admin = await expectPage("/admin/onboarding", /Loading onboarding workspace/);
  assert.match(admin, /Onboarding administration/);
  const invitation = await expectPage("/invite", /Accept your trusted role/);
  assert.match(invitation, /Verify invited email/);
});
