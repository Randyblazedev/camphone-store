// ============================================
// CamPhone Store - Cart Management
// ============================================

const CART_KEY = 'camphone_cart';

const Cart = {
  getItems() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  },

  saveItems(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    this.updateBadge();
    window.dispatchEvent(new Event('cart-updated'));
  },

  addItem(phone, quantity = 1) {
    const items = this.getItems();
    const existing = items.find(i => i.id === phone.id);

    if (existing) {
      existing.quantity += quantity;
    } else {
      items.push({
        id: phone.id,
        name: phone.name,
        brand: phone.brand,
        price: phone.price,
        image: phone.image_url || 'images/phone-placeholder.svg',
        quantity: quantity
      });
    }

    this.saveItems(items);
    showToast(`✅ ${phone.name} added to cart`);
  },

  removeItem(phoneId) {
    const items = this.getItems().filter(i => i.id !== phoneId);
    this.saveItems(items);
  },

  updateQuantity(phoneId, qty) {
    const items = this.getItems();
    const item = items.find(i => i.id === phoneId);
    if (!item) return;

    if (qty <= 0) {
      this.removeItem(phoneId);
      return;
    }

    item.quantity = qty;
    this.saveItems(items);
  },

  getTotal() {
    return this.getItems().reduce((sum, item) => sum + (item.price * item.quantity), 0);
  },

  getCount() {
    return this.getItems().reduce((sum, item) => sum + item.quantity, 0);
  },

  clear() {
    localStorage.removeItem(CART_KEY);
    this.updateBadge();
    window.dispatchEvent(new Event('cart-updated'));
  },

  updateBadge() {
    const badges = document.querySelectorAll('.cart-badge');
    const count = this.getCount();
    badges.forEach(badge => {
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  }
};

// ============================================
// Toast Notification System
// ============================================
function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<p style="margin:0;font-weight:500;font-size:0.9rem;">${message}</p>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// WhatsApp Helpers
// ============================================
function openWhatsApp(message) {
  const encoded = encodeURIComponent(message);
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
}

function buyOnWhatsApp(phone) {
  const msg = `Hello! I'm interested in buying ${phone.name} at ${formatPrice(phone.price)} XAF. Is it still available?`;
  openWhatsApp(msg);
}

// ============================================
// Format Helpers
// ============================================
function formatPrice(amount) {
  return new Intl.NumberFormat('fr-CM').format(amount);
}

// ============================================
// Scroll Animations (Intersection Observer)
// ============================================
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.aos, .aos-left, .aos-right, .aos-scale').forEach(el => {
    observer.observe(el);
  });
}

// ============================================
// Navbar scroll behavior
// ============================================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile menu
  const menuBtn = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const overlay = document.getElementById('mobile-overlay');

  if (menuBtn && mobileMenu && overlay) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      overlay.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });

    overlay.addEventListener('click', () => {
      mobileMenu.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  Cart.updateBadge();
}

// ============================================
// Fetch phones (Supabase or demo)
// ============================================
async function fetchPhones(filters = {}) {
  if (supabase) {
    let query = supabase.from('phones').select('*').eq('is_active', true);

    if (filters.brand) query = query.eq('brand', filters.brand);
    if (filters.condition) query = query.eq('condition', filters.condition);
    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,brand.ilike.%${filters.search}%`);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      console.error('Supabase error:', error);
      return filterDemoPhones(filters);
    }
    return data;
  }

  return filterDemoPhones(filters);
}

function filterDemoPhones(filters) {
  let phones = [...DEMO_PHONES];

  if (filters.brand) phones = phones.filter(p => p.brand === filters.brand);
  if (filters.condition) phones = phones.filter(p => p.condition === filters.condition);
  if (filters.search) {
    const q = filters.search.toLowerCase();
    phones = phones.filter(p =>
      p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)
    );
  }

  return phones;
}

async function fetchPhoneById(id) {
  if (supabase) {
    const { data, error } = await supabase.from('phones').select('*').eq('id', id).single();
    if (!error) return data;
  }
  return DEMO_PHONES.find(p => p.id === id) || null;
}

async function fetchRelatedPhones(phone, limit = 4) {
  const all = await fetchPhones({ brand: phone.brand });
  return all.filter(p => p.id !== phone.id).slice(0, limit);
}

// ============================================
// Phone card HTML renderer
// ============================================
function renderPhoneCard(phone, index = 0) {
  const delay = (index % 4) * 100;
  const badgeClass = phone.condition === 'new' ? 'badge-new' : 'badge-used';
  const badgeText = phone.condition === 'new' ? 'New' : 'Used';
  const promoBadge = phone.badge === 'promo' ? '<span class="badge-promo absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-bold" style="animation:pulse 2s infinite">🔥 PROMO</span>' : '';

  return `
    <div class="phone-card aos" style="transition-delay: ${delay}ms">
      <div class="image-wrap">
        <img src="${phone.image_url || 'images/phone-placeholder.svg'}" alt="${phone.name}" loading="lazy">
        ${promoBadge}
        <span class="${badgeClass} absolute top-3 right-3 text-xs px-2 py-1 rounded-full font-bold">${badgeText}</span>
      </div>
      <div class="p-4">
        <h3 class="font-bold text-lg mb-1 line-clamp-1">${phone.name}</h3>
        <p class="text-sm text-slate-400 mb-2">${phone.brand}</p>
        <div class="flex flex-wrap gap-2 mb-3">
          <span class="text-xs bg-slate-700/50 px-2 py-1 rounded-md">💾 ${phone.storage}</span>
          <span class="text-xs bg-slate-700/50 px-2 py-1 rounded-md">⚡ ${phone.ram} RAM</span>
          <span class="text-xs bg-slate-700/50 px-2 py-1 rounded-md">🔋 ${phone.battery}</span>
        </div>
        <div class="price-tag mb-3">${formatPrice(phone.price)} <span class="text-sm font-normal text-slate-400">XAF</span></div>
        <div class="flex gap-2">
          <a href="product.html?id=${phone.id}" class="btn-outline text-sm flex-1 justify-center">View Details</a>
          <button onclick='buyOnWhatsApp(${JSON.stringify(phone).replace(/'/g, "&#39;")})' class="btn-whatsapp text-sm flex-1 justify-center">🛒 Buy Now</button>
        </div>
      </div>
    </div>
  `;
}

// ============================================
// Init on page load
// ============================================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  setTimeout(initScrollAnimations, 100);
});
