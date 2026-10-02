-- A PL/pgSQL variable named product_id collides with inventory.product_id.
-- Label the function block and explicitly refer to that variable where the
-- inventory row is queried.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'public.post_mixed_store_checkout(uuid, uuid, uuid, uuid, jsonb)'::regprocedure
  ) into function_definition;

  function_definition := replace(
    function_definition,
    E'declare\n',
    E'<<checkout>>\ndeclare\n'
  );
  function_definition := replace(
    function_definition,
    'inventory.product_id = product_id;',
    'inventory.product_id = checkout.product_id;'
  );

  execute function_definition;
end;
$$;
