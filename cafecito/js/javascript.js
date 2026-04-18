/* =============================================
   CAFECITO O MIEDO — javascript.js
   ============================================= */

// ─── Estado de la sesión ───────────────────────
let selectedItems = []; // { el, name, price, qty, option }

// ─── Opciones por item ────────────────────────
const ITEM_OPTIONS = {
  'Migao abuela (choc. o milo)': ['Chocolate', 'Milo'],
  'Maicenita (trad. o arequipe)': ['Tradicional', 'Arequipe'],
  'Jugos agua': ['Maracuyá', 'Mora', 'Lulo', 'Mango'],
  'Jugos leche': ['Maracuyá', 'Mora', 'Lulo', 'Mango'],
  'Limonada': ['Natural', 'Brasilera', 'Coco', 'Cherry', 'Maracuyá'],
  'Sodas saborizadas': ['Frutas rojas', 'Amarillas', 'Verdes'],
  'Sándwich de pollo': ['Con gratinar', 'Sin gratinar'],
  'Frappe de Café': ['Frío (+$1.000)', 'Caliente'],
  'Mochaccino': ['Frío (+$1.000)', 'Caliente'],
  'Latte con Leche': ['Frío (+$1.000)', 'Caliente'],
  'Milo Frío': ['Frío (+$1.000)', 'Caliente'],
};

// Items que tienen recargo de $1.000 cuando se elige "Frío"
const FRIO_RECARGO = ['Frappe de Café', 'Mochaccino', 'Latte con Leche', 'Milo Frío'];

// ─── MongoDB con Netlify Functions ────────────
const API_URL = '/api/facturas';

async function saveFactura(invoice) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'save', invoice })
  });
  return await response.json();
}

async function getAllFacturas() {
  const response = await fetch(API_URL, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  });
  return await response.json();
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

async function updateFacturaPago(id, metodoPago) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'updatePago', id, metodoPago })
  });
  return await response.json();
}

// ─── Inicialización ───────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
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
    if (price === 0) return;

    el.addEventListener('click', e => {
      if (e.target.closest('.qty-btn')) return;
      toggleItem(el);
    });

    const minus = el.querySelector('.qty-btn.minus');
    const plus  = el.querySelector('.qty-btn.plus');
    if (minus) minus.addEventListener('click', e => { e.stopPropagation(); changeQty(el, -1); });
    if (plus)  plus.addEventListener('click',  e => { e.stopPropagation(); changeQty(el,  1); });
  });
}

function toggleItem(el) {
  const name = el.dataset.name;
  if (el.classList.contains('selected')) {
    el.classList.remove('selected');
    el.querySelector('.qty-num').textContent = '1';
    // Limpiar badge de opción si existe
    const badge = el.querySelector('.option-badge');
    if (badge) badge.remove();
    selectedItems = selectedItems.filter(i => i.el !== el);
  } else {
    const options = ITEM_OPTIONS[name];
    if (options) {
      // Mostrar selector de opción antes de agregar
      openOptionModal(el, name, options);
    } else {
      el.classList.add('selected');
      selectedItems.push({ el, name, price: parseFloat(el.dataset.price), qty: 1, option: null });
    }
  }
  updateCartBtn();
}

// ─── Modal de opciones ────────────────────────
function openOptionModal(el, name, options) {
  const modal = document.getElementById('modal-opciones');
  document.getElementById('opciones-title').textContent = name;
  const container = document.getElementById('opciones-list');
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.textContent = opt;
    btn.onclick = () => {
      selectOption(el, opt);
      closeModal('modal-opciones');
    };
    container.appendChild(btn);
  });
  openModal('modal-opciones');
}

function selectOption(el, option) {
  el.classList.add('selected');
  let badge = el.querySelector('.option-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'option-badge';
    el.querySelector('.item-qty').before(badge);
  }
  badge.textContent = option;

  const baseName = el.dataset.name;
  const basePrice = parseFloat(el.dataset.price);
  // Aplicar recargo de 1 (=$1.000) si elige Frío en items con recargo
  const esFrio = option.startsWith('Frío') && FRIO_RECARGO.includes(baseName);
  const finalPrice = esFrio ? basePrice + 1 : basePrice;

  const existing = selectedItems.find(i => i.el === el);
  if (existing) {
    existing.option = option;
    existing.price = finalPrice;
  } else {
    selectedItems.push({ el, name: baseName, price: finalPrice, qty: 1, option });
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
    date:       now.toISOString(),
    items:      selectedItems.map(i => ({ name: i.name, price: i.price, qty: i.qty, option: i.option || null })),
    subtotal,
    discount,
    total,
    metodoPago: null
  };

  try {
    await saveFactura(invoice);
  } catch (err) {
    console.warn('Error guardando factura:', err);
  }

  mostrarFacturaFinal(invoice);

  selectedItems.forEach(i => {
    i.el.classList.remove('selected');
    i.el.querySelector('.qty-num').textContent = '1';
    const badge = i.el.querySelector('.option-badge');
    if (badge) badge.remove();
  });
  selectedItems = [];
  updateCartBtn();
}

function mostrarFacturaFinal(invoice) {
  const { linesHtml } = buildLinesHtml(invoice.items);
  const discountHtml = invoice.discount > 0
    ? `<div class="invoice-discount">
         <span>Descuento 5% ✦ redes sociales</span>
         <span>− ${formatPrice(invoice.discount)}</span>
       </div>` : '';

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
    <p class="invoice-saved-note">✦ Guardada — registra el pago en el historial ✦</p>
  `;

  document.querySelector('#modal-factura .invoice-actions').innerHTML = `
    <button class="btn-gold" onclick="closeModal('modal-factura')">✦ Listo</button>
  `;

  openModal('modal-factura');
}

// ─── Resumen del día ──────────────────────────
function buildResumenDia(facturas) {
  const hoy = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const facturasHoy = facturas.filter(inv => {
    const d = new Date(inv.date);
    return d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) === hoy;
  });

  if (facturasHoy.length === 0) return '';

  const totalGeneral    = facturasHoy.reduce((s, i) => s + i.total, 0);
  const totalEfectivo   = facturasHoy.filter(i => i.metodoPago === 'efectivo').reduce((s, i) => s + i.total, 0);
  const totalTransfer   = facturasHoy.filter(i => i.metodoPago === 'transferencia').reduce((s, i) => s + i.total, 0);
  const cantidadFacturas = facturasHoy.length;

  return `
    <div class="resumen-dia">
      <div class="resumen-dia-title">✦ Resumen de Hoy ✦</div>
      <div class="resumen-dia-grid">
        <div class="resumen-dia-item">
          <span class="resumen-dia-label">💵 Efectivo</span>
          <span class="resumen-dia-value">${formatPrice(totalEfectivo)}</span>
        </div>
        <div class="resumen-dia-item">
          <span class="resumen-dia-label">📲 Transferencia</span>
          <span class="resumen-dia-value">${formatPrice(totalTransfer)}</span>
        </div>
        <div class="resumen-dia-item">
          <span class="resumen-dia-label">🧾 Facturas</span>
          <span class="resumen-dia-value">${cantidadFacturas}</span>
        </div>
        <div class="resumen-dia-item resumen-dia-total">
          <span class="resumen-dia-label">Total del día</span>
          <span class="resumen-dia-value">${formatPrice(totalGeneral)}</span>
        </div>
      </div>
    </div>
  `;
}

function buildResumenDiaCompacto(facturasDia) {
  const total         = facturasDia.reduce((s, i) => s + i.total, 0);
  const efectivo      = facturasDia.filter(i => i.metodoPago === 'efectivo').reduce((s, i) => s + i.total, 0);
  const transferencia = facturasDia.filter(i => i.metodoPago === 'transferencia').reduce((s, i) => s + i.total, 0);
  const cantidad      = facturasDia.length;

  return `
    <div class="resumen-dia-compacto">
      <span>🧾 ${cantidad} facturas</span>
      <span>💵 ${formatPrice(efectivo)}</span>
      <span>📲 ${formatPrice(transferencia)}</span>
      <span class="resumen-compacto-total">Total: ${formatPrice(total)}</span>
    </div>
  `;
}

// ─── Historial ────────────────────────────────
async function renderHistorial() {
  const container = document.getElementById('historial-content');
  container.innerHTML = '<div class="db-loading">Cargando historial…</div>';

  let facturas = [];
  try {
    facturas = await getAllFacturas();
  } catch (err) {
    container.innerHTML = '<p class="historial-empty">Error al cargar el historial.</p>';
    return;
  }

  if (facturas.length === 0) {
    container.innerHTML = '<p class="historial-empty">No hay facturas registradas aún.</p>';
    return;
  }

  const byDay = {};
  facturas.forEach(inv => {
    const d   = new Date(inv.date);
    const key = d.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(inv);
  });

  const days = Object.keys(byDay).sort((a, b) => {
    const parse = s => { const [d,m,y] = s.split('/'); return new Date(y, m-1, d); };
    return parse(b) - parse(a);
  });

  // Resumen de hoy arriba de todo
  let html = buildResumenDia(facturas);

  days.forEach(day => {
    html += `<div class="historial-day">
      <div class="historial-day-title">📅 ${day}</div>
      ${buildResumenDiaCompacto(byDay[day])}
    `;
    byDay[day].slice().reverse().forEach(inv => {
      const t         = new Date(inv.date);
      const timeStr   = t.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      const preview   = inv.items.map(i => i.option ? `${i.name} (${i.option})` : i.name).join(', ');
      const invoiceId = inv._id || inv.id;
      const pagado = inv.metodoPago === 'efectivo' || inv.metodoPago === 'transferencia';
      const pagoIcon  = inv.metodoPago === 'transferencia' ? '📲' : inv.metodoPago === 'efectivo' ? '💵' : '⚠';
      const pagoLabel = inv.metodoPago || 'No pagado';
      const pagoClass = pagado ? 'historial-invoice-pago' : 'historial-invoice-pago no-pagado';
      html += `
        <div class="historial-invoice-card">
          <div class="historial-invoice-content" onclick="showHistorialDetail('${invoiceId}')">
            <div class="historial-invoice-header">
              <span class="historial-invoice-time">🕐 ${timeStr}</span>
              <span class="historial-invoice-total">${formatPrice(inv.total)}</span>
            </div>
            <div class="historial-invoice-items">${preview}</div>
            <div class="${pagoClass}">${pagoIcon} ${pagoLabel}</div>
          </div>
          <div class="historial-card-actions">
            <button class="historial-delete-btn" onclick="eliminarFactura('${invoiceId}')">✕</button>
          </div>
        </div>`;
    });
    html += `</div>`;
  });

  container.innerHTML = html;
}

async function cambiarPago(id, pagoActual, e) {
  e.stopPropagation();
  const nuevo = pagoActual === 'efectivo' ? 'transferencia' : 'efectivo';
  try {
    await updateFacturaPago(String(id), nuevo);
    renderHistorial();
  } catch (err) {
    alert('Error al actualizar el método de pago');
  }
}

async function showHistorialDetail(id) {
  let inv = null;
  try {
    const all = await getAllFacturas();
    inv = all.find(i => String(i._id) === String(id) || String(i.id) === String(id));
  } catch (err) { return; }
  if (!inv) return;

  const invoiceId = String(inv._id || inv.id);
  const { linesHtml } = buildLinesHtml(inv.items);
  const discountHtml  = inv.discount > 0
    ? `<div class="invoice-discount">
         <span>Descuento 5% ✦ redes sociales</span>
         <span>− ${formatPrice(inv.discount)}</span>
       </div>` : '';
  const pagoActual = inv.metodoPago || '';

  // Botones de pago
  const botonesHtml = `
    <div class="pago-selector-titulo">¿Cómo pagó?</div>
    <div class="pago-selector">
      <button class="btn-pago-selector ${pagoActual === 'efectivo' ? 'activo' : ''}" id="btn-pago-efectivo">
        💵 Efectivo
      </button>
      <button class="btn-pago-selector ${pagoActual === 'transferencia' ? 'activo' : ''}" id="btn-pago-transferencia">
        📲 Transferencia
      </button>
    </div>
    ${pagoActual ? `<div class="pago-registrado">✦ Pago registrado: <strong>${pagoActual}</strong></div>` : '<div class="pago-pendiente">⚠ Pago no registrado</div>'}
  `;

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
    ${botonesHtml}
  `;

  document.getElementById('btn-pago-efectivo').onclick = async () => {
    await registrarPago(invoiceId, 'efectivo');
  };
  document.getElementById('btn-pago-transferencia').onclick = async () => {
    await registrarPago(invoiceId, 'transferencia');
  };

  openModal('modal-historial-detail');
}

async function registrarPago(id, metodoPago) {
  try {
    await updateFacturaPago(String(id), metodoPago);
    closeModal('modal-historial-detail');
    await renderHistorial();
  } catch (err) {
    alert('Error al registrar el pago');
  }
}

async function cambiarPagoDesdeDetalle(id, pagoActual) {
  const nuevo = pagoActual === 'efectivo' ? 'transferencia' : (pagoActual === 'transferencia' ? 'efectivo' : 'efectivo');
  try {
    const res = await updateFacturaPago(id, nuevo);
    closeModal('modal-historial-detail');
    await renderHistorial();
  } catch (err) {
    console.error('Error cambiando pago:', err);
    alert('Error al actualizar el método de pago: ' + err.message);
  }
}

async function eliminarFactura(id) {
  if (!confirm('¿Seguro que deseas eliminar esta factura?')) return;
  try {
    const success = await deleteFactura(id);
    if (success) renderHistorial();
  } catch (err) {
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
    const optionHtml = item.option ? `<span class="invoice-line-option">(${item.option})</span>` : '';
    linesHtml += `
      <div class="invoice-line">
        <span class="invoice-line-name">${item.name}${optionHtml}</span>
        <span class="invoice-line-qty">×${item.qty}</span>
        <span class="invoice-line-price">${formatPrice(lineTotal)}</span>
      </div>`;
  });
  return { linesHtml, subtotal };
}

function formatPrice(val) {
  const num = parseFloat(val);
  // Multiplicar por 1000 para obtener el valor real en pesos
  const pesos = Math.round(num * 1000);
  return '$' + pesos.toLocaleString('es-CO');
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
