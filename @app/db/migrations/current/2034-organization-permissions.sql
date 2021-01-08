/*
 * Users can see organizations and organization members if they are themselves
 * a member of the same organization, or if they've been invited to that
 * organization. To achieve that, we create two SECURITY DEFINER functions
 * (which bypass RLS) to determine which organizations you're a member of or
 * have been invited to, and then use these in the policies below. NOTE: we're
 * not expecting a particularly large number of values to be returned from
 * these functions.
 */

create function app_public.current_user_member_organization_ids() returns setof uuid as $$
  select organization_id from app_public.organization_memberships
    where user_id = app_public.current_user_id();
$$ language sql stable security definer set search_path = pg_catalog, public, pg_temp;

create function app_public.current_user_invited_organization_ids() returns setof uuid as $$
  select organization_id from app_public.organization_invitations
    where user_id = app_public.current_user_id();
$$ language sql stable security definer set search_path = pg_catalog, public, pg_temp;

create policy select_member on app_public.organizations
  for select using (id in (select app_public.current_user_member_organization_ids()));

create policy select_invited on app_public.organizations
  for select using (id in (select app_public.current_user_invited_organization_ids()));

create policy select_member on app_public.organization_memberships
  for select using (organization_id in (select app_public.current_user_member_organization_ids()));

create policy select_invited on app_public.organization_memberships
  for select using (organization_id in (select app_public.current_user_invited_organization_ids()));

create policy update_owner on app_public.organizations for update using (exists(
  select 1
  from app_public.organization_memberships
  where organization_id = organizations.id
  and user_id = app_public.current_user_id()
  and is_owner is true
));

