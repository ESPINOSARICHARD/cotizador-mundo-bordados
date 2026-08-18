"use client";

import { useEffect, useMemo, useState } from "react";

type Product = {
  id: string;
  quantity: string;
  description: string;
  unitPrice: string;
};

type QuoteState = {
  quoteNumber: string;
  date: string;
  client: string;
  attention: string;
  phone: string;
  fax: string;
  deliveryTime: string;
  paymentTerms: string;
  observations: string;
  validityNote: string;
  introText: string;
  servicesText: string;
  itbmsEnabled: boolean;
  products: Product[];
};

const STORAGE_KEY = "mundo-bordados-cotizador-demo-v1";
const BASE_INTRO = "Es nuestro interés ser su mejor opción en calidad, tiempo de entrega y precio; si en alguna de estas características alguien nos supera, permítanos mejorar nuestra oferta para ser así su mejor elección.";
const BASE_SERVICES = "Bordados, T-shirts, polos, gorras, viseras, toallas, insignias, maletines y mucho más.";

function localDate() {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  return new Date(now.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function blankProduct(id = "producto-1"): Product {
  return { id, quantity: "", description: "", unitPrice: "" };
}

function defaultState(): QuoteState {
  return {
    quoteNumber: "",
    date: localDate(),
    client: "",
    attention: "",
    phone: "",
    fax: "",
    deliveryTime: "30 días hábiles",
    paymentTerms: "50% con la orden y 50% en la entrega.",
    observations: "",
    validityNote: "Cotización válida por 30 días.",
    introText: BASE_INTRO,
    servicesText: BASE_SERVICES,
    itbmsEnabled: false,
    products: [blankProduct()],
  };
}

function productAmount(product: Product) {
  const quantity = Number.parseFloat(product.quantity) || 0;
  const price = Number.parseFloat(product.unitPrice) || 0;
  return Math.max(0, quantity) * Math.max(0, price);
}

function money(value: number) {
  return `B/. ${value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function displayDate(value: string) {
  if (!value) return "Sin fecha";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function rowWeight(product: Product) {
  return Math.max(1, Math.ceil((product.description.trim().length || 1) / 72));
}

function takeByWeight(products: Product[], capacity: number) {
  const chunk: Product[] = [];
  let used = 0;
  for (const product of products) {
    const weight = rowWeight(product);
    if (chunk.length && used + weight > capacity) break;
    chunk.push(product);
    used += weight;
  }
  return chunk;
}

function paginateProducts(products: Product[]) {
  const safeProducts = products.length ? products : [blankProduct("preview-empty")];
  const totalWeight = safeProducts.reduce((sum, product) => sum + rowWeight(product), 0);
  if (totalWeight <= 10) return [safeProducts];

  const lastPage: Product[] = [];
  let lastWeight = 0;
  let lastStart = safeProducts.length;
  while (lastStart > 0) {
    const candidate = safeProducts[lastStart - 1];
    const weight = rowWeight(candidate);
    if (lastPage.length && lastWeight + weight > 9) break;
    lastPage.unshift(candidate);
    lastWeight += weight;
    lastStart -= 1;
  }

  const pages: Product[][] = [];
  let remaining = safeProducts.slice(0, lastStart);
  while (remaining.length) {
    const capacity = pages.length === 0 ? 14 : 18;
    const chunk = takeByWeight(remaining, capacity);
    pages.push(chunk);
    remaining = remaining.slice(chunk.length);
  }
  pages.push(lastPage);
  return pages;
}

function safeFilename(value: string) {
  return (value || "sin-numero").trim().replace(/[^a-zA-Z0-9-_]+/g, "-").replace(/^-+|-+$/g, "") || "sin-numero";
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1200);
}

function Field({ label, optional, children, wide = false }: { label: string; optional?: boolean; children: React.ReactNode; wide?: boolean }) {
  return (
    <label className={`field ${wide ? "field-wide" : ""}`}>
      <span>{label}{optional ? <small>Opcional</small> : null}</span>
      {children}
    </label>
  );
}

function QuotePage({
  data,
  products,
  pageIndex,
  pageCount,
  subtotal,
  tax,
  total,
}: {
  data: QuoteState;
  products: Product[];
  pageIndex: number;
  pageCount: number;
  subtotal: number;
  tax: number;
  total: number;
}) {
  const first = pageIndex === 0;
  const last = pageIndex === pageCount - 1;
  return (
    <article className={`quote-page ${!first ? "quote-page-continuation" : ""}`} data-page={pageIndex + 1}>
      <div className="quote-accent" />
      <div className="demo-watermark" aria-hidden="true">DEMO</div>
      <header className="quote-header">
        <div className="brand-block">
          <img src="/logo-mundo-bordados.jpg" alt="Mundo Bordados" className="quote-logo" />
          {!first ? <span className="continuation-label">Continuación</span> : null}
        </div>
        <div className="quote-heading">
          <span className="quote-eyebrow">Documento comercial</span>
          <h2>COTIZACIÓN</h2>
          <div className="quote-company-data">
            <span>Demostración pública</span>
            <span>Sin validez comercial</span>
          </div>
        </div>
      </header>

      {first ? (
        <section className="client-card">
          <div className="client-main">
            <span className="client-kicker">Preparado para</span>
            <strong>{data.client.trim() || "Empresa o cliente"}</strong>
            {data.attention.trim() ? <span>Atención: {data.attention}</span> : null}
          </div>
          <dl className="client-meta">
            <div><dt>Fecha</dt><dd>{displayDate(data.date)}</dd></div>
            {data.quoteNumber.trim() ? <div><dt>N.º cotización</dt><dd>{data.quoteNumber}</dd></div> : null}
            {data.phone.trim() ? <div><dt>Teléfono</dt><dd>{data.phone}</dd></div> : null}
            {data.fax.trim() ? <div><dt>Fax</dt><dd>{data.fax}</dd></div> : null}
          </dl>
        </section>
      ) : (
        <section className="continuation-meta">
          <span>{data.client.trim() || "Cliente"}</span>
          {data.quoteNumber.trim() ? <span>Cotización N.º {data.quoteNumber}</span> : <span>{displayDate(data.date)}</span>}
        </section>
      )}

      <section className="quote-items">
        <table>
          <thead>
            <tr>
              <th className="qty-column">Cant.</th>
              <th>Descripción</th>
              <th className="price-column">Precio unit.</th>
              <th className="total-column">Total</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td className="qty-cell">{product.quantity || "—"}</td>
                <td className="description-cell">{product.description.trim() || "Producto o servicio"}</td>
                <td className="money-cell">{money(Number.parseFloat(product.unitPrice) || 0)}</td>
                <td className="money-cell strong">{money(productAmount(product))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {last ? (
        <section className="quote-final">
          <div className="totals-and-signature">
            <div className="demo-seal">
              <strong>DEMO</strong>
              <span>Firma y datos fiscales reservados</span>
            </div>
            <div className="totals-card">
              <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              {data.itbmsEnabled ? <div><span>ITBMS (7%)</span><strong>{money(tax)}</strong></div> : null}
              <div className="grand-total"><span>Total</span><strong>{money(total)}</strong></div>
            </div>
          </div>

          <p className="intro-copy">{data.introText}</p>

          <div className="terms-grid">
            <div><span>Condiciones de pago</span><p>{data.paymentTerms || "—"}</p></div>
            <div><span>Tiempo de entrega</span><p>{data.deliveryTime || "—"}</p></div>
            {data.observations.trim() ? <div className="term-wide"><span>Observaciones</span><p>{data.observations}</p></div> : null}
          </div>

          <div className="quote-note">{data.validityNote}</div>
          <div className="services-ribbon">{data.servicesText}</div>
        </section>
      ) : (
        <div className="continued-note">Continúa en la página siguiente</div>
      )}

      <footer className="page-footer">
        <span>Proyecto de portafolio · Mundo Bordados</span>
        <span>Página {pageIndex + 1} de {pageCount}</span>
      </footer>
    </article>
  );
}

export function Cotizador() {
  const [data, setData] = useState<QuoteState>(() => defaultState());
  const [hydrated, setHydrated] = useState(false);
  const [exporting, setExporting] = useState<"pdf" | "png" | null>(null);
  const [notice, setNotice] = useState("Modo demo · Datos guardados solo en este navegador");

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QuoteState;
        if (parsed.products?.length) setData(parsed);
      }
    } catch {
      setNotice("No se pudo recuperar el borrador anterior");
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      setNotice("Modo demo · Datos guardados solo en este navegador");
    } catch {
      setNotice("El navegador no pudo guardar este borrador");
    }
  }, [data, hydrated]);

  const subtotal = useMemo(() => data.products.reduce((sum, product) => sum + productAmount(product), 0), [data.products]);
  const tax = data.itbmsEnabled ? subtotal * 0.07 : 0;
  const total = subtotal + tax;
  const pages = useMemo(() => paginateProducts(data.products), [data.products]);

  function updateField<K extends keyof QuoteState>(field: K, value: QuoteState[K]) {
    setData((current) => ({ ...current, [field]: value }));
  }

  function updateProduct(id: string, field: keyof Omit<Product, "id">, value: string) {
    setData((current) => ({
      ...current,
      products: current.products.map((product) => product.id === id ? { ...product, [field]: value } : product),
    }));
  }

  function addProduct() {
    const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `producto-${Date.now()}`;
    setData((current) => ({ ...current, products: [...current.products, blankProduct(id)] }));
  }

  function removeProduct(id: string) {
    setData((current) => ({
      ...current,
      products: current.products.length === 1 ? [blankProduct()] : current.products.filter((product) => product.id !== id),
    }));
  }

  function clearQuote() {
    if (!window.confirm("¿Limpiar la cotización y comenzar una nueva?")) return;
    const fresh = defaultState();
    setData(fresh);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    setNotice("Cotización nueva lista");
  }

  async function capturePages() {
    await document.fonts.ready;
    const { default: html2canvas } = await import("html2canvas");
    const pageElements = Array.from(document.querySelectorAll<HTMLElement>(".quote-page"));
    return Promise.all(pageElements.map((page) => html2canvas(page, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: false,
      width: 816,
      height: 1056,
      windowWidth: 1440,
    })));
  }

  async function exportPdf() {
    setExporting("pdf");
    setNotice("Preparando el PDF…");
    try {
      const [{ jsPDF }, canvases] = await Promise.all([import("jspdf"), capturePages()]);
      const pdf = new jsPDF({ orientation: "portrait", unit: "in", format: "letter", compress: true });
      canvases.forEach((canvas, index) => {
        if (index > 0) pdf.addPage("letter", "portrait");
        pdf.addImage(canvas.toDataURL("image/jpeg", 0.96), "JPEG", 0, 0, 8.5, 11, undefined, "FAST");
      });
      pdf.save(`Demo-Cotizador-Mundo-Bordados-${safeFilename(data.quoteNumber)}.pdf`);
      setNotice(`PDF listo · ${canvases.length} ${canvases.length === 1 ? "página" : "páginas"}`);
    } catch (error) {
      console.error(error);
      setNotice("No se pudo crear el PDF. Intenta nuevamente.");
    } finally {
      setExporting(null);
    }
  }

  async function exportPng() {
    setExporting("png");
    setNotice("Preparando las imágenes…");
    try {
      const canvases = await capturePages();
      const blobs = await Promise.all(canvases.map((canvas) => new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("No se pudo crear la imagen")), "image/png");
      })));
      const base = `Demo-Cotizador-Mundo-Bordados-${safeFilename(data.quoteNumber)}`;
      if (blobs.length === 1) {
        downloadBlob(blobs[0], `${base}.png`);
      } else {
        const { default: JSZip } = await import("jszip");
        const zip = new JSZip();
        blobs.forEach((blob, index) => zip.file(`${base}-pagina-${String(index + 1).padStart(2, "0")}.png`, blob));
        downloadBlob(await zip.generateAsync({ type: "blob", compression: "DEFLATE" }), `${base}-imagenes.zip`);
      }
      setNotice(blobs.length === 1 ? "PNG listo para compartir" : `${blobs.length} imágenes listas en un archivo ZIP`);
    } catch (error) {
      console.error(error);
      setNotice("No se pudieron crear las imágenes. Intenta nuevamente.");
    } finally {
      setExporting(null);
    }
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="app-brand">
          <div className="app-logo-wrap"><img src="/logo-mundo-bordados.jpg" alt="Mundo Bordados" /></div>
          <div><span>Demo pública de portafolio</span><h1>Cotizador Mundo Bordados</h1></div>
        </div>
        <div className="header-actions">
          <button className="button button-ghost" type="button" onClick={clearQuote}>Limpiar</button>
          <button className="button button-secondary" type="button" onClick={exportPng} disabled={exporting !== null}>
            {exporting === "png" ? "Creando…" : "Descargar PNG"}
          </button>
          <button className="button button-primary" type="button" onClick={exportPdf} disabled={exporting !== null}>
            {exporting === "pdf" ? "Creando…" : "Descargar PDF"}
          </button>
        </div>
      </header>

      <div className="workspace-grid">
        <aside className="editor-panel">
          <div className="editor-intro">
            <div><span className="status-dot" />{notice}</div>
            <span>{pages.length} {pages.length === 1 ? "página" : "páginas"}</span>
          </div>

          <section className="form-section">
            <div className="section-heading"><span>01</span><div><h2>Datos de la cotización</h2><p>Información principal del documento.</p></div></div>
            <div className="form-grid">
              <Field label="Número de cotización" optional><input value={data.quoteNumber} onChange={(e) => updateField("quoteNumber", e.target.value)} placeholder="Ej. 2026-018" /></Field>
              <Field label="Fecha"><input type="date" value={data.date} onChange={(e) => updateField("date", e.target.value)} /></Field>
              <Field label="Empresa o cliente" wide><input value={data.client} onChange={(e) => updateField("client", e.target.value)} placeholder="Nombre de la empresa o persona" /></Field>
              <Field label="Atención" wide><input value={data.attention} onChange={(e) => updateField("attention", e.target.value)} placeholder="Persona de contacto" /></Field>
              <Field label="Teléfono" optional><input value={data.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="Ej. 6000-0000" /></Field>
              <Field label="Fax" optional><input value={data.fax} onChange={(e) => updateField("fax", e.target.value)} placeholder="Se oculta si queda vacío" /></Field>
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading"><span>02</span><div><h2>Productos y servicios</h2><p>Agrega todas las filas que necesites.</p></div></div>
            <div className="product-list">
              {data.products.map((product, index) => (
                <div className="product-editor" key={product.id}>
                  <div className="product-editor-head"><strong>Producto {index + 1}</strong><button type="button" onClick={() => removeProduct(product.id)} aria-label={`Eliminar producto ${index + 1}`}>Eliminar</button></div>
                  <div className="product-fields">
                    <Field label="Cantidad"><input inputMode="decimal" min="0" type="number" value={product.quantity} onChange={(e) => updateProduct(product.id, "quantity", e.target.value)} placeholder="0" /></Field>
                    <Field label="Precio unitario"><input inputMode="decimal" min="0" step="0.01" type="number" value={product.unitPrice} onChange={(e) => updateProduct(product.id, "unitPrice", e.target.value)} placeholder="0.00" /></Field>
                    <Field label="Descripción" wide><textarea rows={2} value={product.description} onChange={(e) => updateProduct(product.id, "description", e.target.value)} placeholder="Describe el producto, material, color, bordado o medida" /></Field>
                  </div>
                  <div className="line-total"><span>Total de la fila</span><strong>{money(productAmount(product))}</strong></div>
                </div>
              ))}
            </div>
            <button className="add-product" type="button" onClick={addProduct}><span>＋</span>Agregar producto</button>
          </section>

          <section className="form-section">
            <div className="section-heading"><span>03</span><div><h2>Totales</h2><p>El cálculo se actualiza automáticamente.</p></div></div>
            <label className="tax-toggle">
              <input type="checkbox" checked={data.itbmsEnabled} onChange={(e) => updateField("itbmsEnabled", e.target.checked)} />
              <span className="toggle-track"><span /></span>
              <span><strong>Aplicar ITBMS del 7%</strong><small>Actívalo solo cuando corresponda.</small></span>
            </label>
            <div className="editor-totals">
              <div><span>Subtotal</span><strong>{money(subtotal)}</strong></div>
              {data.itbmsEnabled ? <div><span>ITBMS</span><strong>{money(tax)}</strong></div> : null}
              <div><span>Total final</span><strong>{money(total)}</strong></div>
            </div>
          </section>

          <section className="form-section">
            <div className="section-heading"><span>04</span><div><h2>Condiciones y textos</h2><p>Todo puede editarse sin tocar código.</p></div></div>
            <div className="form-grid">
              <Field label="Tiempo de entrega" wide><input value={data.deliveryTime} onChange={(e) => updateField("deliveryTime", e.target.value)} /></Field>
              <Field label="Condiciones de pago" wide><textarea rows={2} value={data.paymentTerms} onChange={(e) => updateField("paymentTerms", e.target.value)} /></Field>
              <Field label="Observaciones" optional wide><textarea rows={3} value={data.observations} onChange={(e) => updateField("observations", e.target.value)} placeholder="Detalles especiales, colores, tallas u otra información" /></Field>
              <Field label="Nota de validez" wide><input value={data.validityNote} onChange={(e) => updateField("validityNote", e.target.value)} /></Field>
              <Field label="Mensaje de presentación" wide><textarea rows={4} value={data.introText} onChange={(e) => updateField("introText", e.target.value)} /></Field>
              <Field label="Texto final de servicios" wide><textarea rows={3} value={data.servicesText} onChange={(e) => updateField("servicesText", e.target.value)} /></Field>
            </div>
          </section>
        </aside>

        <section className="preview-panel" aria-label="Vista previa de la cotización">
          <div className="preview-toolbar"><div><span>Vista previa en tiempo real</span><small>Tamaño carta · {pages.length} {pages.length === 1 ? "página" : "páginas"}</small></div><span className="live-pill"><i />Actualizada</span></div>
          <div className="pages-stack">
            {pages.map((pageProducts, index) => (
              <QuotePage key={`${pages.length}-${index}`} data={data} products={pageProducts} pageIndex={index} pageCount={pages.length} subtotal={subtotal} tax={tax} total={total} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
