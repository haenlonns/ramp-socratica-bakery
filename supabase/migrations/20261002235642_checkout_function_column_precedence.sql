-- Prefer table columns where a PL/pgSQL variable and a column share a name.
-- The one intended variable reference remains explicitly qualified as
-- checkout.product_id by the preceding migration.
do $$
declare
  function_definition text;
begin
  select pg_get_functiondef(
    'public.post_mixed_store_checkout(uuid, uuid, uuid, uuid, jsonb)'::regprocedure
  ) into function_definition;

  function_definition := replace(
    function_definition,
    E'<<checkout>>\ndeclare\n',
    E'#variable_conflict use_column\n<<checkout>>\ndeclare\n'
  );

  execute function_definition;
end;
$$;
