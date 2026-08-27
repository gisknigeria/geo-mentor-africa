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

test("renders the public GeoMentor Africa landing page", async () => {
  const html = await expectPage("/", /Turn every school into a living biodiversity classroom\./);
  assert.match(html, /Register your school/);
  assert.match(html, /Safeguarding by design/i);
  assert.match(html, /Join with a class code/);
  assert.match(html, /Trust &amp; safety/);
});

test("renders the public trust and safety centre", async () => {
  const trust = await expectPage("/trust", /Trust, safety and dignity by design\./);
  assert.match(trust, /The child’s best interests come first\./);
  assert.match(trust, /Collect less\. Explain clearly\. Protect carefully\./);
  assert.match(trust, /Consent is informed, recorded and reversible\./);
  assert.match(trust, /Pilot Terms of Use/i);
  assert.match(trust, /Nigeria Data Protection Act 2023/);
});

test("renders the public pilot onboarding centre", async () => {
  const pilot = await expectPage("/pilot", /Take your school from interest to a safe first field lesson\./);
  assert.match(pilot, /The pilot launch path/i);
  assert.match(pilot, /Printable pilot checklist/i);
  assert.match(pilot, /students join only through supervised class access/i);
  assert.match(pilot, /Start an application/i);
});

test("renders the student biodiversity dashboard", async () => {
  const html = await expectPage("/student", /Good morning, Amina\./);
  assert.match(html, /Open today’s mission/);
  assert.match(html, /Explore GIS map/);
  assert.match(html, /Record an observation/);
  assert.match(html, /Your living school map/);
  assert.match(html, /Verified mentor/);
  assert.match(html, /Expert verified/);
});

test("renders the interactive privacy-safe school GIS map", async () => {
  const map = await expectPage("/map", /Explore what lives around your school\./);
  assert.match(map, /Map layers/);
  assert.match(map, /Expert-verified records only/);
  assert.match(map, /LOCATIONS GENERALIZED/);
  assert.match(map, /Protected nest site/);
  assert.match(map, /Record another observation/);
});

test("renders the student mission and lesson workflow", async () => {
  const mission = await expectPage("/student/missions", /Discover one living neighbour\./);
  assert.match(mission, /Safety gate/i);
  assert.match(mission, /Complete the mission/);
  assert.match(mission, /Learning reflection/i);
  assert.match(mission, /Teacher quality gate/i);
  assert.match(mission, /Save mission progress/);
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

test("renders the teacher evidence-quality gate", async () => {
  const teacher = await expectPage("/teacher", /Teacher review queue/);
  assert.match(teacher, /Send to expert/);
  assert.match(teacher, /Save teacher decision/);
});

test("renders the teacher pilot project setup workflow", async () => {
  const setup = await expectPage("/teacher/projects/new", /Plan a safe first biodiversity project\./);
  assert.match(setup, /Project and class/);
  assert.match(setup, /Safe field area/);
  assert.match(setup, /Observation themes/);
  assert.match(setup, /Save project setup/);
});

test("renders the protected school operations workspace", async () => {
  const school = await expectPage("/school", /SCHOOL OPERATIONS/);
  assert.match(school, /Pending consent/i);
  assert.match(school, /PRIVACY-SAFE MAP/);
  assert.match(school, /Open teacher queue/);
});

test("renders the role-aware workspace portal", async () => {
  const portal = await expectPage("/portal", /One account\. The right workspace\./);
  assert.match(portal, /Student fieldwork/);
  assert.match(portal, /Teacher review/);
  assert.match(portal, /Expert validation/);
  assert.match(portal, /Role protected/);
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
