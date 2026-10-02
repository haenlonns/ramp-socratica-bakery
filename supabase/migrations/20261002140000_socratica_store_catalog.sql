-- Replace the placeholder pantry with the 17-item Socratica catalogue.
--
-- Product art is now SVG, so the filename check has to accept it. The six
-- original products are deactivated rather than deleted: past orders reference
-- them (on delete restrict), and the active-only name index lets the new names
-- reuse the old ones.

alter table public.store_products
  drop constraint if exists store_products_image_filename_check;

alter table public.store_products
  add constraint store_products_image_filename_check
  check (image_filename ~ '^[A-Za-z0-9][A-Za-z0-9._-]*\.(png|webp|jpg|jpeg|svg)$');

update public.store_products
set active = false, updated_at = now()
where id in ('flour', 'boxes', 'vanilla', 'chocolate', 'butter', 'eggs');

insert into public.store_products (id, vendor_id, name, description, unit, price_cents, per_team_limit, inventory_quantity, image_filename)
select product.id, vendor.id, product.name, product.description, product.unit, product.price_cents, product.per_team_limit, product.inventory_quantity, product.image_filename
from (
  values
    ('granola', 'aisle', 'Granola (gf, nf)', 'crunchy, gluten-free and nut-free. sourced from Wart Mart.', 'bag', 1500, 4, 24, 'granola.svg'),
    ('trail-mix', 'aisle', 'Trail mix', 'a handful of everything good. sourced from Wart Mart.', 'bag', 1300, 4, 24, 'trail-mix.svg'),
    ('graham-cracker', 'aisle', 'Graham cracker', 'snaps cleanly in half. sourced from Wart Mart.', 'box', 600, 4, 24, 'graham-cracker.svg'),
    ('castella-cake', 'aisle', 'Castella cake', 'freshly baked in the great kingdom of Ontario. sourced from Wart Mart.', 'cake', 2400, 4, 24, 'castella-cake.svg'),
    ('brown-sugar', 'aisle', 'Brown sugar', 'soft, sticky and a little bit molasses. sourced from Wart Mart.', 'bag', 700, 4, 24, 'brown-sugar.svg'),
    ('cinnamon', 'aisle', 'Cinnamon', 'rolled sticks from a faraway spice shelf. sourced from Wart Mart.', 'jar', 800, 4, 24, 'cinnamon.svg'),
    ('nutmeg', 'aisle', 'Nutmeg', 'grate it fresh over anything warm. sourced from Wart Mart.', 'jar', 900, 4, 24, 'nutmeg.svg'),
    ('blackberry', 'fruits', 'Blackberry', 'dark, juicy and just a bit tart. picked this morning.', 'punnet', 1200, 4, 24, 'blackberry.svg'),
    ('blueberry', 'fruits', 'Blueberry', 'small, sweet and very round. picked this morning.', 'punnet', 1100, 4, 24, 'blueberry.svg'),
    ('raspberry', 'fruits', 'Raspberry', 'delicate and bright. handle with care.', 'punnet', 1300, 4, 24, 'raspberry.svg'),
    ('strawberry', 'fruits', 'Strawberry', 'ripe, red and ready for cake. picked this morning.', 'punnet', 900, 4, 24, 'strawberry.svg'),
    ('yogurt', 'fridge', 'Yogurt', 'thick, cold and a little tangy. kept chilled.', 'tub', 1000, 4, 24, 'yogurt.svg'),
    ('honey', 'fridge', 'Honey', 'golden and slow to pour. kept chilled.', 'jar', 1400, 4, 24, 'honey.svg'),
    ('whipping-cream', 'fridge', 'Whipping cream', 'whips up soft and tall. kept chilled.', 'carton', 800, 4, 24, 'whipping-cream.svg'),
    ('creamer', 'fridge', 'Creamer', 'for the coffee that needs a little extra. kept chilled.', 'jug', 700, 4, 24, 'creamer.svg'),
    ('pumpkin-puree', 'fridge', 'Pumpkin puree', 'smooth and earthy, straight from the can. kept chilled.', 'can', 600, 4, 24, 'pumpkin-puree.svg'),
    ('condensed-milk', 'fridge', 'Condensed milk', 'sweet, thick and shamelessly rich. kept chilled.', 'can', 500, 4, 24, 'condensed-milk.svg')
) as product(id, vendor_slug, name, description, unit, price_cents, per_team_limit, inventory_quantity, image_filename)
join public.vendors vendor on vendor.slug = product.vendor_slug
on conflict (id) do update set
  vendor_id = excluded.vendor_id,
  name = excluded.name,
  description = excluded.description,
  unit = excluded.unit,
  price_cents = excluded.price_cents,
  per_team_limit = excluded.per_team_limit,
  inventory_quantity = excluded.inventory_quantity,
  image_filename = excluded.image_filename,
  active = true,
  updated_at = now();
