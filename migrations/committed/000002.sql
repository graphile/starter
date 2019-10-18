--! Previous: sha1:9c7c43419e4d694ce2973f27f9564d90b3b19ea9
--! Hash: sha1:06db916be7bf667f7b827ac83816c46899a69140

-- Enter migration here
drop table if exists app_private.unregistered_email_password_resets;
create table app_private.unregistered_email_password_resets (
  email citext constraint unregistered_email_pkey primary key,
  password_reset_email_sent_at timestamptz
);
comment on table app_private.unregistered_email_password_resets is
  E'The contents of this table should never be visible to the user. If someone tries to recover the password for an email that is not registered in our system, this table helps us avoid spamming that email.';
comment on column app_private.unregistered_email_password_resets.password_reset_email_sent_at is
  E'We store the time the last password reset was sent to this email to prevent the email getting flooded.';


drop function if exists app_public.forgot_password;

create function app_public.forgot_password(email citext) returns void as $$
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

  if (v_user_email is null) then
    -- reference the unregistered_email_password_resets table

    -- see if this has been attempted recently
    if exists(
      select 1
      from app_private.unregistered_email_password_resets
      where unregistered_email_password_resets.email = forgot_password.email
      and password_reset_email_sent_at > now() - v_token_min_duration_between_emails
    ) then
      return;
    end if;

    -- trigger email send
    perform graphile_worker.add_job('user__forgot_password_unregistered_email', json_build_object('email', forgot_password.email::text));
    -- return early
    return;
  end if;

  -- from here onwards, we know we have a registered user

  -- See if we've triggered a reset recently
  if exists(
    select 1
    from app_private.user_email_secrets
    where user_email_id = v_user_email.id
    and password_reset_email_sent_at is not null
    and password_reset_email_sent_at > now() - v_token_min_duration_between_emails
  ) then
    return;
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

  -- Don't allow spamming an email
  update app_private.user_email_secrets
  set password_reset_email_sent_at = now()
  where user_email_id = v_user_email.id;

  -- Trigger email send
  perform graphile_worker.add_job('user__forgot_password', json_build_object('id', v_user_email.user_id, 'email', v_user_email.email::text, 'token', v_token));
end;
$$ language plpgsql strict security definer volatile set search_path from current;

comment on function app_public.forgot_password(email citext) is
  E'If you''ve forgotten your password, give us one of your email addresses and we'' send you a reset token. Note this only works if you have added an email address!';
