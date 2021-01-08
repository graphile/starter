/*
 * This function handles logging in a user with their username (or email
 * address) and password.
 *
 * Note that it is not in app_public; this function is intended to be called
 * with elevated privileges (namely from `PassportLoginPlugin.ts`). The reason
 * for this is because we want to be able to track failed login attempts (to
 * help protect user accounts). If this were callable by a user, they could
 * roll back the transaction when a login fails and no failed attempts would be
 * logged, effectively giving them infinite retries. We want to disallow this,
 * so we only let code call into `login` that we trust to not roll back the
 * transaction afterwards.
 */
create function app_private.login(username citext, password text) returns app_private.sessions as $$
declare
  v_user app_public.users;
  v_user_secret app_private.user_secrets;
  v_login_attempt_window_duration interval = interval '5 minutes';
  v_session app_private.sessions;
begin
  if username like '%@%' then
    -- It's an email
    select users.* into v_user
    from app_public.users
    inner join app_public.user_emails
    on (user_emails.user_id = users.id)
    where user_emails.email = login.username
    order by
      user_emails.is_verified desc, -- Prefer verified email
      user_emails.created_at asc -- Failing that, prefer the first registered (unverified users _should_ verify before logging in)
    limit 1;
  else
    -- It's a username
    select users.* into v_user
    from app_public.users
    where users.username = login.username;
  end if;

  if not (v_user is null) then
    -- Load their secrets
    select * into v_user_secret from app_private.user_secrets
    where user_secrets.user_id = v_user.id;

    -- Have there been too many login attempts?
    if (
      v_user_secret.first_failed_password_attempt is not null
    and
      v_user_secret.first_failed_password_attempt > NOW() - v_login_attempt_window_duration
    and
      v_user_secret.failed_password_attempts >= 3
    ) then
      raise exception 'User account locked - too many login attempts. Try again after 5 minutes.' using errcode = 'LOCKD';
    end if;

    -- Not too many login attempts, let's check the password.
    -- NOTE: `password_hash` could be null, this is fine since `NULL = NULL` is null, and null is falsy.
    if v_user_secret.password_hash = crypt(password, v_user_secret.password_hash) then
      -- Excellent - they're logged in! Let's reset the attempt tracking
      update app_private.user_secrets
      set failed_password_attempts = 0, first_failed_password_attempt = null, last_login_at = now()
      where user_id = v_user.id;
      -- Create a session for the user
      insert into app_private.sessions (user_id) values (v_user.id) returning * into v_session;
      -- And finally return the session
      return v_session;
    else
      -- Wrong password, bump all the attempt tracking figures
      update app_private.user_secrets
      set
        failed_password_attempts = (case when first_failed_password_attempt is null or first_failed_password_attempt < now() - v_login_attempt_window_duration then 1 else failed_password_attempts + 1 end),
        first_failed_password_attempt = (case when first_failed_password_attempt is null or first_failed_password_attempt < now() - v_login_attempt_window_duration then now() else first_failed_password_attempt end)
      where user_id = v_user.id;
      return null; -- Must not throw otherwise transaction will be aborted and attempts won't be recorded
    end if;
  else
    -- No user with that email/username was found
    return null;
  end if;
end;
$$ language plpgsql strict volatile;

comment on function app_private.login(username citext, password text) is
  E'Returns a user that matches the username/password combo, or null on failure.';
