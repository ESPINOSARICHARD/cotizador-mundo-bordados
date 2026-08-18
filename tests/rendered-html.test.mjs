import assert from "node:assert/strict";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("renderiza el cotizador de Mundo Bordados", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>Demo pública \| Cotizador Mundo Bordados<\/title>/i);
  assert.match(html, /Datos de la cotización/);
  assert.match(html, /Descargar PDF/);
  assert.match(html, /Descargar PNG/);
  assert.match(html, /Demostración pública/);
  assert.match(html, /Sin validez comercial/);
  assert.doesNotMatch(html, /6-82-697|Richard Espinosa|6030-7452/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});
