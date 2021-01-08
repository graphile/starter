/*
 * The user is only allowed to have one primary email, and that email must be
 * verified. This function lets the user change which of their verified emails
 * is the primary email.
 */

create function app_public.make_email_primary(email_id uuid) returns app_public.user_emails as $$
declare
  v_user_email app_public.user_emails;
begin
  select * into v_user_email from app_public.user_emails where id = email_id and user_id = app_public.current_user_id();
  if v_user_email is null then
    raise exception 'That''s not your email' using errcode = 'DNIED';
    return null;
  end if;
  if v_user_email.is_verified is false then
    raise exception 'You may not make an unverified email primary' using errcode = 'VRFY1';
  end if;
  update app_public.user_emails set is_primary = false where user_id = app_public.current_user_id() and is_primary is true and id <> email_id;
  update app_public.user_emails set is_primary = true where user_id = app_public.current_user_id() and is_primary is not true and id = email_id returning * into v_user_email;
  return v_user_email;
end;
$$ language plpgsql strict volatile security definer set search_path to pg_catalog, public, pg_temp;
comment on function app_public.make_email_primary(email_id uuid) is
  E'Your primary email is where we''ll notify of account events; other emails may be used for discovery or login. Use this when you''re changing your email address.';


