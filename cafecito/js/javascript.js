/* =============================================
   CAFECITO O MIEDO — javascript.js
   ============================================= */

let selectedItems = [];

const ITEM_OPTIONS = {
  'Migao abuela (choc. o milo)': ['Chocolate', 'Milo'],
  'Maicenita (trad. o arequipe)': ['Tradicional', 'Arequipe'],
  'Jugos agua': ['Maracuyá', 'Mora', 'Lulo', 'Mango'],
  'Jugos leche': ['Maracuyá', 'Mora', 'Lulo', 'Mango'],
  'Limonada': ['Natural', 'Brasilera', 'Coco', 'Cherry', 'Maracuyá'],
  'Sodas saborizadas': ['Frutas rojas', 'Amarillas', 'Verdes'],
  'Sándwich de pollo': ['Con gratinar', 'Sin gratinar'],
  'Cappuccino': ['Caliente', 'Frío (+$1.000)'],
  'Frappe de Café': ['Frío (+$1.000)', 'Caliente'],
  'Latte': ['Caliente', 'Frío (+$1.000)'],
  'Té Chai': ['Caliente', 'Frío (+$1.000)'],
  'Mochaccino': ['Caliente', 'Frío (+$1.000)'],
  'Milo': ['Caliente', 'Frío (+$1.000)'],
};

const FRIO_RECARGO = ['Cappuccino', 'Frappe de Café', 'Latte', 'Té Chai', 'Mochaccino', 'Milo'];

const ALL_ITEMS = [
  { name: 'Americano', price: 5 }, { name: 'Campesino', price: 6 }, { name: 'Expreso Cubano', price: 6 },
  { name: 'Espresso', price: 4 }, { name: 'Espresso Doble', price: 5 }, { name: 'Affogato', price: 10 },
  { name: 'Bombón', price: 8 }, { name: 'Frappe de Café', price: 9 }, { name: 'Cappuccino', price: 8 },
  { name: 'Latte', price: 8 }, { name: 'Mochaccino', price: 9 }, { name: 'Té Chai', price: 9 },
  { name: 'Cappuccino con Licor', price: 12 }, { name: 'Carajillo', price: 11 }, { name: 'Latte con Licor', price: 12 },
  { name: 'Agua de panela con queso', price: 8 }, { name: 'Aromáticas', price: 3 },
  { name: 'Canelazo', price: 6 }, { name: 'Canelazo con licor', price: 9 }, { name: 'Chocolate', price: 5 },
  { name: 'Copa de vino', price: 12 }, { name: 'Infusión de frutas', price: 7 },
  { name: 'Infusión frutas deshidratadas', price: 6 }, { name: 'Maicenita (trad. o arequipe)', price: 8 },
  { name: 'Migao abuela (choc. o milo)', price: 16 }, { name: 'Migao abuela maicenita', price: 17 }, { name: 'Milo', price: 7 },
  { name: 'Agua con gas', price: 4 }, { name: 'Agua sin gas', price: 3 },
  { name: 'Jugos agua', price: 6 }, { name: 'Jugos leche', price: 7 }, { name: 'Limonada', price: 7 },
  { name: 'Soda', price: 3.5 }, { name: 'Sodas saborizadas', price: 11 }, { name: 'Tinto de verano', price: 13 },
  { name: 'Té frío', price: 4 }, { name: 'Gaseosas', price: 4 }, { name: 'Tamarindo', price: 4.5 },
  { name: 'Coca Cola', price: 5 }, { name: 'Michelados', price: 2.5 },
  { name: 'Corona', price: 7 }, { name: 'Club Colombia', price: 6 }, { name: 'Light', price: 5 }, { name: 'Tres Cordilleras', price: 7 },
  { name: 'Shot de brandy', price: 6 }, { name: 'Shot de aguardiente', price: 6 },
  { name: 'Shot de Baileys', price: 10 }, { name: 'Shot de Whisky', price: 15 },
  { name: 'Deditos de queso x4', price: 7 }, { name: 'Empanaditas x4', price: 8 },
  { name: 'Nachos mixtos', price: 16.5 }, { name: 'Patacones con ahogado', price: 6 },
  { name: 'Papas a la francesa', price: 6 }, { name: 'Papas en casco', price: 9 },
  { name: 'Burro de pollo', price: 12 }, { name: 'Burro mixto', price: 16 },
  { name: 'Mini hamburguesas x2', price: 18 }, { name: 'Sándwich criollo x2', price: 17 },
  { name: 'Sándwich de pollo', price: 10 }, { name: 'Tostadas francesas', price: 14 },
  { name: 'Waffle dulce', price: 10 }, { name: 'Waffle salado', price: 12 },
  { name: 'Cheesecake', price: 10 }, { name: 'Torta de Chocolate', price: 10 },
  { name: 'Torta tradicional de la abuela', price: 7 }, { name: 'Torta de Zanahoria', price: 8 },
  { name: 'Helado Frito Limón', price: 14 }, { name: 'Helado Frito Frutos Rojos', price: 14 },
  { name: 'Mini hamburguesa + papa + hit', price: 16 }, { name: 'Nuggets de pollo + papa + hit', price: 12 },
  { name: 'Guacamole', price: 3 }, { name: 'Porción de salsa', price: 2 }, { name: 'Porción de pollo o carne', price: 3 },
];

const API_URL = '/api/facturas';

async function saveFactura(invoice) {
  const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'save', invoice }) });
  return await r.json();
}
async function getAllFacturas() {
  const r = await fetch(API_URL, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
  return await r.json();
}
async function deleteFactura(id) {
  const r = await fetch(API_URL, { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'delete', id }) });
  return (await r.json()).success;
}
async function updateFacturaPago(id, metodoPago) {
  const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updatePago', id, metodoPago }) });
  return await r.json();
}
async function updateFacturaItems(id, items, subtotal, discount, total) {
  const r = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'updateItems', id, items, subtotal, discount, total }) });
  return await r.json();
}

document.addEventListener('DOMContentLoaded', () => { initItems(); initSwipe(); initModalCloseOnOverlay(); });

function showPanel(id, btn) {
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  btn.classList.add('active');
  if (id === 'historial') renderHistorial();
}

function initItems() {
  document.querySelectorAll('.item[data-price]').forEach(el => {
    if (parseFloat(el.dataset.price) === 0) return;
    el.addEventListener('click', e => { if (e.target.closest('.qty-btn')) return; toggleItem(el); });
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
    const badge = el.querySelector('.option-badge');
    if (badge) badge.remove();
    selectedItems = selectedItems.filter(i => i.el !== el);
    updateCartBtn();
  } else {
    const options = ITEM_OPTIONS[name];
    if (options) {
      openOptionModal(null, name, options, (opt) => {
        el.classList.add('selected');
        const basePrice = parseFloat(el.dataset.price);
        const esFrio = opt.startsWith('Frío') && FRIO_RECARGO.includes(name);
        const finalPrice = esFrio ? basePrice + 1 : basePrice;
        setBadge(el, opt.replace(' (+$1.000)', ''));
        selectedItems.push({ el, name, basePrice, price: finalPrice, qty: 1, options: [opt] });
        updateCartBtn();
      });
    } else {
      el.classList.add('selected');
      selectedItems.push({ el, name, basePrice: parseFloat(el.dataset.price), price: parseFloat(el.dataset.price), qty: 1, options: [] });
      updateCartBtn();
    }
  }
}

function changeQty(el, delta) {
  const sel = selectedItems.find(i => i.el === el);
  if (!sel) return;
  const newQty = sel.qty + delta;
  if (newQty < 1) return;
  const options = ITEM_OPTIONS[sel.name];
  if (delta > 0 && options) {
    openOptionModal(null, sel.name, options, (opt) => {
      sel.qty += 1;
      sel.options.push(opt);
      // Recalcular precio promedio
      const total = sel.options.reduce((s, o) => s + (o.startsWith('Frío') && FRIO_RECARGO.includes(sel.name) ? sel.basePrice + 1 : sel.basePrice), 0);
      sel.price = total / sel.qty;
      el.querySelector('.qty-num').textContent = sel.qty;
      const resumen = getOpcionesResumen(sel.options);
      setBadge(el, resumen);
      updateCartBtn();
    });
  } else {
    sel.qty = newQty;
    if (sel.options && newQty < sel.options.length) sel.options = sel.options.slice(0, newQty);
    el.querySelector('.qty-num').textContent = newQty;
    updateCartBtn();
  }
}

function getOpcionesResumen(options) {
  const counts = {};
  options.forEach(o => { const k = o.replace(' (+$1.000)', ''); counts[k] = (counts[k] || 0) + 1; });
  return Object.entries(counts).map(([k, v]) => v > 1 ? `${k} x${v}` : k).join(', ');
}

function setBadge(el, text) {
  let badge = el.querySelector('.option-badge');
  if (!badge) { badge = document.createElement('span'); badge.className = 'option-badge'; el.querySelector('.item-qty').before(badge); }
  badge.textContent = text;
}

function updateCartBtn() {
  const count = selectedItems.length;
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-btn').style.display = count > 0 ? 'flex' : 'none';
}

function openOptionModal(el, name, options, callback) {
  document.getElementById('opciones-title').textContent = name;
  const container = document.getElementById('opciones-list');
  container.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'btn-option';
    btn.textContent = opt;
    btn.onclick = () => { closeModal('modal-opciones'); callback(opt); };
    container.appendChild(btn);
  });
  openModal('modal-opciones');
}

function openCartModal() {
  renderFacturaPrevia();
  document.querySelector('#modal-factura .invoice-actions').innerHTML = `
    <button class="btn-gold" onclick="confirmarPedido()">✦ Confirmar Pedido</button>
    <button class="btn-outline" onclick="closeModal('modal-factura')">Seguir agregando</button>
  `;
  openModal('modal-factura');
}

function renderFacturaPrevia() {
  const { linesHtml, subtotal } = buildLinesHtml(selectedItems);
  document.getElementById('factura-content').innerHTML = `
    <div class="invoice-header">
      <div class="invoice-title">✦ Cafecito o Miedo ✦</div>
      <div class="invoice-sub">Resumen de pedido</div>
      <div class="invoice-date">${formatDateTime(new Date())}</div>
    </div>
    ${linesHtml}
    <div class="invoice-total-row">
      <span class="invoice-total-label">Subtotal</span>
      <span class="invoice-total-amount">${formatPrice(subtotal)}</span>
    </div>`;
}

function confirmarPedido() {
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  closeModal('modal-factura');
  if (subtotal >= 40) openModal('modal-redes');
  else finalizarPedido(false);
}

function applyDiscount() { closeModal('modal-redes'); finalizarPedido(true); }
function skipDiscount()  { closeModal('modal-redes'); finalizarPedido(false); }

async function finalizarPedido(withDiscount) {
  const subtotal = selectedItems.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = withDiscount ? +(subtotal * 0.05).toFixed(2) : 0;
  const total    = +(subtotal - discount).toFixed(2);
  const invoice  = {
    date: new Date().toISOString(),
    items: selectedItems.map(i => ({
      name: i.name, price: i.price, qty: i.qty, basePrice: i.basePrice,
      options: i.options || [],
      option: i.options && i.options.length > 0 ? getOpcionesResumen(i.options) : null
    })),
    subtotal, discount, total, metodoPago: null
  };
  try { await saveFactura(invoice); } catch (e) { console.warn(e); }
  selectedItems.forEach(i => {
    i.el.classList.remove('selected');
    i.el.querySelector('.qty-num').textContent = '1';
    const b = i.el.querySelector('.option-badge'); if (b) b.remove();
  });
  selectedItems = [];
  updateCartBtn();
  const { linesHtml } = buildLinesHtml(invoice.items);
  document.getElementById('factura-content').innerHTML = `
    <div class="invoice-header">
      <div class="invoice-title">✦ Cafecito o Miedo ✦</div>
      <div class="invoice-sub">¡Gracias por tu visita!</div>
      <div class="invoice-date">${formatDateTime(new Date(invoice.date))}</div>
    </div>
    ${linesHtml}
    ${discount > 0 ? `<div class="invoice-discount"><span>Descuento 5% ✦ redes</span><span>− ${formatPrice(discount)}</span></div>` : ''}
    <div class="invoice-total-row"><span class="invoice-total-label">Total</span><span class="invoice-total-amount">${formatPrice(total)}</span></div>
    <p class="invoice-saved-note">✦ Guardada — registra el pago en el historial ✦</p>`;
  document.querySelector('#modal-factura .invoice-actions').innerHTML = `<button class="btn-gold" onclick="closeModal('modal-factura')">✦ Listo</button>`;
  openModal('modal-factura');
}

// ─── Resumen día ──────────────────────────────
function buildResumenDia(facturas) {
  const hoy  = new Date().toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const hoyF = facturas.filter(i => new Date(i.date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }) === hoy);
  if (!hoyF.length) return '';
  const te = hoyF.filter(i => i.metodoPago === 'efectivo').reduce((s, i) => s + i.total, 0);
  const tt = hoyF.filter(i => i.metodoPago === 'transferencia').reduce((s, i) => s + i.total, 0);
  const tg = hoyF.reduce((s, i) => s + i.total, 0);
  return `<div class="resumen-dia"><div class="resumen-dia-title">✦ Resumen de Hoy ✦</div><div class="resumen-dia-grid">
    <div class="resumen-dia-item"><span class="resumen-dia-label">💵 Efectivo</span><span class="resumen-dia-value">${formatPrice(te)}</span></div>
    <div class="resumen-dia-item"><span class="resumen-dia-label">📲 Transferencia</span><span class="resumen-dia-value">${formatPrice(tt)}</span></div>
    <div class="resumen-dia-item"><span class="resumen-dia-label">🧾 Facturas</span><span class="resumen-dia-value">${hoyF.length}</span></div>
    <div class="resumen-dia-item resumen-dia-total"><span class="resumen-dia-label">Total del día</span><span class="resumen-dia-value">${formatPrice(tg)}</span></div>
  </div></div>`;
}

function buildResumenDiaCompacto(fd) {
  const te = fd.filter(i => i.metodoPago === 'efectivo').reduce((s, i) => s + i.total, 0);
  const tt = fd.filter(i => i.metodoPago === 'transferencia').reduce((s, i) => s + i.total, 0);
  const tg = fd.reduce((s, i) => s + i.total, 0);
  return `<div class="resumen-dia-compacto"><span>🧾 ${fd.length} facturas</span><span>💵 ${formatPrice(te)}</span><span>📲 ${formatPrice(tt)}</span><span class="resumen-compacto-total">Total: ${formatPrice(tg)}</span></div>`;
}

// ─── Historial ────────────────────────────────
async function renderHistorial() {
  const container = document.getElementById('historial-content');
  container.innerHTML = '<div class="db-loading">Cargando historial…</div>';
  let facturas = [];
  try { facturas = await getAllFacturas(); }
  catch (e) { container.innerHTML = '<p class="historial-empty">Error al cargar el historial.</p>'; return; }
  if (!facturas.length) { container.innerHTML = '<p class="historial-empty">No hay facturas registradas aún.</p>'; return; }

  const byDay = {};
  facturas.forEach(inv => {
    const key = new Date(inv.date).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(inv);
  });
  const days = Object.keys(byDay).sort((a, b) => {
    const p = s => { const [d,m,y] = s.split('/'); return new Date(y, m-1, d); };
    return p(b) - p(a);
  });

  let html = buildResumenDia(facturas);
  days.forEach(day => {
    html += `<div class="historial-day"><div class="historial-day-title">📅 ${day}</div>${buildResumenDiaCompacto(byDay[day])}`;
    byDay[day].slice().reverse().forEach(inv => {
      const timeStr   = new Date(inv.date).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
      const preview   = inv.items.map(i => i.option ? `${i.name} (${i.option})` : i.name).join(', ');
      const invoiceId = String(inv._id || inv.id);
      const pagado    = inv.metodoPago === 'efectivo' || inv.metodoPago === 'transferencia';
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

// ─── Detalle / Edición ────────────────────────
async function showHistorialDetail(id) {
  let inv = null;
  try {
    const all = await getAllFacturas();
    inv = all.find(i => String(i._id) === String(id) || String(i.id) === String(id));
  } catch (e) { return; }
  if (!inv) return;
  window._editInvoiceId = String(inv._id || inv.id);
  window._editInvoice   = JSON.parse(JSON.stringify(inv));
  window._editDiscount  = inv.discount > 0;
  renderDetailModal();
  openModal('modal-historial-detail');
}

function renderDetailModal() {
  const inv = window._editInvoice;
  const subtotal = inv.items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = window._editDiscount ? +(subtotal * 0.05).toFixed(2) : 0;
  const total    = +(subtotal - discount).toFixed(2);
  inv.subtotal = subtotal; inv.discount = discount; inv.total = total;
  const pagoActual = inv.metodoPago || '';

  let linesHtml = '';
  inv.items.forEach((item, idx) => {
    const lineTotal = item.price * item.qty;
    const optText   = item.option ? ` (${item.option})` : '';
    linesHtml += `
      <div class="invoice-line edit-line">
        <div class="edit-line-left">
          <span class="invoice-line-name">${item.name}${optText}</span>
          <span class="invoice-line-price">${formatPrice(lineTotal)}</span>
        </div>
        <div class="edit-line-controls">
          <button class="edit-qty-btn" onclick="editQty(${idx},-1)">−</button>
          <span class="edit-qty-num">×${item.qty}</span>
          <button class="edit-qty-btn" onclick="editQty(${idx},1)">+</button>
          <button class="edit-remove-btn" onclick="editRemove(${idx})">✕</button>
        </div>
      </div>`;
  });

  document.getElementById('historial-detail-content').innerHTML = `
    <div class="invoice-header">
      <div class="invoice-title">✦ Cafecito o Miedo ✦</div>
      <div class="invoice-sub">Editar Factura</div>
      <div class="invoice-date">${formatDateTime(new Date(inv.date))}</div>
    </div>
    ${linesHtml}
    <button class="btn-add-item" onclick="openAddItemModal()">+ Agregar item</button>
    ${discount > 0 ? `<div class="invoice-discount"><span>Descuento 5% ✦ redes</span><span>− ${formatPrice(discount)}</span></div>` : ''}
    <div class="edit-discount-row">
      <label class="edit-discount-label">
        <input type="checkbox" id="edit-discount-check" ${window._editDiscount ? 'checked' : ''} onchange="toggleEditDiscount()">
        Descuento 5% redes sociales
      </label>
    </div>
    <div class="invoice-total-row">
      <span class="invoice-total-label">Total</span>
      <span class="invoice-total-amount">${formatPrice(total)}</span>
    </div>
    <div class="pago-selector-titulo">¿Cómo pagó?</div>
    <div class="pago-selector">
      <button class="btn-pago-selector ${pagoActual === 'efectivo' ? 'activo' : ''}" id="btn-pago-efectivo">💵 Efectivo</button>
      <button class="btn-pago-selector ${pagoActual === 'transferencia' ? 'activo' : ''}" id="btn-pago-transferencia">📲 Transferencia</button>
    </div>
    ${pagoActual ? `<div class="pago-registrado">✦ Pago: <strong>${pagoActual}</strong></div>` : '<div class="pago-pendiente">⚠ Pago no registrado</div>'}
    <div class="edit-save-row">
      <button class="btn-gold" onclick="guardarEdicion()">✦ Guardar cambios</button>
    </div>`;

  document.getElementById('btn-pago-efectivo').onclick    = () => registrarPago(window._editInvoiceId, 'efectivo');
  document.getElementById('btn-pago-transferencia').onclick = () => registrarPago(window._editInvoiceId, 'transferencia');
}

function editQty(idx, delta) {
  const item = window._editInvoice.items[idx];
  const newQty = item.qty + delta;
  if (newQty < 1) return;
  const options = ITEM_OPTIONS[item.name];
  if (delta > 0 && options) {
    openOptionModal(null, item.name, options, (opt) => {
      item.qty += 1;
      if (!item.options) item.options = [item.option || opt];
      item.options.push(opt);
      const baseP = item.basePrice || item.price;
      item.basePrice = baseP;
      const totalP = item.options.reduce((s, o) => s + (o.startsWith('Frío') && FRIO_RECARGO.includes(item.name) ? baseP + 1 : baseP), 0);
      item.price = totalP / item.qty;
      item.option = getOpcionesResumen(item.options);
      renderDetailModal();
    });
  } else {
    item.qty = newQty;
    if (item.options && newQty < item.options.length) item.options = item.options.slice(0, newQty);
    renderDetailModal();
  }
}

function editRemove(idx) { window._editInvoice.items.splice(idx, 1); renderDetailModal(); }

function toggleEditDiscount() {
  window._editDiscount = document.getElementById('edit-discount-check').checked;
  renderDetailModal();
}

function openAddItemModal() {
  const container = document.getElementById('add-item-list');
  container.innerHTML = '';
  ALL_ITEMS.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'btn-add-item-option';
    btn.innerHTML = `<span>${item.name}</span><span class="add-item-price">${formatPrice(item.price)}</span>`;
    btn.onclick = () => {
      closeModal('modal-add-item');
      const options = ITEM_OPTIONS[item.name];
      if (options) {
        openOptionModal(null, item.name, options, (opt) => {
          const esFrio = opt.startsWith('Frío') && FRIO_RECARGO.includes(item.name);
          const finalPrice = esFrio ? item.price + 1 : item.price;
          window._editInvoice.items.push({ name: item.name, price: finalPrice, qty: 1, option: opt.replace(' (+$1.000)', ''), options: [opt], basePrice: item.price });
          renderDetailModal();
        });
      } else {
        window._editInvoice.items.push({ name: item.name, price: item.price, qty: 1, option: null, options: [], basePrice: item.price });
        renderDetailModal();
      }
    };
    container.appendChild(btn);
  });
  openModal('modal-add-item');
}

async function guardarEdicion() {
  const inv = window._editInvoice;
  try {
    await updateFacturaItems(window._editInvoiceId, inv.items, inv.subtotal, inv.discount, inv.total);
    closeModal('modal-historial-detail');
    await renderHistorial();
  } catch (e) { alert('Error al guardar los cambios'); }
}

async function registrarPago(id, metodoPago) {
  try {
    await updateFacturaPago(String(id), metodoPago);
    if (window._editInvoice) window._editInvoice.metodoPago = metodoPago;
    renderDetailModal();
    await renderHistorial();
  } catch (e) { alert('Error al registrar el pago'); }
}

async function eliminarFactura(id) {
  if (!confirm('¿Seguro que deseas eliminar esta factura?')) return;
  try { if (await deleteFactura(id)) renderHistorial(); }
  catch (e) { alert('Error al eliminar la factura'); }
}

function buildLinesHtml(items) {
  let subtotal = 0, linesHtml = '';
  items.forEach(item => {
    const lineTotal = item.price * item.qty;
    subtotal += lineTotal;
    const optHtml = item.option ? `<span class="invoice-line-option">(${item.option})</span>` : '';
    linesHtml += `<div class="invoice-line"><span class="invoice-line-name">${item.name}${optHtml}</span><span class="invoice-line-qty">×${item.qty}</span><span class="invoice-line-price">${formatPrice(lineTotal)}</span></div>`;
  });
  return { linesHtml, subtotal };
}

function formatPrice(val) {
  return '$' + Math.round(parseFloat(val) * 1000).toLocaleString('es-CO');
}

function formatDateTime(date) {
  return date.toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    + ' — ' + date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
}

function openModal(id) { document.getElementById(id).classList.add('open'); document.body.style.overflow = 'hidden'; }
function closeModal(id) { document.getElementById(id).classList.remove('open'); document.body.style.overflow = ''; }

function initModalCloseOnOverlay() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => { if (e.target === overlay) closeModal(overlay.id); });
  });
}

function initSwipe() {
  let startX = 0;
  document.addEventListener('touchstart', e => { startX = e.changedTouches[0].screenX; }, { passive: true });
  document.addEventListener('touchend', e => {
    const diff = startX - e.changedTouches[0].screenX;
    if (Math.abs(diff) < 50) return;
    const active = document.querySelector('.tab.active');
    if (!active) return;
    const sib = diff > 0 ? active.nextElementSibling : active.previousElementSibling;
    if (sib && sib.classList.contains('tab')) sib.click();
  }, { passive: true });
}

function filterAddItems(query) {
  const q = query.toLowerCase();
  document.querySelectorAll(".btn-add-item-option").forEach(btn => {
    btn.style.display = btn.querySelector("span").textContent.toLowerCase().includes(q) ? "" : "none";
  });
}
