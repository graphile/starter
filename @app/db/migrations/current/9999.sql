--------------------------------------------------------------------------------
------                           ORGANIZATIONS                            ------
--------------------------------------------------------------------------------

drop function if exists app_public.transfer_organization_billing_contact(uuid, uuid);
drop function if exists app_public.transfer_organization_ownership(uuid, uuid);
drop function if exists app_public.delete_organization(uuid);
drop function if exists app_public.remove_from_organization(uuid, uuid);
drop function if exists app_public.organizations_current_user_is_billing_contact(app_public.organizations);
drop function if exists app_public.organizations_current_user_is_owner(app_public.organizations);
drop function if exists app_public.accept_invitation_to_organization(uuid, text) cascade;
drop function if exists app_public.get_organization_for_invitation(uuid, text) cascade;
drop function if exists app_public.organization_for_invitation(uuid, text) cascade;
drop function if exists app_public.invite_user_to_organization(uuid, uuid) cascade;
drop function if exists app_public.invite_to_organization(uuid, citext, citext) cascade;
drop function if exists app_public.current_user_invited_organization_ids() cascade;
drop function if exists app_public.current_user_member_organization_ids() cascade;
drop table if exists app_public.organization_invitations;
drop table if exists app_public.organization_memberships;
drop table if exists app_public.organizations cascade;

--------------------------------------------------------------------------------

create table app_public.organizations (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  name text not null,
  created_at timestamptz not null default now()
);
alter table app_public.organizations enable row level security;

grant select on app_public.organizations to :DATABASE_VISITOR;
grant update(name, slug) on app_public.organizations to :DATABASE_VISITOR;

--------------------------------------------------------------------------------

create table app_public.organization_memberships (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references app_public.organizations on delete cascade,
  user_id uuid not null references app_public.users on delete cascade,
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
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references app_public.organizations on delete cascade,
  code text,
  user_id uuid references app_public.users on delete cascade,
  email citext,
  check ((user_id is null) <> (email is null)),
  check ((code is null) = (email is null)),
  unique (organization_id, user_id),
  unique (organization_id, email)
);
alter table app_public.organization_invitations enable row level security;

create index on app_public.organization_invitations(user_id);
-- grant select on app_public.organization_invitations to :DATABASE_VISITOR;

--------------------------------------------------------------------------------
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

create function app_public.invite_to_organization(organization_id uuid, username citext = null, email citext = null)
  returns void as $$
declare
  v_code text;
  v_user app_public.users;
begin
  -- Are we allowed to add this person
  -- Are we logged in
  if app_public.current_user_id() is null then
    raise exception 'You must log in to invite a user' using errcode = 'LOGIN';
  end if;

  select * into v_user from app_public.users where users.username = invite_to_organization.username;

  -- Are we the owner of this organization
  if not exists(
    select 1 from app_public.organization_memberships
      where organization_memberships.organization_id = invite_to_organization.organization_id
      and organization_memberships.user_id = app_public.current_user_id()
      and is_owner is true
  ) then
    raise exception 'You''re not the owner of this organization' using errcode = 'DNIED';
  end if;

  if v_user.id is not null and exists(
    select 1 from app_public.organization_memberships
      where organization_memberships.organization_id = invite_to_organization.organization_id
      and organization_memberships.user_id = v_user.id
  ) then
    raise exception 'Cannot invite someone who is already a member' using errcode = 'ISMBR';
  end if;

  if email is not null then
    v_code = encode(gen_random_bytes(7), 'hex');
  end if;

  if v_user.id is not null and not v_user.is_verified then
    raise exception 'The user you attempted to invite has not verified their account' using errcode = 'VRFY2';
  end if;

  if v_user.id is null and email is null then
    raise exception 'Could not find person to invite' using errcode = 'NTFND';
  end if;

  -- Invite the user
  insert into app_public.organization_invitations(organization_id, user_id, email, code)
    values (invite_to_organization.organization_id, v_user.id, email, v_code);
end;
$$ language plpgsql volatile security definer set search_path = pg_catalog, public, pg_temp;

create function app_public.organization_for_invitation(invitation_id uuid, code text = null)
  returns app_public.organizations as $$
declare
  v_invitation app_public.organization_invitations;
  v_organization app_public.organizations;
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

  select * into v_organization from app_public.organizations where id = v_invitation.organization_id;

  return v_organization;
end;
$$ language plpgsql stable security definer set search_path = pg_catalog, public, pg_temp;

create function app_public.accept_invitation_to_organization(invitation_id uuid, code text = null)
  returns void as $$
declare
  v_organization app_public.organizations;
begin
  v_organization = app_public.organization_for_invitation(invitation_id, code);

  -- Accept the user into the organization
  insert into app_public.organization_memberships (organization_id, user_id)
    values(v_organization.id, app_public.current_user_id())
    on conflict do nothing;

  -- Delete the invitation
  delete from app_public.organization_invitations where id = invitation_id;
end;
$$ language plpgsql volatile security definer set search_path = pg_catalog, public, pg_temp;

--------------------------------------------------------------------------------

create trigger _500_send_email after insert on app_public.organization_invitations
  for each row execute procedure app_private.tg__add_job('organization_invitations__send_invite');

--------------------------------------------------------------------------------

create function app_public.organizations_current_user_is_owner(
  org app_public.organizations
) returns boolean as $$
  select exists(
    select 1
    from app_public.organization_memberships
    where organization_id = org.id
    and user_id = app_public.current_user_id()
    and is_owner is true
  )
$$ language sql stable;

create function app_public.organizations_current_user_is_billing_contact(
  org app_public.organizations
) returns boolean as $$
  select exists(
    select 1
    from app_public.organization_memberships
    where organization_id = org.id
    and user_id = app_public.current_user_id()
    and is_billing_contact is true
  )
$$ language sql stable;

create policy update_owner on app_public.organizations for update using (exists(
  select 1
  from app_public.organization_memberships
  where organization_id = organizations.id
  and user_id = app_public.current_user_id()
  and is_owner is true
));

create function app_public.remove_from_organization(
  organization_id uuid,
  user_id uuid
) returns void as $$
declare
  v_my_membership app_public.organization_memberships;
begin
  select * into v_my_membership
    from app_public.organization_memberships
    where organization_memberships.organization_id = remove_from_organization.organization_id
    and organization_memberships.user_id = app_public.current_user_id();

  if (v_my_membership is null) then
    -- I'm not a member of that organization
    return;
  elsif v_my_membership.is_owner then
    if remove_from_organization.user_id <> app_public.current_user_id() then
      -- Delete it
    else
      -- Need to transfer ownership before I can leave
      return;
    end if;
  elsif v_my_membership.user_id = user_id then
    -- Delete it
  else
    -- Not allowed to delete it
    return;
  end if;

  if v_my_membership.is_billing_contact then
    update app_public.organization_memberships
      set is_billing_contact = false
      where id = v_my_membership.id
      returning * into v_my_membership;
    update app_public.organization_memberships
      set is_billing_contact = true
      where organization_memberships.organization_id = remove_from_organization.organization_id
      and organization_memberships.is_owner;
  end if;

  delete from app_public.organization_memberships
    where organization_memberships.organization_id = remove_from_organization.organization_id
    and organization_memberships.user_id = remove_from_organization.user_id;

end;
$$ language plpgsql volatile security definer set search_path to pg_catalog, public, pg_temp;

--------------------------------------------------------------------------------

create function app_public.tg_users__deletion_organization_checks_and_actions() returns trigger as $$
begin
  -- Check they're not an organization owner
  if exists(
    select 1
    from app_public.organization_memberships
    where user_id = app_public.current_user_id()
    and is_owner is true
  ) then
    raise exception 'You cannot delete your account until you are not the owner of any organizations.' using errcode = 'OWNER';
  end if;

  -- Reassign billing contact status back to the organization owner
  update app_public.organization_memberships
    set is_billing_contact = true
    where is_owner = true
    and organization_id in (
      select organization_id
      from app_public.organization_memberships my_memberships
      where my_memberships.user_id = app_public.current_user_id()
      and is_billing_contact is true
    );

  return old;
end;
$$ language plpgsql;

create trigger _500_deletion_organization_checks_and_actions
  before delete
  on app_public.users
  for each row
  when (app_public.current_user_id() is not null)
  execute procedure app_public.tg_users__deletion_organization_checks_and_actions();

create function app_public.delete_organization(organization_id uuid) returns void as $$
begin
  if exists(
    select 1
    from app_public.organization_memberships
    where user_id = app_public.current_user_id()
    and organization_memberships.organization_id = delete_organization.organization_id
    and is_owner is true
  ) then
    delete from app_public.organizations where id = organization_id;
  end if;
end;
$$ language plpgsql volatile security definer set search_path to pg_catalog, public, pg_temp;

create function app_public.transfer_organization_ownership(organization_id uuid, user_id uuid) returns app_public.organizations as $$
declare
 v_org app_public.organizations;
begin
  if exists(
    select 1
    from app_public.organization_memberships
    where organization_memberships.user_id = app_public.current_user_id()
    and organization_memberships.organization_id = transfer_organization_ownership.organization_id
    and is_owner is true
  ) then
    update app_public.organization_memberships
      set is_owner = true
      where organization_memberships.organization_id = transfer_organization_ownership.organization_id
      and organization_memberships.user_id = transfer_organization_ownership.user_id;
    if found then
      update app_public.organization_memberships
        set is_owner = false
        where organization_memberships.organization_id = transfer_organization_ownership.organization_id
        and organization_memberships.user_id = app_public.current_user_id();

      select * into v_org from app_public.organizations where id = organization_id;
      return v_org;
    end if;
  end if;
  return null;
end;
$$ language plpgsql volatile security definer set search_path to pg_catalog, public, pg_temp;

create function app_public.transfer_organization_billing_contact(organization_id uuid, user_id uuid) returns app_public.organizations as $$
declare
 v_org app_public.organizations;
begin
  if exists(
    select 1
    from app_public.organization_memberships
    where organization_memberships.user_id = app_public.current_user_id()
    and organization_memberships.organization_id = transfer_organization_billing_contact.organization_id
    and is_owner is true
  ) then
    update app_public.organization_memberships
      set is_billing_contact = true
      where organization_memberships.organization_id = transfer_organization_billing_contact.organization_id
      and organization_memberships.user_id = transfer_organization_billing_contact.user_id;
    if found then
      update app_public.organization_memberships
        set is_billing_contact = false
        where organization_memberships.organization_id = transfer_organization_billing_contact.organization_id
        and organization_memberships.user_id <> transfer_organization_billing_contact.user_id
        and is_billing_contact = true;

      select * into v_org from app_public.organizations where id = organization_id;
      return v_org;
    end if;
  end if;
  return null;
end;
$$ language plpgsql volatile security definer set search_path to pg_catalog, public, pg_temp;
