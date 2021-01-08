/*
 * If you don't receive the email verification email, you can trigger a resend
 * with this function.
 */
create function app_public.resend_email_verification_code(email_id uuid) returns boolean as $$
begin
  if exists(
    select 1
    from app_public.user_emails
    where user_emails.id = email_id
    and user_id = app_public.current_user_id()
    and is_verified is false
  ) then
    perform graphile_worker.add_job('user_emails__send_verification', json_build_object('id', email_id));
    return true;
  end if;
  return false;
end;
$$ language plpgsql strict volatile security definer set search_path to pg_catalog, public, pg_temp;
comment on function app_public.resend_email_verification_code(email_id uuid) is
  E'If you didn''t receive the verification code for this email, we can resend it. We silently cap the rate of resends on the backend, so calls to this function may not result in another email being sent if it has been called recently.';


