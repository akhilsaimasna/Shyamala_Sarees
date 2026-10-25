-- Apply only after the owner has approved their existing Auth account as administrator.
-- Account provisioning is separate; no user is automatically promoted by this migration.
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE raw_app_meta_data->>'role'='admin') THEN
    RAISE EXCEPTION 'Provision an approved administrator before applying storefront access hardening';
  END IF;
END $$;

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Public catalog reads stay available; privileged operations always require a signed admin claim.
REVOKE ALL ON TABLE public.products FROM PUBLIC, anon, authenticated;
GRANT SELECT ON TABLE public.products TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.products TO authenticated;
CREATE POLICY "Store admins insert products" ON public.products FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) IS NOT NULL AND (select auth.jwt())->'app_metadata'->>'role'='admin');
CREATE POLICY "Store admins update products" ON public.products FOR UPDATE TO authenticated
  USING ((select auth.uid()) IS NOT NULL AND (select auth.jwt())->'app_metadata'->>'role'='admin')
  WITH CHECK ((select auth.uid()) IS NOT NULL AND (select auth.jwt())->'app_metadata'->>'role'='admin');
CREATE POLICY "Store admins delete products" ON public.products FOR DELETE TO authenticated
  USING ((select auth.uid()) IS NOT NULL AND (select auth.jwt())->'app_metadata'->>'role'='admin');

-- Remove unauthenticated writes while retaining the public asset URLs used by the shop.
DROP POLICY IF EXISTS "Allow All 16wiy3a_1" ON storage.objects;
DROP POLICY IF EXISTS "Allow All 16wiy3a_2" ON storage.objects;
DROP POLICY IF EXISTS "Allow All 16wiy3a_3" ON storage.objects;
CREATE POLICY "Store admins list media" ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id IN ('product-images','product-videos') AND (select auth.uid()) IS NOT NULL AND (select auth.jwt())->'app_metadata'->>'role'='admin');
CREATE POLICY "Store admins upload media" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id IN ('product-images','product-videos') AND (select auth.uid()) IS NOT NULL AND (select auth.jwt())->'app_metadata'->>'role'='admin');
CREATE POLICY "Store admins update media" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id IN ('product-images','product-videos') AND (select auth.uid()) IS NOT NULL AND (select auth.jwt())->'app_metadata'->>'role'='admin')
  WITH CHECK (bucket_id IN ('product-images','product-videos') AND (select auth.uid()) IS NOT NULL AND (select auth.jwt())->'app_metadata'->>'role'='admin');
CREATE POLICY "Store admins delete media" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id IN ('product-images','product-videos') AND (select auth.uid()) IS NOT NULL AND (select auth.jwt())->'app_metadata'->>'role'='admin');
UPDATE storage.buckets SET file_size_limit=10485760,allowed_mime_types=ARRAY['image/jpeg','image/png','image/webp','image/avif','image/gif'] WHERE id='product-images';
UPDATE storage.buckets SET file_size_limit=52428800,allowed_mime_types=ARRAY['video/mp4','video/quicktime','video/webm'] WHERE id='product-videos';

-- Enquiry records are owner-private and never constitute a trusted paid order.
REVOKE ALL ON TABLE public.orders FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT ON TABLE public.orders TO authenticated;
DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders" ON public.orders FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid())=user_id AND status='clicked_whatsapp' AND EXISTS (
    SELECT 1 FROM public.products p WHERE p.id::text=product_id AND p.name=product_name AND p.price_inr=price
  ));
