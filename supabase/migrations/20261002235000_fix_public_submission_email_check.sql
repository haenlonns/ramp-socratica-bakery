-- The intake function's email pattern escaped its dot twice, so it required a
-- literal backslash and rejected every real address. Recreate it with a single escape.
create or replace function public.create_public_submission_team(
  target_team_id uuid,
  target_event_id uuid,
  target_team_name text,
  target_slug text,
  target_project_name text,
  target_project_url text,
  target_problem text,
  target_solution text,
  target_impact text,
  target_estimate text,
  target_invitations jsonb,
  target_expires_at timestamptz
) returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  event_deadline timestamptz;
  invitation record;
  normalized_email text;
begin
  if nullif(trim(target_team_name), '') is null or char_length(trim(target_team_name)) > 80 then
    raise exception 'Team name must be between 1 and 80 characters.';
  end if;
  if nullif(trim(target_project_name), '') is null or char_length(trim(target_project_name)) > 100 then
    raise exception 'Project name must be between 1 and 100 characters.';
  end if;
  if nullif(trim(target_project_url), '') is null or char_length(trim(target_project_url)) > 1000 then
    raise exception 'A project URL is required.';
  end if;
  if nullif(trim(target_problem), '') is null or char_length(trim(target_problem)) > 700
    or nullif(trim(target_solution), '') is null or char_length(trim(target_solution)) > 700
    or nullif(trim(target_impact), '') is null or char_length(trim(target_impact)) > 700
    or char_length(trim(target_estimate)) > 500 then
    raise exception 'Submission details are incomplete or too long.';
  end if;
  if jsonb_typeof(target_invitations) <> 'array'
    or jsonb_array_length(target_invitations) not between 1 and 6 then
    raise exception 'Enter between one and six participant email addresses.';
  end if;
  if target_expires_at <= now() then
    raise exception 'Invitation expiry must be in the future.';
  end if;

  select submission_deadline_at into event_deadline
  from events
  where id = target_event_id
  for share;
  if not found then raise exception 'This event is unavailable.'; end if;
  if event_deadline <= now() then raise exception 'The submission deadline has passed.'; end if;

  if exists (
    select 1
    from jsonb_to_recordset(target_invitations) as invite(email text, token_hash text)
    where lower(trim(invite.email)) = ''
      or invite.email <> lower(trim(invite.email))
      or invite.email !~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
      or char_length(invite.token_hash) <> 64
  ) then raise exception 'Participant invitations are invalid.'; end if;
  if exists (
    select 1
    from jsonb_to_recordset(target_invitations) as invite(email text, token_hash text)
    group by lower(trim(invite.email))
    having count(*) > 1
  ) then raise exception 'Each participant email can only be included once.'; end if;

  -- Do not silently move a person away from an existing team or invitation.
  for invitation in select * from jsonb_to_recordset(target_invitations) as invite(email text, token_hash text)
  loop
    normalized_email := lower(trim(invitation.email));
    if exists (
      select 1 from event_admins admin
      join profiles profile on profile.id = admin.user_id
      where admin.event_id = target_event_id and profile.email = normalized_email
    ) then raise exception 'Admin accounts cannot join bakery teams.'; end if;
    if exists (
      select 1 from team_members member
      join profiles profile on profile.id = member.user_id
      where member.event_id = target_event_id and member.left_at is null and profile.email = normalized_email
    ) then raise exception 'A participant is already assigned to a team.'; end if;
    if exists (
      select 1 from team_invitations pending
      where pending.event_id = target_event_id
        and pending.email = normalized_email
        and pending.accepted_at is null
        and pending.revoked_at is null
        and pending.expires_at > now()
    ) then raise exception 'A participant already has a pending team invitation.'; end if;
  end loop;

  insert into teams (id, event_id, name, slug, starting_cash_cents, available_cash_cents)
  values (target_team_id, target_event_id, trim(target_team_name), target_slug, 0, 0);

  insert into submissions (event_id, team_id, title, project_url, problem, solution, impact, estimate)
  values (
    target_event_id, target_team_id, trim(target_project_name), trim(target_project_url),
    trim(target_problem), trim(target_solution), trim(target_impact), trim(target_estimate)
  );

  insert into team_funds (event_id, team_id)
  values (target_event_id, target_team_id);

  insert into team_invitations (event_id, team_id, email, token_hash, expires_at)
  select target_event_id, target_team_id, lower(trim(invite.email)), invite.token_hash, target_expires_at
  from jsonb_to_recordset(target_invitations) as invite(email text, token_hash text);

  return target_team_id;
end;
$$;
