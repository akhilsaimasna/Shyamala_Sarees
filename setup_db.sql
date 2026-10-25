-- Create the products table
create table products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  slug text not null unique,
  price_inr numeric not null,
  price_usd numeric not null,
  category text not null,
  description text not null,
  images text[] not null,
  in_stock boolean default true,
  featured boolean default false,
  best_seller boolean default false
);

-- Enable Row Level Security (RLS)
alter table products enable row level security;

-- Create a policy that allows anyone to read products
create policy "Public products are viewable by everyone"
  on products for select
  using ( true );

-- Writes require a trusted administrator claim set through the Auth Admin API.
create policy "Store admins insert products" on products for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'role'='admin');
create policy "Store admins update products" on products for update to authenticated
  using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'role'='admin')
  with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'role'='admin');
create policy "Store admins delete products" on products for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'role'='admin');
revoke all on products from public,anon,authenticated;
grant select on products to anon;
grant select,insert,update,delete on products to authenticated;

-- Insert Dummy Data
insert into products (name, slug, price_inr, price_usd, category, description, images, in_stock, featured, best_seller)
values
  (
    'Royal Blue Kanjivaram Silk Saree',
    'royal-blue-kanjivaram-silk',
    12500,
    150,
    'Silk',
    'A magnificent royal blue Kanjivaram silk saree with intricate gold zari border. Perfect for weddings and grand occasions.',
    ARRAY['https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop'],
    true,
    true,
    false
  ),
  (
    'Classic Pink Banarasi Silk',
    'classic-pink-banarasi',
    8500,
    105,
    'Silk',
    'Authentic Banarasi silk saree in a soft pink shade with floral silver zari motifs. Elegant and timeless.',
    ARRAY['https://images.unsplash.com/photo-1583391725988-64305c218a6b?q=80&w=800&auto=format&fit=crop'],
    true,
    true,
    false
  ),
  (
    'Emerald Green Georgette Saree',
    'emerald-green-georgette',
    4500,
    55,
    'Party Wear',
    'Lightweight emerald green georgette saree with sequin work. Ideal for evening parties and receptions.',
    ARRAY['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?q=80&w=800&auto=format&fit=crop'],
    true,
    false,
    false
  ),
  (
    'Red Bridal Lehenga Saree',
    'red-bridal-lehenga-saree',
    25000,
    300,
    'Bridal',
    'Heavy bridal saree in rich red with elaborate zardosi embroidery. The ultimate choice for your special day.',
    ARRAY['https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800&auto=format&fit=crop'],
    true,
    true,
    true
  ),
  (
    'Handloom Cotton Ikat Saree',
    'handloom-cotton-ikat',
    3200,
    40,
    'Cotton',
    'Pure handloom cotton saree featuring traditional Ikat patterns. Comfortable and stylish for daily wear or office.',
    ARRAY['https://images.unsplash.com/photo-1609357606029-28f585808536?q=80&w=800&auto=format&fit=crop'],
    true,
    false,
    true
  ),
  (
    'Lavender Organza Floral Saree',
    'lavender-organza-floral',
    5500,
    68,
    'Party Wear',
    'Dreamy lavender organza saree with delicate hand-painted floral designs. A modern classic.',
    ARRAY['https://images.unsplash.com/photo-1610030469668-96558587371f?q=80&w=800&auto=format&fit=crop'],
    false,
    false,
    false
  );
