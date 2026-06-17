// ============================================
// CamPhone Store - Supabase Configuration
// ============================================
// Replace these values with your Supabase project credentials

const SUPABASE_URL = 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key-here';

// WhatsApp seller number (international format without +)
const WHATSAPP_NUMBER = '237600000000';

// Initialize Supabase client
const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// ============================================
// FALLBACK: Local demo data
// ============================================
const DEMO_PHONES = [
  {
    id: 'demo-1',
    name: 'iPhone 15 Pro Max',
    brand: 'Apple',
    storage: '256GB',
    ram: '8GB',
    battery: '4441mAh',
    condition: 'new',
    description: 'The latest iPhone with A17 Pro chip, titanium design, and pro camera system. Perfect for those who want the best.',
    price: 850000,
    image_url: 'images/phone-placeholder.svg',
    badge: 'promo',
    is_active: true
  },
  {
    id: 'demo-2',
    name: 'Samsung Galaxy S24 Ultra',
    brand: 'Samsung',
    storage: '512GB',
    ram: '12GB',
    battery: '5000mAh',
    condition: 'new',
    description: 'Samsung flagship with S Pen, AI features, and stunning 200MP camera.',
    price: 750000,
    image_url: 'images/phone-placeholder.svg',
    badge: 'available',
    is_active: true
  },
  {
    id: 'demo-3',
    name: 'iPhone 13',
    brand: 'Apple',
    storage: '128GB',
    ram: '4GB',
    battery: '3240mAh',
    condition: 'used',
    description: 'Excellent condition iPhone 13. Battery health at 92%. Comes with original charger.',
    price: 320000,
    image_url: 'images/phone-placeholder.svg',
    badge: 'available',
    is_active: true
  },
  {
    id: 'demo-4',
    name: 'Samsung Galaxy A54',
    brand: 'Samsung',
    storage: '128GB',
    ram: '8GB',
    battery: '5000mAh',
    condition: 'new',
    description: 'Mid-range champion with great camera, AMOLED display, and all-day battery life.',
    price: 280000,
    image_url: 'images/phone-placeholder.svg',
    badge: 'available',
    is_active: true
  },
  {
    id: 'demo-5',
    name: 'Tecno Spark 20 Pro+',
    brand: 'Tecno',
    storage: '256GB',
    ram: '8GB',
    battery: '5000mAh',
    condition: 'new',
    description: 'Premium mid-range with 108MP camera and elegant design.',
    price: 185000,
    image_url: 'images/phone-placeholder.svg',
    badge: 'promo',
    is_active: true
  },
  {
    id: 'demo-6',
    name: 'Infinix Hot 40 Pro',
    brand: 'Infinix',
    storage: '256GB',
    ram: '8GB',
    battery: '5000mAh',
    condition: 'new',
    description: 'Big screen, big battery, big storage. Perfect for entertainment.',
    price: 145000,
    image_url: 'images/phone-placeholder.svg',
    badge: 'available',
    is_active: true
  },
  {
    id: 'demo-7',
    name: 'iPhone 12 Pro',
    brand: 'Apple',
    storage: '128GB',
    ram: '6GB',
    battery: '2815mAh',
    condition: 'used',
    description: 'Well-maintained iPhone 12 Pro in Pacific Blue. Battery health at 88%.',
    price: 280000,
    image_url: 'images/phone-placeholder.svg',
    badge: 'available',
    is_active: true
  },
  {
    id: 'demo-8',
    name: 'Samsung Galaxy Z Fold 5',
    brand: 'Samsung',
    storage: '512GB',
    ram: '12GB',
    battery: '4400mAh',
    condition: 'new',
    description: 'Foldable future in your pocket. Massive screen for multitasking.',
    price: 950000,
    image_url: 'images/phone-placeholder.svg',
    badge: 'promo',
    is_active: true
  },
  {
    id: 'demo-9',
    name: 'Tecno Camon 20',
    brand: 'Tecno',
    storage: '256GB',
    ram: '8GB',
    battery: '5000mAh',
    condition: 'new',
    description: 'Camera king in the budget segment. Take stunning photos day and night.',
    price: 165000,
    image_url: 'images/phone-placeholder.svg',
    badge: 'available',
    is_active: true
  }
];

const SELLER_NAME = 'CamPhone Store';
