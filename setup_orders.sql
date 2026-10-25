-- Create orders table
create table if not exists orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id text not null, -- Storing product ID or Name
  product_name text not null,
  price numeric not null,
  status text default 'clicked_whatsapp',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table orders enable row level security;

-- Policy: Users can view their own orders
create policy "Users can view own orders"
  on orders for select to authenticated
  using ( auth.uid() = user_id );

-- Policy: Users can insert their own orders
create policy "Users can insert own orders"
  on orders for insert to authenticated
  with check ( (select auth.uid()) = user_id and status='clicked_whatsapp' and exists (
    select 1 from public.products p where p.id::text=product_id and p.name=product_name and p.price_inr=price
  ));

-- Enquiries are not trusted paid orders. Payment/order confirmation needs a server-verified flow.
revoke all on orders from public,anon,authenticated;
grant select,insert on orders to authenticated;
