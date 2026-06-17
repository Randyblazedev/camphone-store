// ============================================
// CamPhone Store - Checkout Page
// ============================================

function renderCheckout() {
  const items = Cart.getItems();
  const summaryEl = document.getElementById('checkout-summary');
  const emptyEl = document.getElementById('checkout-empty');
  const formEl = document.getElementById('checkout-form');

  if (items.length === 0) {
    formEl.style.display = 'none';
    summaryEl.style.display = 'none';
    emptyEl.style.display = 'block';
    return;
  }

  emptyEl.style.display = 'none';
  formEl.style.display = 'block';
  summaryEl.style.display = 'block';

  renderSummarySidebar(items);
}

function renderSummarySidebar(items) {
  const el = document.getElementById('checkout-summary');
  const total = Cart.getTotal();
  const count = Cart.getCount();

  el.innerHTML = `
    <div class="bg-slate-800/30 rounded-2xl border border-slate-700/50 p-6 sticky top-24">
      <h2 class="text-xl font-bold mb-4">Your Order</h2>
      <div class="space-y-3 mb-4">
        ${items.map(item => `
          <div class="flex items-center gap-3">
            <img src="${item.image || 'images/phone-placeholder.svg'}" alt="${item.name}" class="w-12 h-12 object-contain rounded-lg bg-slate-800 p-1">
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold truncate">${item.name}</p>
              <p class="text-xs text-slate-400">Qty: ${item.quantity}</p>
            </div>
            <span class="text-sm font-bold">${formatPrice(item.price * item.quantity)} XAF</span>
          </div>
        `).join('')}
      </div>
      <div class="border-t border-slate-700 pt-4">
        <div class="flex justify-between">
          <span class="font-bold text-lg">Total</span>
          <span class="price-tag-lg">${formatPrice(total)} <span class="text-sm font-normal text-slate-400">XAF</span></span>
        </div>
      </div>
    </div>
  `;
}

function handleCheckout(e) {
  e.preventDefault();

  const name = document.getElementById('customer-name').value.trim();
  const phone = document.getElementById('customer-phone').value.trim();
  const location = document.getElementById('customer-location').value.trim();

  if (!name || !phone || !location) {
    showToast('⚠️ Please fill in all fields', 'error');
    return;
  }

  const items = Cart.getItems();
  if (items.length === 0) {
    showToast('⚠️ Your cart is empty', 'error');
    return;
  }

  const total = Cart.getTotal();

  // Build WhatsApp message
  let msg = `📱 NEW ORDER - ${SELLER_NAME}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `👤 Customer: ${name}\n`;
  msg += `📞 Phone: ${phone}\n`;
  msg += `📍 Location: ${location}\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `📦 Items:\n`;

  items.forEach((item, i) => {
    msg += `${i + 1}. ${item.name} - ${item.quantity}x ${formatPrice(item.price)} XAF\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━━\n`;
  msg += `💰 Total: ${formatPrice(total)} XAF\n`;
  msg += `━━━━━━━━━━━━━━━━━━━━━`;

  // Save order to Supabase if available
  saveOrder(name, phone, location, items, total);

  // Open WhatsApp
  openWhatsApp(msg);

  // Clear cart and show success
  Cart.clear();
  showToast('🎉 Order sent via WhatsApp!');

  setTimeout(() => {
    window.location.href = 'index.html';
  }, 2000);
}

async function saveOrder(name, phone, location, items, total) {
  if (supabase) {
    await supabase.from('orders').insert({
      customer_name: name,
      phone_number: phone,
      location: location,
      items: items,
      total: total,
      status: 'pending'
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  renderCheckout();

  const form = document.getElementById('checkout-form-content');
  if (form) {
    form.addEventListener('submit', handleCheckout);
  }
});
