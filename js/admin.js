// ============================================
// CamPhone Store - Admin Dashboard
// ============================================

let currentTab = 'phones';
let editingPhoneId = null;

// ============================================
// Login
// ============================================
async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('admin-email').value.trim();
  const password = document.getElementById('admin-password').value.trim();
  const errEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  btn.disabled = true;
  btn.textContent = 'Signing in...';
  errEl.textContent = '';

  const result = await Auth.signIn(email, password);

  if (result.success) {
    showDashboard();
  } else {
    errEl.textContent = result.error;
  }

  btn.disabled = false;
  btn.textContent = 'Sign In';
}

// ============================================
// Dashboard
// ============================================
function showDashboard() {
  document.getElementById('login-section').style.display = 'none';
  document.getElementById('dashboard-section').style.display = 'block';
  loadDashboardStats();
  loadPhones();
}

async function handleLogout() {
  await Auth.signOut();
  document.getElementById('login-section').style.display = 'block';
  document.getElementById('dashboard-section').style.display = 'none';
}

// ============================================
// Stats
// ============================================
async function loadDashboardStats() {
  const phones = await fetchPhones();
  const allPhones = supabase ? phones : DEMO_PHONES;

  const total = allPhones.length;
  const available = allPhones.filter(p => p.badge !== 'out_of_stock').length;
  const outOfStock = allPhones.filter(p => p.badge === 'out_of_stock').length;

  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-available').textContent = available;
  document.getElementById('stat-outofstock').textContent = outOfStock;

  // Orders count
  if (supabase) {
    const { count } = await supabase.from('orders').select('*', { count: 'exact', head: true });
    document.getElementById('stat-orders').textContent = count || 0;
  } else {
    document.getElementById('stat-orders').textContent = '—';
  }
}

// ============================================
// Tab Navigation
// ============================================
function switchTab(tab) {
  currentTab = tab;
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

  document.getElementById('phones-tab').style.display = tab === 'phones' ? 'block' : 'none';
  document.getElementById('orders-tab').style.display = tab === 'orders' ? 'block' : 'none';
  document.getElementById('add-phone-tab').style.display = tab === 'add' ? 'block' : 'none';

  if (tab === 'phones') loadPhones();
  if (tab === 'orders') loadOrders();
  if (tab === 'add') {
    editingPhoneId = null;
    document.getElementById('form-title').textContent = 'Add New Phone';
    document.getElementById('phone-form').reset();
    document.getElementById('phone-id-field').value = '';
  }
}

// ============================================
// Phone Management
// ============================================
async function loadPhones() {
  const tbody = document.getElementById('phones-tbody');
  const phones = await fetchPhones();
  const allPhones = supabase ? phones : DEMO_PHONES;

  tbody.innerHTML = allPhones.map(phone => `
    <tr>
      <td>
        <div class="flex items-center gap-3">
          <img src="${phone.image_url || 'images/phone-placeholder.svg'}" alt="${phone.name}" class="w-10 h-10 object-contain rounded bg-slate-800 p-1">
          <div>
            <div class="font-semibold text-sm">${phone.name}</div>
            <div class="text-xs text-slate-400">${phone.brand}</div>
          </div>
        </div>
      </td>
      <td>${phone.storage}</td>
      <td>${phone.ram}</td>
      <td><span class="price-tag text-sm">${formatPrice(phone.price)} XAF</span></td>
      <td>
        <span class="px-2 py-1 rounded-full text-xs font-bold ${
          phone.condition === 'new' ? 'badge-new' : 'badge-used'
        }">${phone.condition === 'new' ? 'New' : 'Used'}</span>
      </td>
      <td>
        <span class="px-2 py-1 rounded-full text-xs font-bold ${
          phone.badge === 'promo' ? 'badge-promo' :
          phone.badge === 'out_of_stock' ? 'badge-out_of_stock' :
          'badge-available'
        }">${phone.badge === 'promo' ? 'Promo' : phone.badge === 'out_of_stock' ? 'Out of Stock' : 'Available'}</span>
      </td>
      <td>
        <div class="flex gap-1">
          <button onclick="editPhone('${phone.id}')" class="text-blue-400 hover:text-blue-300 p-1 transition-colors" title="Edit">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onclick="deletePhone('${phone.id}', '${phone.name.replace(/'/g, "\\'")}')" class="text-red-400 hover:text-red-300 p-1 transition-colors" title="Delete">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  if (allPhones.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-400">No phones found</td></tr>';
  }
}

function editPhone(id) {
  const phones = DEMO_PHONES; // or fetch from state
  const phone = phones.find(p => p.id === id);
  if (!phone) return;

  editingPhoneId = id;
  document.getElementById('form-title').textContent = 'Edit Phone';
  document.getElementById('phone-id-field').value = id;
  document.getElementById('phone-name').value = phone.name;
  document.getElementById('phone-brand').value = phone.brand;
  document.getElementById('phone-storage').value = phone.storage;
  document.getElementById('phone-ram').value = phone.ram;
  document.getElementById('phone-battery').value = phone.battery;
  document.getElementById('phone-condition').value = phone.condition;
  document.getElementById('phone-price').value = phone.price;
  document.getElementById('phone-badge').value = phone.badge;
  document.getElementById('phone-description').value = phone.description || '';

  switchTab('add');
}

async function deletePhone(id, name) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;

  if (supabase) {
    const { error } = await supabase.from('phones').delete().eq('id', id);
    if (error) {
      showToast('❌ Failed to delete phone', 'error');
      return;
    }
  } else {
    const idx = DEMO_PHONES.findIndex(p => p.id === id);
    if (idx !== -1) DEMO_PHONES.splice(idx, 1);
  }

  showToast(`🗑️ ${name} deleted`);
  loadPhones();
  loadDashboardStats();
}

// ============================================
// Phone Form Submit
// ============================================
async function handlePhoneForm(e) {
  e.preventDefault();

  const id = document.getElementById('phone-id-field').value;
  const phoneData = {
    name: document.getElementById('phone-name').value.trim(),
    brand: document.getElementById('phone-brand').value.trim(),
    storage: document.getElementById('phone-storage').value.trim(),
    ram: document.getElementById('phone-ram').value.trim(),
    battery: document.getElementById('phone-battery').value.trim(),
    condition: document.getElementById('phone-condition').value,
    price: parseInt(document.getElementById('phone-price').value),
    badge: document.getElementById('phone-badge').value,
    description: document.getElementById('phone-description').value.trim(),
    is_active: true
  };

  // Handle image upload
  const imageFile = document.getElementById('phone-image').files[0];
  if (imageFile && supabase) {
    const fileExt = imageFile.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('phone-images')
      .upload(fileName, imageFile);

    if (!uploadError) {
      const { data: urlData } = supabase.storage.from('phone-images').getPublicUrl(fileName);
      phoneData.image_url = urlData.publicUrl;
    }
  } else if (!imageFile && id) {
    // Keep existing image
    const existing = DEMO_PHONES.find(p => p.id === id);
    if (existing) phoneData.image_url = existing.image_url;
  } else {
    phoneData.image_url = 'images/phone-placeholder.svg';
  }

  if (supabase) {
    if (id) {
      const { error } = await supabase.from('phones').update(phoneData).eq('id', id);
      if (error) { showToast('❌ Failed to update phone', 'error'); return; }
    } else {
      const { error } = await supabase.from('phones').insert(phoneData);
      if (error) { showToast('❌ Failed to add phone', 'error'); return; }
    }
  } else {
    // Demo mode: local state
    if (id) {
      const idx = DEMO_PHONES.findIndex(p => p.id === id);
      if (idx !== -1) DEMO_PHONES[idx] = { ...DEMO_PHONES[idx], ...phoneData };
    } else {
      phoneData.id = 'demo-' + Date.now();
      DEMO_PHONES.push(phoneData);
    }
  }

  showToast(id ? '✅ Phone updated' : '✅ Phone added');
  editingPhoneId = null;
  document.getElementById('phone-form').reset();
  document.getElementById('form-title').textContent = 'Add New Phone';
  switchTab('phones');
  loadDashboardStats();
}

// ============================================
// Orders Management
// ============================================
async function loadOrders() {
  const tbody = document.getElementById('orders-tbody');

  if (!supabase) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-400">Orders require Supabase connection.<br>Connect your Supabase project to view orders.</td></tr>';
    return;
  }

  const { data: orders, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(50);

  if (error) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-red-400">Failed to load orders</td></tr>';
    return;
  }

  if (!orders || orders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-slate-400">No orders yet</td></tr>';
    return;
  }

  tbody.innerHTML = orders.map(order => `
    <tr>
      <td class="text-xs">${new Date(order.created_at).toLocaleDateString('fr-CM')}</td>
      <td>
        <div class="font-semibold text-sm">${order.customer_name}</div>
        <div class="text-xs text-slate-400">${order.phone_number}</div>
      </td>
      <td class="text-xs">${order.location}</td>
      <td><span class="price-tag text-sm">${formatPrice(order.total)} XAF</span></td>
      <td>
        <select onchange="updateOrderStatus('${order.id}', this.value)" class="form-select text-xs py-1 px-2" style="width:auto;min-width:100px;">
          <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
          <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
    </tr>
  `).join('');
}

async function updateOrderStatus(orderId, status) {
  if (!supabase) return;

  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId);
  if (error) {
    showToast('❌ Failed to update order', 'error');
  } else {
    showToast('✅ Order updated');
  }
}

// ============================================
// Init
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) loginForm.addEventListener('submit', handleLogin);

  // Phone form
  const phoneForm = document.getElementById('phone-form');
  if (phoneForm) phoneForm.addEventListener('submit', handlePhoneForm);

  // Check if already logged in
  const isAdmin = await Auth.checkSession();
  if (isAdmin) {
    showDashboard();
  }
});
