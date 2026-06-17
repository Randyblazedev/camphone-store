// ============================================
// CamPhone Store - Cart Page
// ============================================

function renderCartPage() {
  const container = document.getElementById('cart-items');
  const summaryEl = document.getElementById('cart-summary');
  const emptyEl = document.getElementById('cart-empty');
  const items = Cart.getItems();

  if (items.length === 0) {
    container.parentElement.style.display = 'none';
    summaryEl.style.display = 'none';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';
  container.parentElement.style.display = 'block';
  summaryEl.style.display = 'block';

  renderCartItems(items);
  renderCartSummary();
}

function renderCartItems(items) {
  const container = document.getElementById('cart-items');

  container.innerHTML = items.map(item => `
    <div class="flex items-center gap-4 p-4 bg-slate-800/30 rounded-xl border border-slate-700/50 mb-3" data-id="${item.id}">
      <img src="${item.image || 'images/phone-placeholder.svg'}" alt="${item.name}" class="w-20 h-20 object-contain rounded-lg bg-slate-800 p-2 flex-shrink-0">
      <div class="flex-1 min-w-0">
        <h3 class="font-bold text-sm md:text-base truncate">${item.name}</h3>
        <p class="text-xs text-slate-400">${item.brand || ''}</p>
        <p class="price-tag text-sm mt-1">${formatPrice(item.price)} XAF</p>
      </div>
      <div class="flex items-center gap-2 flex-shrink-0">
        <button onclick="changeQty('${item.id}', -1)" class="qty-btn">−</button>
        <span class="w-8 text-center font-bold">${item.quantity}</span>
        <button onclick="changeQty('${item.id}', 1)" class="qty-btn">+</button>
      </div>
      <div class="text-right flex-shrink-0 hidden md:block">
        <p class="font-bold">${formatPrice(item.price * item.quantity)} XAF</p>
      </div>
      <button onclick="removeCartItem('${item.id}')" class="text-slate-500 hover:text-red-400 transition-colors flex-shrink-0 p-1" title="Remove">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
      </button>
    </div>
  `).join('');
}

function renderCartSummary() {
  const summaryEl = document.getElementById('cart-summary');
  const items = Cart.getItems();
  const subtotal = Cart.getTotal();
  const count = Cart.getCount();

  summaryEl.innerHTML = `
    <div class="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6 sticky top-24">
      <h2 class="text-xl font-bold mb-4">Order Summary</h2>
      <div class="space-y-3 mb-4">
        ${items.map(item => `
          <div class="flex justify-between text-sm">
            <span class="text-slate-400 truncate mr-2">${item.name} × ${item.quantity}</span>
            <span class="font-semibold">${formatPrice(item.price * item.quantity)} XAF</span>
          </div>
        `).join('')}
      </div>
      <div class="border-t border-slate-700 pt-4 mb-6">
        <div class="flex justify-between">
          <span class="font-bold text-lg">Total (${count} items)</span>
          <span class="price-tag-lg">${formatPrice(subtotal)} <span class="text-sm font-normal text-slate-400">XAF</span></span>
        </div>
      </div>
      <a href="checkout.html" class="btn-whatsapp w-full justify-center text-lg py-3 mb-3">
        ✅ Proceed to Checkout
      </a>
      <a href="index.html" class="btn-outline w-full justify-center text-sm">
        ← Continue Shopping
      </a>
    </div>
  `;
}

function changeQty(id, delta) {
  const items = Cart.getItems();
  const item = items.find(i => i.id === id);
  if (!item) return;

  Cart.updateQuantity(id, item.quantity + delta);
  renderCartPage();
}

function removeCartItem(id) {
  const items = Cart.getItems();
  const item = items.find(i => i.id === id);
  Cart.removeItem(id);
  if (item) showToast(`🗑️ ${item.name} removed from cart`);
  renderCartPage();
}

document.addEventListener('DOMContentLoaded', renderCartPage);
