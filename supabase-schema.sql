-- ============================================
-- CamPhone Store - Supabase Database Schema
-- ============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PHONES TABLE
-- ============================================
create table if not exists phones (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand text not null,
  storage text not null,
  ram text not null,
  battery text not null,
  condition text not null check (condition in ('new', 'used')),
  description text,
  price integer not null,
  image_url text,
  badge text default 'available' check (badge in ('available', 'out_of_stock', 'promo')),
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  phone_number text not null,
  location text not null,
  items jsonb not null,
  total integer not null,
  status text default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_phones_brand on phones(brand);
create index if not exists idx_phones_condition on phones(condition);
create index if not exists idx_phones_badge on phones(badge);
create index if not exists idx_phones_is_active on phones(is_active);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at desc);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger phones_updated_at
  before update on phones
  for each row
  execute function update_updated_at();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table phones enable row level security;
alter table orders enable row level security;

-- Public can read active phones
create policy "Public can view active phones"
  on phones for select
  using (is_active = true);

-- Admins can do everything with phones
create policy "Admins full access to phones"
  on phones for all
  using (auth.role() = 'authenticated');

-- Public can insert orders (for checkout)
create policy "Anyone can create orders"
  on orders for insert
  with check (true);

-- Admins can read/update all orders
create policy "Admins can manage orders"
  on orders for all
  using (auth.role() = 'authenticated');

-- ============================================
-- STORAGE BUCKET (run in Supabase dashboard)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('phone-images', 'phone-images', true);

-- Storage policy: public read
-- create policy "Public read access"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'phone-images');

-- Storage policy: authenticated write
-- create policy "Authenticated upload"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'phone-images' AND auth.role() = 'authenticated');

-- ============================================
-- SAMPLE DATA
-- ============================================
insert into phones (name, brand, storage, ram, battery, condition, description, price, badge, is_active) values
('iPhone 15 Pro Max', 'Apple', '256GB', '8GB', '4441mAh', 'new', 'The latest iPhone with A17 Pro chip, titanium design, and pro camera system. Perfect for those who want the best.', 850000, 'promo', true),
('Samsung Galaxy S24 Ultra', 'Samsung', '512GB', '12GB', '5000mAh', 'new', 'Samsung flagship with S Pen, AI features, and stunning 200MP camera. The ultimate Android experience.', 750000, 'available', true),
('iPhone 13', 'Apple', '128GB', '4GB', '3240mAh', 'used', 'Excellent condition iPhone 13. Battery health at 92%. Comes with original charger.', 320000, 'available', true),
('Samsung Galaxy A54', 'Samsung', '128GB', '8GB', '5000mAh', 'new', 'Mid-range champion with great camera, AMOLED display, and all-day battery life.', 280000, 'available', true),
('Tecno Spark 20 Pro+', 'Tecno', '256GB', '8GB', '5000mAh', 'new', 'Premium mid-range with 108MP camera and elegant design. Great value for money.', 185000, 'promo', true),
('Infinix Hot 40 Pro', 'Infinix', '256GB', '8GB', '5000mAh', 'new', 'Big screen, big battery, big storage. Perfect for entertainment and social media.', 145000, 'available', true),
('iPhone 12 Pro', 'Apple', '128GB', '6GB', '2815mAh', 'used', 'Well-maintained iPhone 12 Pro in Pacific Blue. Battery health at 88%.', 280000, 'available', true),
('Samsung Galaxy Z Fold 5', 'Samsung', '512GB', '12GB', '4400mAh', 'new', 'Foldable future in your pocket. Massive screen for multitasking and productivity.', 950000, 'promo', true),
('Tecno Camon 20', 'Tecno', '256GB', '8GB', '5000mAh', 'new', 'Camera king in the budget segment. Take stunning photos day and night.', 165000, 'available', true),
('Huawei P60 Pro', 'Huawei', '256GB', '12GB', '4815mAh', 'new', 'XMAGE camera excellence with beautiful design. The photographer''s choice.', 520000, 'out_of_stock', false);
