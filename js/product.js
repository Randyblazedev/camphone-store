// ============================================
// CamPhone Store - Product Detail Page
// ============================================

async function initProductPage() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const container = document.getElementById('product-detail');
  const relatedContainer = document.getElementById('related-phones');

  if (!id) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❓</div>
        <h2 class="text-xl font-bold mb-2">Product Not Found</h2>
        <p class="text-slate-400 mb-4">The phone you're looking for doesn't exist.</p>
        <a href="index.html" class="btn-primary">← Back to Shop</a>
      </div>`;
    return;
  }

  // Show skeleton
  container.innerHTML = `
    <div class="grid md:grid-cols-2 gap-8">
      <div class="skeleton h-96 rounded-2xl"></div>
      <div class="space-y-4">
        <div class="skeleton h-8 w-3/4 rounded"></div>
        <div class="skeleton h-4 w-1/2 rounded"></div>
        <div class="skeleton h-12 w-1/3 rounded"></div>
        <div class="skeleton h-24 rounded"></div>
      </div>
    </div>`;

  const phone = await fetchPhoneById(id);

  if (!phone) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📱</div>
        <h2 class="text-xl font-bold mb-2">Phone Not Found</h2>
        <p class="text-slate-400 mb-4">This product may have been removed or is no longer available.</p>
        <a href="index.html" class="btn-primary">← Back to Shop</a>
      </div>`;
    return;
  }

  const badgeClass = phone.condition === 'new' ? 'badge-new' : 'badge-used';
  const badgeText = phone.condition === 'new' ? 'New' : 'Used';
  const promoHtml = phone.badge === 'promo' ? '<span class="badge-promo text-sm px-3 py-1 rounded-full font-bold" style="animation:pulse 2s infinite">🔥 PROMO</span>' : '';
  const stockBadge = phone.badge === 'out_of_stock'
    ? '<span class="badge-out_of_stock text-sm px-3 py-1 rounded-full font-bold">Out of Stock</span>'
    : `<span class="${badgeClass} text-sm px-3 py-1 rounded-full font-bold">${badgeText}</span>`;

  container.innerHTML = `
    <div class="grid md:grid-cols-2 gap-8 page-enter">
      <div class="aos-left">
        <div class="bg-slate-800/50 rounded-2xl p-8 flex items-center justify-center relative" style="min-height: 400px">
          <img src="${phone.image_url || 'images/phone-placeholder.svg'}" alt="${phone.name}" class="max-h-80 object-contain">
          <div class="absolute top-4 right-4 flex gap-2">
            ${promoHtml}
            ${stockBadge}
          </div>
        </div>
      </div>
      <div class="aos-right">
        <p class="text-blue-400 font-semibold mb-1">${phone.brand}</p>
        <h1 class="text-3xl md:text-4xl font-extrabold mb-4">${phone.name}</h1>

        <div class="price-tag-lg mb-6">${formatPrice(phone.price)} <span class="text-lg font-normal text-slate-400">XAF</span></div>

        <div class="grid grid-cols-3 gap-3 mb-6">
          <div class="bg-slate-800/50 rounded-xl p-3 text-center">
            <div class="text-2xl mb-1">💾</div>
            <div class="text-xs text-slate-400">Storage</div>
            <div class="font-bold">${phone.storage}</div>
          </div>
          <div class="bg-slate-800/50 rounded-xl p-3 text-center">
            <div class="text-2xl mb-1">⚡</div>
            <div class="text-xs text-slate-400">RAM</div>
            <div class="font-bold">${phone.ram}</div>
          </div>
          <div class="bg-slate-800/50 rounded-xl p-3 text-center">
            <div class="text-2xl mb-1">🔋</div>
            <div class="text-xs text-slate-400">Battery</div>
            <div class="font-bold">${phone.battery}</div>
          </div>
        </div>

        <div class="mb-6">
          <h3 class="font-bold text-lg mb-2">Description</h3>
          <p class="text-slate-300 leading-relaxed">${phone.description || 'No description available.'}</p>
        </div>

        <div class="flex flex-wrap gap-3">
          ${phone.badge !== 'out_of_stock' ? `
            <button onclick='buyOnWhatsApp(${JSON.stringify(phone).replace(/'/g, "&#39;")})' class="btn-whatsapp text-lg px-8 py-3">
              🛒 Buy on WhatsApp
            </button>
            <button onclick='addToCartFromDetail(${JSON.stringify(phone).replace(/'/g, "&#39;")})' class="btn-primary text-lg px-8 py-3">
              🛍️ Add to Cart
            </button>
          ` : `
            <button disabled class="btn-outline opacity-50 cursor-not-allowed text-lg px-8 py-3">
              Out of Stock
            </button>
          `}
        </div>
      </div>
    </div>`;

  // Load related phones
  if (relatedContainer) {
    const related = await fetchRelatedPhones(phone, 4);
    if (related.length > 0) {
      relatedContainer.innerHTML = related.map((p, i) => renderPhoneCard(p, i)).join('');
      setTimeout(initScrollAnimations, 100);
    } else {
      relatedContainer.closest('section').style.display = 'none';
    }
  }
}

function addToCartFromDetail(phone) {
  Cart.addItem(phone);
}

document.addEventListener('DOMContentLoaded', initProductPage);
