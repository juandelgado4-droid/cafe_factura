/* =============================================
   CAFECITO O MIEDO — javascript.js
   Persistencia: IndexedDB (no se borra sola)
   ============================================= */

// ─── Estado de la sesión ───────────────────────
let selectedItems = []; // { el, name, price, qty }

// ─── MongoDB con Netlify Functions ────────────
const API_URL = '/.netlify/functions/facturas';

async function openDB() {
  // Ya no es necesario con MongoDB
  return Promise.resolve();
}

async function saveFactura(invoice) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', invoice })
  });
  const data = await response.json();
  return data;
}

async function getAllFacturas() {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  return data;
}

async function deleteAllFacturas() {
  // No implementado por seguridad
  console.warn('deleteAllFacturas no disponible');
  return Promise.resolve();
}

async function deleteFactura(id) {
  const response = await fetch(API_URL, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'delete', id })
  });
  const data = await response.json();
  return data.success;
}

// ─── Inicialización ───────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await openDB();
  } catch (err) {
    console.warn('IndexedDB no disponible, usando localStorage como respaldo.', err);
    useLocalStorageFallback();
  }
  initItems();
  initSwipe();
  initModalCloseOnOverlay();
});

// ─── Tabs ─────────────────────────────────────
function showPanel(id, btn) {
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
  if (id === 'historial') renderHistorial();
}

// ─── Items: inicializar eventos ───────────────
function initItems() {
  document.querySelectorAll('.item[data-price]').forEach(el => {
    const price = parseFloat(el.dataset.price);
    if (price === 0) return; // "Consultar" — no seleccionable

    el.addEventListener('click', e => {
      // Evitar toggle si se hizo clic en un botón qty
      if (e.target.closest('.qty-btn')) return;
      toggleItem(el);
    });

    // Botones +/-
    const minus = el.querySelector('.qty-btn.minus');
    const plus  = el.querySelector('.qty-btn.plus');
    if (minus) minus.addEventListener('click', e => { e.stopPropagation(); changeQty(el, -1); });
    if (plus)  plus.addEventListener('click',  e => { e.stopPropagation(); changeQty(el,  1); });
  });
}

function toggleItem(el) {
  if (el.classList.contains('selected')) {
    el.classList.remove('selected');
    el.querySelector('.qty-num').textContent = '1';
    selectedItems = selectedItems.filter(i => i.el !== el);
  } else {
    el.classList.add('selected');
    selectedItems.push({ el, name: el.dataset.name, price: parseFloat(el.dataset.price), qty: 1 });
  }
  updateCartBtn();
}

function changeQty(el, delta) {
  const qtyEl = el.querySelector('.qty-num');
  let qty = parseInt(qtyEl.textContent) + delta;
  if (qty < 1) qty = 1;
  qtyEl.textContent = qty;
  const sel = selectedItems.find(i => i.el === el);
  if (sel) sel.qty = qty;
  updateCartBtn();
}

function updateCartBtn() {
  const btn   = document.getElementById('cart-btn');
  const count = selectedItems.length;
  document.getElementById('cart-count').textContent = count;
  btn.style.display = count > 0 ? 'flex' : 'none';
}

// ─── Carrito / Factura previa ─────────────────
function openCartModal() {
  renderFacturaPrevia();
  // Restaurar botones de acción normales
  document.querySelector('#modal-factura .invoice-actions').innerHTML = `
    <button class="btn-gold"    onclick="confirmarPedido()">✦ Confirmar Pedido</button>
    <button class="btn-outline" onclick="closeModal('modal-factura')">Seguir agregando</button>
  `;
  openModal('modal-factura');
}

function renderFacturaPrevia() {
  const { linesHtml, subtotal } = buildLinesHtml(selectedItems);
  const now     = new Date();
  const dateStr = formatDateTime(now);

  document.getElementById('factura-content').innerHTML = `
    <div class="invoice-header">
      <div class="invoice-title">✦ Cafecito o Miedo ✦</div>
      <div class="invoice-sub">Resumen de pedido</div>
      <div class="invoice-date">${dateStr}</div>
    </div>
    ${linesHtml}
    <div class="invoice-total-row">
      <span class="invoice-total-label">Subtotal</span>
      <span class="invoice-total-amount">${formatPrice(subtotal)}</span>
    </div>
  `;
}

// ─── Flujo de confirmación ────────────────────
function confirmarPedido() {
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  closeModal('modal-factura');
  if (subtotal >= 40) {
    openModal('modal-redes');
  } else {
    finalizarPedido(false);
  }
}

function applyDiscount()  { closeModal('modal-redes'); finalizarPedido(true);  }
function skipDiscount()   { closeModal('modal-redes'); finalizarPedido(false); }

async function finalizarPedido(withDiscount) {
  const now      = new Date();
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = withDiscount ? +(subtotal * 0.05).toFixed(2) : 0;
  const total    = +(subtotal - discount).toFixed(2);

  const invoice = {
    date:     now.toISOString(),
    items:    selectedItems.map(i => ({ name: i.name, price: i.price, qty: i.qty })),
    subtotal,
    discount,
    total
  };

  // Guardar en IndexedDB
  try {
    await saveFactura(invoice);
  } catch (err) {
    console.warn('Error guardando en IndexedDB, usando localStorage:', err);
    const stored = JSON.parse(localStorage.getItem('cafecito_facturas') || '[]');
    stored.push({ ...invoice, id: Date.now() });
    localStorage.setItem('cafecito_facturas', JSON.stringify(stored));
  }

  mostrarFacturaFinal(invoice);

  // Limpiar selección
  selectedItems.forEach(i => {
    i.el.classList.remove('selected');
    i.el.querySelector('.qty-num').textContent = '1';
  });
  selectedItems = [];
  updateCartBtn();
}

function mostrarFacturaFinal(invoice) {
  const { linesHtml, subtotal } = buildLinesHtml(invoice.items.map(i => ({...i, el: null})));
  const discountHtml = invoice.discount > 0
    ? `<div class="invoice-discount">
         <span>Descuento 5% ✦ redes sociales</span>
         <span>− ${formatPrice(invoice.discount)}</span>
       </div>`
    : '';

  document.getElementById('factura-content').innerHTML = `
    <div class="invoice-header">
      <div class="invoice-title">✦ Cafecito o Miedo ✦</div>
      <div class="invoice-sub">¡Gracias por tu visita!</div>
      <div class="invoice-date">${formatDateTime(new Date(invoice.date))}</div>
    </div>
    ${linesHtml}
    ${discountHtml}
    <div class="invoice-total-row">
      <span class="invoice-total-label">Total</span>
      <span class="invoice-total-amount">${formatPrice(invoice.total)}</span>
    </div>
    <p class="invoice-saved-note">✦ Factura guardada en el historial ✦</p>
  `;

  document.querySelector('#modal-factura .invoice-actions').innerHTML = `
    <button class="btn-gold" onclick="closeModal('modal-factura')">✦ Listo</button>
  `;

  openModal('modal-factura');
}

// ─── Historial ────────────────────────────────
async function renderHistorial() {
  const container = document.getElementById('historial-content');
  container.innerHTML = '<div class="db-loading">Cargando historial…</div>';

  let facturas = [];
  try {
    facturas = await getAllFacturas();
  } catch (err) {
    console.error('Error cargando facturas:', err);
    container.innerHTML = '<p class="historial-empty">Error al cargar el historial.</p>';
    return;
  }

  if (facturas.length === 0) {
    container.innerHTML = '<p class="historial-empty">No hay facturas registradas aún.</p>';
    return;
  }

  // Agrupar por día
  const byDay = {};
  facturas.forEach(inv => {
    const d   = new Date(inv.date);
    const key = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(inv);
  });

  // Ordenar días descendente
  const days = Object.keys(byDay).sort((a, b) => {
    const parse = s => { const [d,m,y] = s.split('/'); return new Date(y, m-1, d); };
    return parse(b) - parse(a);
  });

  let html = '';
  days.forEach(day => {
    html += `<div class="historial-day">
      <div class="historial-day-title">📅 ${day}</div>`;
    byDay[day].slice().reverse().forEach(inv => {
      const t       = new Date(inv.date);
      const timeStr = t.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      const preview = inv.items.map(i => i.name).join(', ');
      const invoiceId = inv._id || inv.id; // MongoDB usa _id
      html += `
        <div class="historial-invoice-card">
          <div class="historial-invoice-content" onclick="showHistorialDetail('${invoiceId}')">
            <div class="historial-invoice-header">
              <span class="historial-invoice-time">🕐 ${timeStr}</span>
              <span class="historial-invoice-total">${formatPrice(inv.total)}</span>
            </div>
            <div class="historial-invoice-items">${preview}</div>
          </div>
          <button class="historial-delete-btn" onclick="eliminarFactura('${invoiceId}')">✕</button>
        </div>`;
    });
    html += `</div>`;
  });

  container.innerHTML = html;
}

async function showHistorialDetail(id) {
  let inv = null;
  try {
    const all = await getAllFacturas();
    inv = all.find(i => i._id === id || i.id === id);
  } catch (err) {
    console.error('Error cargando factura:', err);
  }
  if (!inv) return;

  const { linesHtml } = buildLinesHtml(inv.items);
  const discountHtml  = inv.discount > 0
    ? `<div class="invoice-discount">
         <span>Descuento 5% ✦ redes sociales</span>
         <span>− ${formatPrice(inv.discount)}</span>
       </div>`
    : '';

  document.getElementById('historial-detail-content').innerHTML = `
    <div class="invoice-header">
      <div class="invoice-title">✦ Cafecito o Miedo ✦</div>
      <div class="invoice-sub">Factura registrada</div>
      <div class="invoice-date">${formatDateTime(new Date(inv.date))}</div>
    </div>
    ${linesHtml}
    ${discountHtml}
    <div class="invoice-total-row">
      <span class="invoice-total-label">Total</span>
      <span class="invoice-total-amount">${formatPrice(inv.total)}</span>
    </div>
  `;

  openModal('modal-historial-detail');
}

async function clearHistorial() {
  if (!confirm('¿Seguro que quieres borrar todo el historial de facturas?')) return;
  try {
    await deleteAllFacturas();
  } catch {
    localStorage.removeItem('cafecito_facturas');
  }
  renderHistorial();
}

async function eliminarFactura(id) {
  if (!confirm('¿Seguro que deseas eliminar esta factura?')) return;
  try {
    const success = await deleteFactura(id);
    if (success) {
      renderHistorial();
    }
  } catch (err) {
    console.error('Error eliminando factura:', err);
    alert('Error al eliminar la factura');
  }
}

// ─── Helpers ──────────────────────────────────
function buildLinesHtml(items) {
  let subtotal  = 0;
  let linesHtml = '';
  items.forEach(item => {
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;
    linesHtml += `
      <div class="invoice-line">
        <span class="invoice-line-name">${item.name}</span>
        <span class="invoice-line-qty">×${item.qty}</span>
        <span class="invoice-line-price">${formatPrice(lineTotal)}</span>
      </div>`;
  });
  return { linesHtml, subtotal };
}

function formatPrice(val) {
  const num = parseFloat(val);
  if (Number.isInteger(num) || num === Math.floor(num)) {
    return `$${num.toFixed(0)}.000`;
  }
  return `$${num.toFixed(1).replace('.', ',')}.000`;
}

function formatDateTime(date) {
  const dateStr = date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const timeStr = date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
  return `${dateStr} — ${timeStr}`;
}

// ─── Modal helpers ────────────────────────────
function openModal(id) {
  document.getElementById(id).classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(id) {
  document.getElementById(id).classList.remove('open');
  document.body.style.overflow = '';
}

function initModalCloseOnOverlay() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
}

// ─── Swipe para mobile ────────────────────────
function initSwipe() {
  let touchStartX = 0;
  document.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) < 50) return;
    const activeTab = document.querySelector('.tab.active');
    if (!activeTab) return;
    if (diff > 0) {
      const next = activeTab.nextElementSibling;
      if (next && next.classList.contains('tab')) next.click();
    } else {
      const prev = activeTab.previousElementSibling;
      if (prev && prev.classList.contains('tab')) prev.click();
    }
  }, { passive: true });
}

// ─── Fallback a localStorage (por si IndexedDB falla) ─
function useLocalStorageFallback() {
  window._usingLocalStorage = true;
}
