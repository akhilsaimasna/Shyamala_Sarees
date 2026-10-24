# Product colour metadata

Supabase project: kufsqjyzoskxfmphjbwc. Schema migration: add_product_colour_tags, applied through Supabase migrations.

The products.colors text array stores canonical colour families. It defaults to an empty array for older integrations, with a database constraint restricting values to the 14 names in colourOptions. The storefront prefers these explicit tags to description text and passes them through server rendering. Legacy records without tags retain text matching.

catalog-colour-review.json records the photo-based review for all 42 current listings (335 photographs), including source image and gallery size. Tags describe prominent fabric colours across variants and large contrast panels; metallic zari trim alone is not tagged Gold. Colour classification is inferred from photography; exact shade and variant availability must be confirmed with the shop.

The initial correction updates only the colors column on these existing IDs, only while their full image array still matches the reviewed snapshot and colors remains empty. It does not change price, inventory, names, descriptions, photos, or permissions. The data correction is separate from the schema migration and is not an automatic seed for future deployments.

Product details expose all existing gallery photographs and a Colours shown row so shoppers can inspect variants. Filter labels include colour names and full-catalog counts. The new-product form requires at least one colour and submits the same canonical tags; the dashboard displays saved tags.
