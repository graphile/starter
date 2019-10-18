--! Previous: sha1:9c7c43419e4d694ce2973f27f9564d90b3b19ea9
--! Hash: sha1:d7185c0dfd6c782c3d193006a57baae423575b17

-- Enter migration here

drop function if exists app_public.forgot_password;
create function app_public.forgot_password(email citext) returns boolean as $$
declare
  v_user_email app_public.user_emails;
  v_token text;
  v_token_min_duration_between_emails interval = interval '3 minutes';
  v_token_max_duration interval = interval '3 days';
begin
  -- Find the matching user_email
  select user_emails.* into v_user_email
  from app_public.user_emails
  where user_emails.email = forgot_password.email
  order by is_verified desc, id desc;

  if not (v_user_email is null) then
    -- See if we've triggered a reset recently
    if exists(
      select 1
      from app_private.user_email_secrets
      where user_email_id = v_user_email.id
      and password_reset_email_sent_at is not null
      and password_reset_email_sent_at > now() - v_token_min_duration_between_emails
    ) then
      return true;
    end if;

    -- Fetch or generate reset token
    update app_private.user_secrets
    set
      reset_password_token = (
        case
        when reset_password_token is null or reset_password_token_generated < NOW() - v_token_max_duration
        then encode(gen_random_bytes(7), 'hex')
        else reset_password_token
        end
      ),
      reset_password_token_generated = (
        case
        when reset_password_token is null or reset_password_token_generated < NOW() - v_token_max_duration
        then now()
        else reset_password_token_generated
        end
      )
    where user_id = v_user_email.user_id
    returning reset_password_token into v_token;

    -- Trigger email send
    perform graphile_worker.add_job('user__forgot_password', json_build_object('id', v_user_email.user_id, 'email', v_user_email.email::text, 'token', v_token));
    return true;

  end if;
  return false;
end;
$$ language plpgsql strict security definer volatile set search_path from current;

comment on function app_public.forgot_password(email citext) is
  E'@resultFieldName success\nIf you''ve forgotten your password, give us one of your email addresses and we'' send you a reset token. Note this only works if you have added an email address!';
