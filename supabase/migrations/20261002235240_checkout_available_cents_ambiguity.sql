-- `available_cents` is both a RETURNS TABLE output variable and a team_funds
-- column. Qualifying the column avoids an ambiguous-reference runtime error.
create or replace function public.post_mixed_store_checkout(
  target_event_id uuid,
  target_team_id uuid,
  target_user_id uuid,
  target_request_id uuid,
  target_purchases jsonb
) returns table(
  checkout_id uuid, order_id uuid, transaction_id uuid, vendor_slug text,
  invoice_number text, total_cents integer, available_cents integer, transaction_status text
)
language plpgsql security invoker set search_path = public
as $$
declare
  target_fund_id uuid; target_card_id uuid; target_checkout_id uuid;
  target_vendor_id uuid; target_merchant_name text; balance_before integer;
  balance_after integer; checkout_total integer := 0; purchase jsonb; item jsonb;
  purchase_total integer; quantity integer; unit_price integer; product_id text;
  product_name text; product_inventory_quantity integer; product_per_team_limit integer;
  team_purchased_quantity integer; checkout_product_quantity integer;
  purchase_vendor_slug text; purchase_order_id uuid; purchase_invoice_number text;
  authorization_id uuid; created_transaction_id uuid; existing_status text;
begin
  if jsonb_typeof(target_purchases) <> 'array' or jsonb_array_length(target_purchases) = 0 then
    raise exception 'Choose at least one product.';
  end if;

  select fund.id, fund.available_cents into target_fund_id, balance_before
  from public.team_funds fund
  where fund.event_id = target_event_id and fund.team_id = target_team_id and fund.status = 'ACTIVE'
  for update;
  if target_fund_id is null then raise exception 'This team does not have an active shared fund.'; end if;

  select checkout.id, checkout.status into target_checkout_id, existing_status
  from public.store_checkouts checkout
  where checkout.fund_id = target_fund_id and checkout.idempotency_key = target_request_id;
  if target_checkout_id is not null then
    return query
      select checkout.id, orders.id, transactions.id, vendors.slug, orders.invoice_number,
             orders.total_cents, balance_before, checkout.status
      from public.store_checkouts checkout
      left join public.orders orders on orders.checkout_id = checkout.id
      left join public.vendors vendors on vendors.id = orders.vendor_id
      left join public.mock_transactions transactions on transactions.order_id = orders.id
      where checkout.id = target_checkout_id
      order by orders.created_at;
    return;
  end if;

  select card.id into target_card_id from public.mock_cards card
  where card.event_id = target_event_id and card.fund_id = target_fund_id
    and card.user_id = target_user_id and card.status = 'ACTIVE' for update;
  if target_card_id is null then raise exception 'You do not have an active workshop card for this team.'; end if;
  if not exists (select 1 from public.team_members member where member.event_id = target_event_id
    and member.team_id = target_team_id and member.user_id = target_user_id and member.left_at is null) then
    raise exception 'Active team membership is required.';
  end if;

  for purchase in select value from jsonb_array_elements(target_purchases) loop
    purchase_vendor_slug := purchase->>'vendorSlug';
    purchase_order_id := (purchase->>'orderId')::uuid;
    purchase_invoice_number := purchase->>'invoiceNumber';
    if purchase_vendor_slug is null or purchase_order_id is null or purchase_invoice_number is null
      or jsonb_typeof(purchase->'lines') <> 'array' or jsonb_array_length(purchase->'lines') = 0 then
      raise exception 'Invalid vendor checkout.';
    end if;
    if not exists (select 1 from public.vendors vendor where vendor.slug = purchase_vendor_slug and vendor.active) then
      raise exception 'This store is unavailable.';
    end if;
    purchase_total := 0;
    for item in select value from jsonb_array_elements(purchase->'lines') loop
      product_id := item->>'productId'; product_name := item->>'productName';
      quantity := (item->>'quantity')::integer; unit_price := (item->>'unitPriceCents')::integer;
      if product_id is null or product_name is null or quantity is null or unit_price is null
        or quantity < 1 or quantity > 20 or unit_price < 0 then raise exception 'Invalid purchase item.'; end if;
      select product.inventory_quantity, product.per_team_limit into product_inventory_quantity, product_per_team_limit
      from public.store_products product join public.vendors vendor on vendor.id = product.vendor_id
      where product.id = product_id and product.active and vendor.active and vendor.slug = purchase_vendor_slug
        and product.name = product_name and product.price_cents = unit_price for update of product;
      if not found then raise exception 'A product or price is no longer available.'; end if;
      if product_inventory_quantity < quantity then raise exception 'This product is sold out or does not have enough inventory.'; end if;
      select coalesce(sum((checkout_line.value->>'quantity')::integer), 0)::integer into checkout_product_quantity
      from jsonb_array_elements(target_purchases) checkout_purchase(value)
      cross join lateral jsonb_array_elements(checkout_purchase.value->'lines') checkout_line(value)
      where checkout_line.value->>'productId' = product_id;
      select coalesce(sum(inventory.quantity), 0)::integer into team_purchased_quantity from public.inventory inventory
      where inventory.team_id = target_team_id and inventory.product_id = product_id;
      if team_purchased_quantity + checkout_product_quantity > product_per_team_limit then
        raise exception 'This team has reached the purchase limit for this product.';
      end if;
      purchase_total := purchase_total + quantity * unit_price;
    end loop;
    if purchase_total <= 0 then raise exception 'Purchase total must be positive.'; end if;
    checkout_total := checkout_total + purchase_total;
  end loop;

  if balance_before < checkout_total then
    insert into public.store_checkouts(fund_id, team_id, user_id, idempotency_key, total_cents, status)
    values (target_fund_id, target_team_id, target_user_id, target_request_id, checkout_total, 'DECLINED') returning id into target_checkout_id;
    insert into public.mock_authorizations(fund_id, card_id, amount_cents, merchant_name, status, idempotency_key, decline_reason)
    values (target_fund_id, target_card_id, checkout_total, 'Socratica Store', 'DECLINED', gen_random_uuid(), 'Insufficient shared-fund balance') returning id into authorization_id;
    insert into public.mock_transactions(fund_id, card_id, authorization_id, type, status, amount_cents, merchant_name)
    values (target_fund_id, target_card_id, authorization_id, 'PURCHASE', 'DECLINED', checkout_total, 'Socratica Store') returning id into created_transaction_id;
    return query select target_checkout_id, null::uuid, created_transaction_id, null::text, null::text, checkout_total, balance_before, 'DECLINED'::text;
    return;
  end if;

  insert into public.store_checkouts(fund_id, team_id, user_id, idempotency_key, total_cents, status)
  values (target_fund_id, target_team_id, target_user_id, target_request_id, checkout_total, 'POSTED') returning id into target_checkout_id;
  balance_after := balance_before;
  for purchase in select value from jsonb_array_elements(target_purchases) loop
    purchase_vendor_slug := purchase->>'vendorSlug'; purchase_order_id := (purchase->>'orderId')::uuid;
    purchase_invoice_number := purchase->>'invoiceNumber';
    select vendor.id, vendor.display_name into target_vendor_id, target_merchant_name from public.vendors vendor where vendor.slug = purchase_vendor_slug and vendor.active;
    select sum((value->>'quantity')::integer * (value->>'unitPriceCents')::integer)::integer into purchase_total from jsonb_array_elements(purchase->'lines');
    insert into public.orders(id, team_id, vendor_id, checkout_id, invoice_number, status, total_cents, paid_at, fulfilled_at)
    values (purchase_order_id, target_team_id, target_vendor_id, target_checkout_id, purchase_invoice_number, 'FULFILLED', purchase_total, now(), now());
    insert into public.order_lines(order_id, product_id, product_name, quantity, unit_price_cents)
    select purchase_order_id, value->>'productId', value->>'productName', (value->>'quantity')::integer, (value->>'unitPriceCents')::integer from jsonb_array_elements(purchase->'lines');
    for item in select value from jsonb_array_elements(purchase->'lines') loop
      update public.store_products product set inventory_quantity = product.inventory_quantity - (item->>'quantity')::integer, updated_at = now() where product.id = item->>'productId';
    end loop;
    insert into public.mock_authorizations(fund_id, card_id, order_id, amount_cents, merchant_name, status, idempotency_key)
    values (target_fund_id, target_card_id, purchase_order_id, purchase_total, target_merchant_name, 'CAPTURED', gen_random_uuid()) returning id into authorization_id;
    insert into public.mock_transactions(fund_id, card_id, authorization_id, order_id, type, status, amount_cents, merchant_name)
    values (target_fund_id, target_card_id, authorization_id, purchase_order_id, 'PURCHASE', 'POSTED', purchase_total, target_merchant_name) returning id into created_transaction_id;
    balance_after := balance_after - purchase_total;
    insert into public.fund_ledger_entries(fund_id, transaction_id, entry_type, amount_cents, balance_after_cents, actor_user_id, reason)
    values (target_fund_id, created_transaction_id, 'PURCHASE', -purchase_total, balance_after, target_user_id, 'Supplier purchase: ' || target_merchant_name);
    insert into public.inventory(team_id, product_id, product_name, quantity)
    select target_team_id, value->>'productId', value->>'productName', (value->>'quantity')::integer from jsonb_array_elements(purchase->'lines')
    on conflict (team_id, product_id) do update set quantity = public.inventory.quantity + excluded.quantity;
    return query select target_checkout_id, purchase_order_id, created_transaction_id, purchase_vendor_slug, purchase_invoice_number, purchase_total, balance_after, 'POSTED'::text;
  end loop;
  update public.team_funds fund set available_cents = balance_after, updated_at = now() where fund.id = target_fund_id;
end;
$$;

revoke all on function public.post_mixed_store_checkout(uuid, uuid, uuid, uuid, jsonb) from public, anon, authenticated;
grant execute on function public.post_mixed_store_checkout(uuid, uuid, uuid, uuid, jsonb) to service_role;
