drop function if exists app_public.accept_invitation_to_organization(int, text) cascade;
drop function if exists app_public.invite_user_to_organization(int, int) cascade;
drop function if exists app_public.invite_to_organization(int, int) cascade;
drop function if exists app_public.invite_to_organization(int, int, citext) cascade;
drop function if exists app_public.current_user_invited_organization_ids() cascade;
drop function if exists app_public.current_user_member_organization_ids() cascade;
drop table if exists app_public.organization_invitations;
drop table if exists app_public.organization_memberships;
drop table if exists app_public.organizations cascade;

--------------------------------------------------------------------------------

create table app_public.organizations (
  id serial primary key,
  slug citext not null unique,
  name text not null,
  created_at timestamptz not null default now()
);
alter table app_public.organizations enable row level security;

grant select on app_public.organizations to :DATABASE_VISITOR;


--------------------------------------------------------------------------------

create table app_public.organization_memberships (
  id serial primary key,
  organization_id int not null references app_public.organizations,
  user_id int not null references app_public.users,
  is_owner boolean not null default false,
  is_billing_contact boolean not null default false,
  created_at timestamptz not null default now(),
  unique (organization_id, user_id)
);
alter table app_public.organization_memberships enable row level security;

create index on app_public.organization_memberships (user_id);

grant select on app_public.organization_memberships to :DATABASE_VISITOR;

--------------------------------------------------------------------------------

create table app_public.organization_invitations (
  id serial primary key,
  organization_id int not null references app_public.organizations,
  code text,
  user_id int references app_public.users,
  email citext,
  check ((user_id is null) <> (email is null)),
  check ((code is null) = (email is null)),
  unique (organization_id, user_id),
  unique (organization_id, email)
);
alter table app_public.organization_invitations enable row level security;

create index on app_public.organization_invitations(user_id);
grant select on app_public.organization_invitations to :DATABASE_VISITOR;

--------------------------------------------------------------------------------
create function app_public.current_user_member_organization_ids() returns setof int as $$
  select organization_id from app_public.organization_memberships
    where user_id = app_public.current_user_id();
$$ language sql stable security definer set search_path = pg_catalog, public, pg_temp;

create function app_public.current_user_invited_organization_ids() returns setof int as $$
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

--------------------------------------------------------------------------------
create function app_public.create_organization(slug citext, name text) returns app_public.organizations as $$
declare
  v_org app_public.organizations;
begin
  insert into app_public.organizations (slug, name) values (slug, name) returning * into v_org;
  insert into app_public.organization_memberships (organization_id, user_id, is_owner, is_billing_contact)
    values(v_org.id, app_public.current_user_id(), true, true);
  return v_org;
end;
$$ language plpgsql volatile security definer set search_path = pg_catalog, public, pg_temp;

create function app_public.invite_to_organization(organization_id int, user_id int, email citext)
  returns void as $$
declare
  v_code text;
begin
  -- Are we allowed to add this person
  -- Are we logged in
  if app_public.current_user_id() is null then
    raise exception 'You must log in to invite a user' using errcode = 'LOGIN';
  end if;

  -- Are we the owner of this organization
  if not exists(
    select 1 from app_public.organization_memberships
      where organization_memberships.organization_id = invite_to_organization.organization_id
      and organization_memberships.user_id = app_public.current_user_id()
      and is_owner is true
  ) then
    raise exception 'You''re not the owner of this organization' using errcode = 'DNIED';
  end if;

  if user_id is not null and exists(
    select 1 from app_public.organization_memberships
      where organization_memberships.organization_id = invite_to_organization.organization_id
      and organization_memberships.user_id = invite_to_organization.user_id
  ) then
    raise exception 'Cannot invite someone who is already a member' using errcode = 'ISMBR';
  end if;

  if email is not null then
    v_code = encode(gen_random_bytes(7), 'hex');
  end if;

  -- Invite the user
  insert into app_public.organization_invitations(organization_id, user_id, email, code)
    values (invite_to_organization.organization_id, user_id, email, v_code);
end;
$$ language plpgsql volatile security definer set search_path = pg_catalog, public, pg_temp;

create function app_public.accept_invitation_to_organization(invitation_id int, code text = null)
  returns void as $$
declare
  v_invitation app_public.organization_invitations;
begin
  if app_public.current_user_id() is null then
    raise exception 'You must log in to accept an invitation' using errcode = 'LOGIN';
  end if;

  select * into v_invitation from app_public.organization_invitations where id = invitation_id;

  if v_invitation is null then
    raise exception 'We could not find that invitation' using errcode = 'NTFND';
  end if;

  if v_invitation.user_id is not null then
    if v_invitation.user_id is distinct from app_public.current_user_id() then
      raise exception 'That invitation is not for you' using errcode = 'DNIED';
    end if;
  else
    if v_invitation.code is distinct from code then
      raise exception 'Incorrect invitation code' using errcode = 'DNIED';
    end if;
  end if;

  -- Accept the user into the organization
  insert into app_public.organization_memberships (organization_id, user_id)
    values(v_invitation.organization_id, app_public.current_user_id())
    on conflict do nothing;

  -- Delete the invitation
  delete from app_public.organization_invitations where id = v_invitation.id;
end;
$$ language plpgsql volatile security definer set search_path = pg_catalog, public, pg_temp;

--------------------------------------------------------------------------------

create trigger _500_send_email after insert on app_public.organization_invitations
  for each row execute procedure app_private.tg__add_job('organization_invitations__send_invite');
