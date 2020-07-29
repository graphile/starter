--
-- PostgreSQL database dump
--

-- Dumped from database version 12.3 (Debian 12.3-1.pgdg100+1)
-- Dumped by pg_dump version 12.3 (Debian 12.3-1.pgdg100+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: app_hidden; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app_hidden;


--
-- Name: app_private; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app_private;


--
-- Name: app_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA app_public;


--
-- Name: audit; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA audit;


--
-- Name: SCHEMA audit; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA audit IS 'Out-of-table audit/history logging tables and trigger functions';


--
-- Name: citext; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;


--
-- Name: EXTENSION citext; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION citext IS 'data type for case-insensitive character strings';


--
-- Name: hstore; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS hstore WITH SCHEMA public;


--
-- Name: EXTENSION hstore; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION hstore IS 'data type for storing sets of (key, value) pairs';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: _history_event; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public._history_event AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE'
);


--
-- Name: accounts_state; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public.accounts_state AS ENUM (
    'active',
    'new',
    'passive'
);


--
-- Name: bank_transfers_tracking_status; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public.bank_transfers_tracking_status AS ENUM (
    'neu',
    'exportiert',
    'ausgeführt',
    'nicht ausgeführt',
    'rücklastschrift',
    'vorschau'
);


--
-- Name: contacts_gender; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public.contacts_gender AS ENUM (
    '',
    'F',
    'M'
);


--
-- Name: contacts_state; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public.contacts_state AS ENUM (
    'active',
    'passive',
    'blocked'
);


--
-- Name: deals_cycle; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public.deals_cycle AS ENUM (
    'monthly',
    'quarterly',
    'semiannual',
    'annual',
    'once'
);


--
-- Name: deals_entry_day; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public.deals_entry_day AS ENUM (
    '',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30'
);


--
-- Name: deals_pay_method; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public.deals_pay_method AS ENUM (
    'bill',
    'debit'
);


--
-- Name: deals_start_day; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public.deals_start_day AS ENUM (
    '1',
    '15'
);


--
-- Name: deals_status; Type: TYPE; Schema: app_public; Owner: -
--

CREATE TYPE app_public.deals_status AS ENUM (
    'active',
    'passive'
);


--
-- Name: assert_valid_password(text); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.assert_valid_password(new_password text) RETURNS void
    LANGUAGE plpgsql
    AS $$
begin
  -- TODO: add better assertions!
  if length(new_password) < 8 then
    raise exception 'Password is too weak' using errcode = 'WEAKP';
  end if;
end;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: users; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.users (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    username public.citext NOT NULL,
    name text,
    avatar_url text,
    is_admin boolean DEFAULT false NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT users_avatar_url_check CHECK ((avatar_url ~ '^https?://[^/]+'::text)),
    CONSTRAINT users_username_check CHECK (((length((username)::text) >= 2) AND (length((username)::text) <= 24) AND (username OPERATOR(public.~) '^[a-zA-Z]([a-zA-Z0-9][_]?)+$'::public.citext)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON TABLE app_public.users IS 'A user who can log in to the application.';


--
-- Name: COLUMN users.id; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.users.id IS 'Unique identifier for the user.';


--
-- Name: COLUMN users.username; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.users.username IS 'Public-facing username (or ''handle'') of the user.';


--
-- Name: COLUMN users.name; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.users.name IS 'Public-facing name (or pseudonym) of the user.';


--
-- Name: COLUMN users.avatar_url; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.users.avatar_url IS 'Optional avatar URL.';


--
-- Name: COLUMN users.is_admin; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.users.is_admin IS 'If true, the user has elevated privileges.';


--
-- Name: link_or_register_user(uuid, character varying, character varying, json, json); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.link_or_register_user(f_user_id uuid, f_service character varying, f_identifier character varying, f_profile json, f_auth_details json) RETURNS app_public.users
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_matched_user_id uuid;
  v_matched_authentication_id uuid;
  v_email citext;
  v_name text;
  v_avatar_url text;
  v_user app_public.users;
  v_user_email app_public.user_emails;
begin
  -- See if a user account already matches these details
  select id, user_id
    into v_matched_authentication_id, v_matched_user_id
    from app_public.user_authentications
    where service = f_service
    and identifier = f_identifier
    limit 1;

  if v_matched_user_id is not null and f_user_id is not null and v_matched_user_id <> f_user_id then
    raise exception 'A different user already has this account linked.' using errcode = 'TAKEN';
  end if;

  v_email = f_profile ->> 'email';
  v_name := f_profile ->> 'name';
  v_avatar_url := f_profile ->> 'avatar_url';

  if v_matched_authentication_id is null then
    if f_user_id is not null then
      -- Link new account to logged in user account
      insert into app_public.user_authentications (user_id, service, identifier, details) values
        (f_user_id, f_service, f_identifier, f_profile) returning id, user_id into v_matched_authentication_id, v_matched_user_id;
      insert into app_private.user_authentication_secrets (user_authentication_id, details) values
        (v_matched_authentication_id, f_auth_details);
      perform graphile_worker.add_job(
        'user__audit',
        json_build_object(
          'type', 'linked_account',
          'user_id', f_user_id,
          'extra1', f_service,
          'extra2', f_identifier,
          'current_user_id', app_public.current_user_id()
        ));
    elsif v_email is not null then
      -- See if the email is registered
      select * into v_user_email from app_public.user_emails where email = v_email and is_verified is true;
      if v_user_email is not null then
        -- User exists!
        insert into app_public.user_authentications (user_id, service, identifier, details) values
          (v_user_email.user_id, f_service, f_identifier, f_profile) returning id, user_id into v_matched_authentication_id, v_matched_user_id;
        insert into app_private.user_authentication_secrets (user_authentication_id, details) values
          (v_matched_authentication_id, f_auth_details);
        perform graphile_worker.add_job(
          'user__audit',
          json_build_object(
            'type', 'linked_account',
            'user_id', f_user_id,
            'extra1', f_service,
            'extra2', f_identifier,
            'current_user_id', app_public.current_user_id()
          ));
      end if;
    end if;
  end if;
  if v_matched_user_id is null and f_user_id is null and v_matched_authentication_id is null then
    -- Create and return a new user account
    return app_private.register_user(f_service, f_identifier, f_profile, f_auth_details, true);
  else
    if v_matched_authentication_id is not null then
      update app_public.user_authentications
        set details = f_profile
        where id = v_matched_authentication_id;
      update app_private.user_authentication_secrets
        set details = f_auth_details
        where user_authentication_id = v_matched_authentication_id;
      update app_public.users
        set
          name = coalesce(users.name, v_name),
          avatar_url = coalesce(users.avatar_url, v_avatar_url)
        where id = v_matched_user_id
        returning  * into v_user;
      return v_user;
    else
      -- v_matched_authentication_id is null
      -- -> v_matched_user_id is null (they're paired)
      -- -> f_user_id is not null (because the if clause above)
      -- -> v_matched_authentication_id is not null (because of the separate if block above creating a user_authentications)
      -- -> contradiction.
      raise exception 'This should not occur';
    end if;
  end if;
end;
$$;


--
-- Name: FUNCTION link_or_register_user(f_user_id uuid, f_service character varying, f_identifier character varying, f_profile json, f_auth_details json); Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON FUNCTION app_private.link_or_register_user(f_user_id uuid, f_service character varying, f_identifier character varying, f_profile json, f_auth_details json) IS 'If you''re logged in, this will link an additional OAuth login to your account if necessary. If you''re logged out it may find if an account already exists (based on OAuth details or email address) and return that, or create a new user account if necessary.';


--
-- Name: sessions; Type: TABLE; Schema: app_private; Owner: -
--

CREATE TABLE app_private.sessions (
    uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    last_active timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: login(public.citext, text); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.login(username public.citext, password text) RETURNS app_private.sessions
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: FUNCTION login(username public.citext, password text); Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON FUNCTION app_private.login(username public.citext, password text) IS 'Returns a user that matches the username/password combo, or null on failure.';


--
-- Name: really_create_user(public.citext, text, boolean, text, text, text); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.really_create_user(username public.citext, email text, email_is_verified boolean, name text, avatar_url text, password text DEFAULT NULL::text) RETURNS app_public.users
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_user app_public.users;
  v_username citext = username;
begin
  if password is not null then
    perform app_private.assert_valid_password(password);
  end if;
  if email is null then
    raise exception 'Email is required' using errcode = 'MODAT';
  end if;

  -- Insert the new user
  insert into app_public.users (username, name, avatar_url) values
    (v_username, name, avatar_url)
    returning * into v_user;

	-- Add the user's email
  insert into app_public.user_emails (user_id, email, is_verified, is_primary)
  values (v_user.id, email, email_is_verified, email_is_verified);

  -- Store the password
  if password is not null then
    update app_private.user_secrets
    set password_hash = crypt(password, gen_salt('bf'))
    where user_id = v_user.id;
  end if;

  -- Refresh the user
  select * into v_user from app_public.users where id = v_user.id;

  return v_user;
end;
$$;


--
-- Name: FUNCTION really_create_user(username public.citext, email text, email_is_verified boolean, name text, avatar_url text, password text); Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON FUNCTION app_private.really_create_user(username public.citext, email text, email_is_verified boolean, name text, avatar_url text, password text) IS 'Creates a user account. All arguments are optional, it trusts the calling method to perform sanitisation.';


--
-- Name: register_user(character varying, character varying, json, json, boolean); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.register_user(f_service character varying, f_identifier character varying, f_profile json, f_auth_details json, f_email_is_verified boolean DEFAULT false) RETURNS app_public.users
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_user app_public.users;
  v_email citext;
  v_name text;
  v_username citext;
  v_avatar_url text;
  v_user_authentication_id uuid;
begin
  -- Extract data from the user’s OAuth profile data.
  v_email := f_profile ->> 'email';
  v_name := f_profile ->> 'name';
  v_username := f_profile ->> 'username';
  v_avatar_url := f_profile ->> 'avatar_url';

  -- Sanitise the username, and make it unique if necessary.
  if v_username is null then
    v_username = coalesce(v_name, 'user');
  end if;
  v_username = regexp_replace(v_username, '^[^a-z]+', '', 'gi');
  v_username = regexp_replace(v_username, '[^a-z0-9]+', '_', 'gi');
  if v_username is null or length(v_username) < 3 then
    v_username = 'user';
  end if;
  select (
    case
    when i = 0 then v_username
    else v_username || i::text
    end
  ) into v_username from generate_series(0, 1000) i
  where not exists(
    select 1
    from app_public.users
    where users.username = (
      case
      when i = 0 then v_username
      else v_username || i::text
      end
    )
  )
  limit 1;

  -- Create the user account
  v_user = app_private.really_create_user(
    username => v_username,
    email => v_email,
    email_is_verified => f_email_is_verified,
    name => v_name,
    avatar_url => v_avatar_url
  );

  -- Insert the user’s private account data (e.g. OAuth tokens)
  insert into app_public.user_authentications (user_id, service, identifier, details) values
    (v_user.id, f_service, f_identifier, f_profile) returning id into v_user_authentication_id;
  insert into app_private.user_authentication_secrets (user_authentication_id, details) values
    (v_user_authentication_id, f_auth_details);

  return v_user;
end;
$$;


--
-- Name: FUNCTION register_user(f_service character varying, f_identifier character varying, f_profile json, f_auth_details json, f_email_is_verified boolean); Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON FUNCTION app_private.register_user(f_service character varying, f_identifier character varying, f_profile json, f_auth_details json, f_email_is_verified boolean) IS 'Used to register a user from information gleaned from OAuth. Primarily used by link_or_register_user';


--
-- Name: tg__add_audit_job(); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.tg__add_audit_job() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $_$
declare
  v_user_id uuid;
  v_type text = TG_ARGV[0];
  v_user_id_attribute text = TG_ARGV[1];
  v_extra_attribute1 text = TG_ARGV[2];
  v_extra_attribute2 text = TG_ARGV[3];
  v_extra_attribute3 text = TG_ARGV[4];
  v_extra1 text;
  v_extra2 text;
  v_extra3 text;
begin
  if v_user_id_attribute is null then
    raise exception 'Invalid tg__add_audit_job call';
  end if;

  execute 'select ($1.' || quote_ident(v_user_id_attribute) || ')::uuid'
    using (case when TG_OP = 'INSERT' then NEW else OLD end)
    into v_user_id;

  if v_extra_attribute1 is not null then
    execute 'select ($1.' || quote_ident(v_extra_attribute1) || ')::text'
      using (case when TG_OP = 'DELETE' then OLD else NEW end)
      into v_extra1;
  end if;
  if v_extra_attribute2 is not null then
    execute 'select ($1.' || quote_ident(v_extra_attribute2) || ')::text'
      using (case when TG_OP = 'DELETE' then OLD else NEW end)
      into v_extra2;
  end if;
  if v_extra_attribute3 is not null then
    execute 'select ($1.' || quote_ident(v_extra_attribute3) || ')::text'
      using (case when TG_OP = 'DELETE' then OLD else NEW end)
      into v_extra3;
  end if;

  if v_user_id is not null then
    perform graphile_worker.add_job(
      'user__audit',
      json_build_object(
        'type', v_type,
        'user_id', v_user_id,
        'extra1', v_extra1,
        'extra2', v_extra2,
        'extra3', v_extra3,
        'current_user_id', app_public.current_user_id(),
        'schema', TG_TABLE_SCHEMA,
        'table', TG_TABLE_NAME
      ));
  end if;

  return NEW;
end;
$_$;


--
-- Name: FUNCTION tg__add_audit_job(); Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON FUNCTION app_private.tg__add_audit_job() IS 'For notifying a user that an auditable action has taken place. Call with audit event name, user ID attribute name, and optionally another value to be included (e.g. the PK of the table, or some other relevant information). e.g. `tg__add_audit_job(''added_email'', ''user_id'', ''email'')`';


--
-- Name: tg__add_job(); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.tg__add_job() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  perform graphile_worker.add_job(tg_argv[0], json_build_object('id', NEW.id));
  return NEW;
end;
$$;


--
-- Name: FUNCTION tg__add_job(); Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON FUNCTION app_private.tg__add_job() IS 'Useful shortcut to create a job on insert/update. Pass the task name as the first trigger argument, and optionally the queue name as the second argument. The record id will automatically be available on the JSON payload.';


--
-- Name: tg__timestamps(); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.tg__timestamps() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  NEW.created_at = (case when TG_OP = 'INSERT' then NOW() else OLD.created_at end);
  NEW.updated_at = (case when TG_OP = 'UPDATE' and OLD.updated_at >= NOW() then OLD.updated_at + interval '1 millisecond' else NOW() end);
  return NEW;
end;
$$;


--
-- Name: FUNCTION tg__timestamps(); Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON FUNCTION app_private.tg__timestamps() IS 'This trigger should be called on all tables with created_at, updated_at - it ensures that they cannot be manipulated and that updated_at will always be larger than the previous updated_at.';


--
-- Name: tg_user_email_secrets__insert_with_user_email(); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.tg_user_email_secrets__insert_with_user_email() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_verification_token text;
begin
  if NEW.is_verified is false then
    v_verification_token = encode(gen_random_bytes(7), 'hex');
  end if;
  insert into app_private.user_email_secrets(user_email_id, verification_token) values(NEW.id, v_verification_token);
  return NEW;
end;
$$;


--
-- Name: FUNCTION tg_user_email_secrets__insert_with_user_email(); Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON FUNCTION app_private.tg_user_email_secrets__insert_with_user_email() IS 'Ensures that every user_email record has an associated user_email_secret record.';


--
-- Name: tg_user_secrets__insert_with_user(); Type: FUNCTION; Schema: app_private; Owner: -
--

CREATE FUNCTION app_private.tg_user_secrets__insert_with_user() RETURNS trigger
    LANGUAGE plpgsql
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  insert into app_private.user_secrets(user_id) values(NEW.id);
  return NEW;
end;
$$;


--
-- Name: FUNCTION tg_user_secrets__insert_with_user(); Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON FUNCTION app_private.tg_user_secrets__insert_with_user() IS 'Ensures that every user record has an associated user_secret record.';


--
-- Name: accept_invitation_to_organization(uuid, text); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.accept_invitation_to_organization(invitation_id uuid, code text DEFAULT NULL::text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: change_password(text, text); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.change_password(old_password text, new_password text) RETURNS boolean
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_user app_public.users;
  v_user_secret app_private.user_secrets;
begin
  select users.* into v_user
  from app_public.users
  where id = app_public.current_user_id();

  if not (v_user is null) then
    -- Load their secrets
    select * into v_user_secret from app_private.user_secrets
    where user_secrets.user_id = v_user.id;

    if v_user_secret.password_hash = crypt(old_password, v_user_secret.password_hash) then
      perform app_private.assert_valid_password(new_password);
      -- Reset the password as requested
      update app_private.user_secrets
      set
        password_hash = crypt(new_password, gen_salt('bf'))
      where user_secrets.user_id = v_user.id;
      perform graphile_worker.add_job(
        'user__audit',
        json_build_object(
          'type', 'change_password',
          'user_id', v_user.id,
          'current_user_id', app_public.current_user_id()
        ));
      return true;
    else
      raise exception 'Incorrect password' using errcode = 'CREDS';
    end if;
  else
    raise exception 'You must log in to change your password' using errcode = 'LOGIN';
  end if;
end;
$$;


--
-- Name: FUNCTION change_password(old_password text, new_password text); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.change_password(old_password text, new_password text) IS 'Enter your old password and a new password to change your password.';


--
-- Name: confirm_account_deletion(text); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.confirm_account_deletion(token text) RETURNS boolean
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_user_secret app_private.user_secrets;
  v_token_max_duration interval = interval '3 days';
begin
  if app_public.current_user_id() is null then
    raise exception 'You must log in to delete your account' using errcode = 'LOGIN';
  end if;

  select * into v_user_secret
    from app_private.user_secrets
    where user_secrets.user_id = app_public.current_user_id();

  if v_user_secret is null then
    -- Success: they're already deleted
    return true;
  end if;

  -- Check the token
  if (
    -- token is still valid
    v_user_secret.delete_account_token_generated > now() - v_token_max_duration
  and
    -- token matches
    v_user_secret.delete_account_token = token
  ) then
    -- Token passes; delete their account :(
    delete from app_public.users where id = app_public.current_user_id();
    return true;
  end if;

  raise exception 'The supplied token was incorrect - perhaps you''re logged in to the wrong account, or the token has expired?' using errcode = 'DNIED';
end;
$$;


--
-- Name: FUNCTION confirm_account_deletion(token text); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.confirm_account_deletion(token text) IS 'If you''re certain you want to delete your account, use `requestAccountDeletion` to request an account deletion token, and then supply the token through this mutation to complete account deletion.';


--
-- Name: organizations; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.organizations (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    slug public.citext NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: create_organization(public.citext, text); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.create_organization(slug public.citext, name text) RETURNS app_public.organizations
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_org app_public.organizations;
begin
  insert into app_public.organizations (slug, name) values (slug, name) returning * into v_org;
  insert into app_public.organization_memberships (organization_id, user_id, is_owner, is_billing_contact)
    values(v_org.id, app_public.current_user_id(), true, true);
  return v_org;
end;
$$;


--
-- Name: current_session_id(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.current_session_id() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select nullif(pg_catalog.current_setting('jwt.claims.session_id', true), '')::uuid;
$$;


--
-- Name: FUNCTION current_session_id(); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.current_session_id() IS 'Handy method to get the current session ID.';


--
-- Name: current_user(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public."current_user"() RETURNS app_public.users
    LANGUAGE sql STABLE
    AS $$
  select users.* from app_public.users where id = app_public.current_user_id();
$$;


--
-- Name: FUNCTION "current_user"(); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public."current_user"() IS 'The currently logged in user (or null if not logged in).';


--
-- Name: current_user_id(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.current_user_id() RETURNS uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
  select user_id from app_private.sessions where uuid = app_public.current_session_id();
$$;


--
-- Name: FUNCTION current_user_id(); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.current_user_id() IS 'Handy method to get the current user ID for use in RLS policies, etc; in GraphQL, use `currentUser{id}` instead.';


--
-- Name: current_user_invited_organization_ids(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.current_user_invited_organization_ids() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
  select organization_id from app_public.organization_invitations
    where user_id = app_public.current_user_id();
$$;


--
-- Name: current_user_member_organization_ids(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.current_user_member_organization_ids() RETURNS SETOF uuid
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
  select organization_id from app_public.organization_memberships
    where user_id = app_public.current_user_id();
$$;


--
-- Name: delete_organization(uuid); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.delete_organization(organization_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: forgot_password(public.citext); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.forgot_password(email public.citext) RETURNS void
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_user_email app_public.user_emails;
  v_token text;
  v_token_min_duration_between_emails interval = interval '3 minutes';
  v_token_max_duration interval = interval '3 days';
  v_now timestamptz = clock_timestamp(); -- Function can be called multiple during transaction
  v_latest_attempt timestamptz;
begin
  -- Find the matching user_email:
  select user_emails.* into v_user_email
  from app_public.user_emails
  where user_emails.email = forgot_password.email
  order by is_verified desc, id desc;

  -- If there is no match:
  if v_user_email is null then
    -- This email doesn't exist in the system; trigger an email stating as much.

    -- We do not allow this email to be triggered more than once every 15
    -- minutes, so we need to track it:
    insert into app_private.unregistered_email_password_resets (email, latest_attempt)
      values (forgot_password.email, v_now)
      on conflict on constraint unregistered_email_pkey
      do update
        set latest_attempt = v_now, attempts = unregistered_email_password_resets.attempts + 1
        where unregistered_email_password_resets.latest_attempt < v_now - interval '15 minutes'
      returning latest_attempt into v_latest_attempt;

    if v_latest_attempt = v_now then
      perform graphile_worker.add_job(
        'user__forgot_password_unregistered_email',
        json_build_object('email', forgot_password.email::text)
      );
    end if;

    -- TODO: we should clear out the unregistered_email_password_resets table periodically.

    return;
  end if;

  -- There was a match.
  -- See if we've triggered a reset recently:
  if exists(
    select 1
    from app_private.user_email_secrets
    where user_email_id = v_user_email.id
    and password_reset_email_sent_at is not null
    and password_reset_email_sent_at > v_now - v_token_min_duration_between_emails
  ) then
    -- If so, take no action.
    return;
  end if;

  -- Fetch or generate reset token:
  update app_private.user_secrets
  set
    reset_password_token = (
      case
      when reset_password_token is null or reset_password_token_generated < v_now - v_token_max_duration
      then encode(gen_random_bytes(7), 'hex')
      else reset_password_token
      end
    ),
    reset_password_token_generated = (
      case
      when reset_password_token is null or reset_password_token_generated < v_now - v_token_max_duration
      then v_now
      else reset_password_token_generated
      end
    )
  where user_id = v_user_email.user_id
  returning reset_password_token into v_token;

  -- Don't allow spamming an email:
  update app_private.user_email_secrets
  set password_reset_email_sent_at = v_now
  where user_email_id = v_user_email.id;

  -- Trigger email send:
  perform graphile_worker.add_job(
    'user__forgot_password',
    json_build_object('id', v_user_email.user_id, 'email', v_user_email.email::text, 'token', v_token)
  );

end;
$$;


--
-- Name: FUNCTION forgot_password(email public.citext); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.forgot_password(email public.citext) IS 'If you''ve forgotten your password, give us one of your email addresses and we''ll send you a reset token. Note this only works if you have added an email address!';


--
-- Name: invite_to_organization(uuid, public.citext, public.citext); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.invite_to_organization(organization_id uuid, username public.citext DEFAULT NULL::public.citext, email public.citext DEFAULT NULL::public.citext) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: logout(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.logout() RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  -- Delete the session
  delete from app_private.sessions where uuid = app_public.current_session_id();
  -- Clear the identifier from the transaction
  perform set_config('jwt.claims.session_id', '', true);
end;
$$;


--
-- Name: user_emails; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.user_emails (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id uuid DEFAULT app_public.current_user_id() NOT NULL,
    email public.citext NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_primary boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT user_emails_email_check CHECK ((email OPERATOR(public.~) '[^@]+@[^@]+\.[^@]+'::public.citext)),
    CONSTRAINT user_emails_must_be_verified_to_be_primary CHECK (((is_primary IS FALSE) OR (is_verified IS TRUE)))
);


--
-- Name: TABLE user_emails; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON TABLE app_public.user_emails IS 'Information about a user''s email address.';


--
-- Name: COLUMN user_emails.email; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.user_emails.email IS 'The users email address, in `a@b.c` format.';


--
-- Name: COLUMN user_emails.is_verified; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.user_emails.is_verified IS 'True if the user has is_verified their email address (by clicking the link in the email we sent them, or logging in with a social login provider), false otherwise.';


--
-- Name: make_email_primary(uuid); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.make_email_primary(email_id uuid) RETURNS app_public.user_emails
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: FUNCTION make_email_primary(email_id uuid); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.make_email_primary(email_id uuid) IS 'Your primary email is where we''ll notify of account events; other emails may be used for discovery or login. Use this when you''re changing your email address.';


--
-- Name: organization_for_invitation(uuid, text); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.organization_for_invitation(invitation_id uuid, code text DEFAULT NULL::text) RETURNS app_public.organizations
    LANGUAGE plpgsql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: organizations_current_user_is_billing_contact(app_public.organizations); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.organizations_current_user_is_billing_contact(org app_public.organizations) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  select exists(
    select 1
    from app_public.organization_memberships
    where organization_id = org.id
    and user_id = app_public.current_user_id()
    and is_billing_contact is true
  )
$$;


--
-- Name: organizations_current_user_is_owner(app_public.organizations); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.organizations_current_user_is_owner(org app_public.organizations) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  select exists(
    select 1
    from app_public.organization_memberships
    where organization_id = org.id
    and user_id = app_public.current_user_id()
    and is_owner is true
  )
$$;


--
-- Name: remove_from_organization(uuid, uuid); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.remove_from_organization(organization_id uuid, user_id uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: request_account_deletion(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.request_account_deletion() RETURNS boolean
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_user_email app_public.user_emails;
  v_token text;
  v_token_max_duration interval = interval '3 days';
begin
  if app_public.current_user_id() is null then
    raise exception 'You must log in to delete your account' using errcode = 'LOGIN';
  end if;

  -- Get the email to send account deletion token to
  select * into v_user_email
    from app_public.user_emails
    where user_id = app_public.current_user_id()
    order by is_primary desc, is_verified desc, id desc
    limit 1;

  -- Fetch or generate token
  update app_private.user_secrets
  set
    delete_account_token = (
      case
      when delete_account_token is null or delete_account_token_generated < NOW() - v_token_max_duration
      then encode(gen_random_bytes(7), 'hex')
      else delete_account_token
      end
    ),
    delete_account_token_generated = (
      case
      when delete_account_token is null or delete_account_token_generated < NOW() - v_token_max_duration
      then now()
      else delete_account_token_generated
      end
    )
  where user_id = app_public.current_user_id()
  returning delete_account_token into v_token;

  -- Trigger email send
  perform graphile_worker.add_job('user__send_delete_account_email', json_build_object('email', v_user_email.email::text, 'token', v_token));
  return true;
end;
$$;


--
-- Name: FUNCTION request_account_deletion(); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.request_account_deletion() IS 'Begin the account deletion flow by requesting the confirmation email';


--
-- Name: resend_email_verification_code(uuid); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.resend_email_verification_code(email_id uuid) RETURNS boolean
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: FUNCTION resend_email_verification_code(email_id uuid); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.resend_email_verification_code(email_id uuid) IS 'If you didn''t receive the verification code for this email, we can resend it. We silently cap the rate of resends on the backend, so calls to this function may not result in another email being sent if it has been called recently.';


--
-- Name: reset_password(uuid, text, text); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.reset_password(user_id uuid, reset_token text, new_password text) RETURNS boolean
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
declare
  v_user app_public.users;
  v_user_secret app_private.user_secrets;
  v_token_max_duration interval = interval '3 days';
begin
  select users.* into v_user
  from app_public.users
  where id = user_id;

  if not (v_user is null) then
    -- Load their secrets
    select * into v_user_secret from app_private.user_secrets
    where user_secrets.user_id = v_user.id;

    -- Have there been too many reset attempts?
    if (
      v_user_secret.first_failed_reset_password_attempt is not null
    and
      v_user_secret.first_failed_reset_password_attempt > NOW() - v_token_max_duration
    and
      v_user_secret.failed_reset_password_attempts >= 20
    ) then
      raise exception 'Password reset locked - too many reset attempts' using errcode = 'LOCKD';
    end if;

    -- Not too many reset attempts, let's check the token
    if v_user_secret.reset_password_token = reset_token then
      -- Excellent - they're legit
      perform app_private.assert_valid_password(new_password);
      -- Let's reset the password as requested
      update app_private.user_secrets
      set
        password_hash = crypt(new_password, gen_salt('bf')),
        failed_password_attempts = 0,
        first_failed_password_attempt = null,
        reset_password_token = null,
        reset_password_token_generated = null,
        failed_reset_password_attempts = 0,
        first_failed_reset_password_attempt = null
      where user_secrets.user_id = v_user.id;
      perform graphile_worker.add_job(
        'user__audit',
        json_build_object(
          'type', 'reset_password',
          'user_id', v_user.id,
          'current_user_id', app_public.current_user_id()
        ));
      return true;
    else
      -- Wrong token, bump all the attempt tracking figures
      update app_private.user_secrets
      set
        failed_reset_password_attempts = (case when first_failed_reset_password_attempt is null or first_failed_reset_password_attempt < now() - v_token_max_duration then 1 else failed_reset_password_attempts + 1 end),
        first_failed_reset_password_attempt = (case when first_failed_reset_password_attempt is null or first_failed_reset_password_attempt < now() - v_token_max_duration then now() else first_failed_reset_password_attempt end)
      where user_secrets.user_id = v_user.id;
      return null;
    end if;
  else
    -- No user with that id was found
    return null;
  end if;
end;
$$;


--
-- Name: FUNCTION reset_password(user_id uuid, reset_token text, new_password text); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.reset_password(user_id uuid, reset_token text, new_password text) IS 'After triggering forgotPassword, you''ll be sent a reset token. Combine this with your user ID and a new password to reset your password.';


--
-- Name: tg__graphql_subscription(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.tg__graphql_subscription() RETURNS trigger
    LANGUAGE plpgsql
    AS $_$
declare
  v_process_new bool = (TG_OP = 'INSERT' OR TG_OP = 'UPDATE');
  v_process_old bool = (TG_OP = 'UPDATE' OR TG_OP = 'DELETE');
  v_event text = TG_ARGV[0];
  v_topic_template text = TG_ARGV[1];
  v_attribute text = TG_ARGV[2];
  v_record record;
  v_sub text;
  v_topic text;
  v_i int = 0;
  v_last_topic text;
begin
  for v_i in 0..1 loop
    if (v_i = 0) and v_process_new is true then
      v_record = new;
    elsif (v_i = 1) and v_process_old is true then
      v_record = old;
    else
      continue;
    end if;
     if v_attribute is not null then
      execute 'select $1.' || quote_ident(v_attribute)
        using v_record
        into v_sub;
    end if;
    if v_sub is not null then
      v_topic = replace(v_topic_template, '$1', v_sub);
    else
      v_topic = v_topic_template;
    end if;
    if v_topic is distinct from v_last_topic then
      -- This if statement prevents us from triggering the same notification twice
      v_last_topic = v_topic;
      perform pg_notify(v_topic, json_build_object(
        'event', v_event,
        'subject', v_sub
      )::text);
    end if;
  end loop;
  return v_record;
end;
$_$;


--
-- Name: FUNCTION tg__graphql_subscription(); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.tg__graphql_subscription() IS 'This function enables the creation of simple focussed GraphQL subscriptions using database triggers. Read more here: https://www.graphile.org/postgraphile/subscriptions/#custom-subscriptions';


--
-- Name: tg_user_emails__forbid_if_verified(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.tg_user_emails__forbid_if_verified() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  if exists(select 1 from app_public.user_emails where email = NEW.email and is_verified is true) then
    raise exception 'An account using that email address has already been created.' using errcode='EMTKN';
  end if;
  return NEW;
end;
$$;


--
-- Name: tg_user_emails__prevent_delete_last_email(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.tg_user_emails__prevent_delete_last_email() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  if exists (
    with remaining as (
      select user_emails.user_id
      from app_public.user_emails
      inner join deleted
      on user_emails.user_id = deleted.user_id
      -- Don't delete last verified email
      where (user_emails.is_verified is true or not exists (
        select 1
        from deleted d2
        where d2.user_id = user_emails.user_id
        and d2.is_verified is true
      ))
      order by user_emails.id asc

      /*
       * Lock this table to prevent race conditions; see:
       * https://www.cybertec-postgresql.com/en/triggers-to-enforce-constraints/
       */
      for update of user_emails
    )
    select 1
    from app_public.users
    where id in (
      select user_id from deleted
      except
      select user_id from remaining
    )
  )
  then
    raise exception 'You must have at least one (verified) email address' using errcode = 'CDLEA';
  end if;

  return null;
end;
$$;


--
-- Name: tg_user_emails__verify_account_on_verified(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.tg_user_emails__verify_account_on_verified() RETURNS trigger
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  update app_public.users set is_verified = true where id = new.user_id and is_verified is false;
  return new;
end;
$$;


--
-- Name: tg_users__deletion_organization_checks_and_actions(); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.tg_users__deletion_organization_checks_and_actions() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
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
$$;


--
-- Name: transfer_organization_billing_contact(uuid, uuid); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.transfer_organization_billing_contact(organization_id uuid, user_id uuid) RETURNS app_public.organizations
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: transfer_organization_ownership(uuid, uuid); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.transfer_organization_ownership(organization_id uuid, user_id uuid) RETURNS app_public.organizations
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
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
$$;


--
-- Name: users_has_password(app_public.users); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.users_has_password(u app_public.users) RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
  select (password_hash is not null) from app_private.user_secrets where user_secrets.user_id = u.id and u.id = app_public.current_user_id();
$$;


--
-- Name: verify_email(uuid, text); Type: FUNCTION; Schema: app_public; Owner: -
--

CREATE FUNCTION app_public.verify_email(user_email_id uuid, token text) RETURNS boolean
    LANGUAGE plpgsql STRICT SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public', 'pg_temp'
    AS $$
begin
  update app_public.user_emails
  set
    is_verified = true,
    is_primary = is_primary or not exists(
      select 1 from app_public.user_emails other_email where other_email.user_id = user_emails.user_id and other_email.is_primary is true
    )
  where id = user_email_id
  and exists(
    select 1 from app_private.user_email_secrets where user_email_secrets.user_email_id = user_emails.id and verification_token = token
  );
  return found;
end;
$$;


--
-- Name: FUNCTION verify_email(user_email_id uuid, token text); Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON FUNCTION app_public.verify_email(user_email_id uuid, token text) IS 'Once you have received a verification token for your email, you may call this mutation with that token to make your email verified.';


--
-- Name: audit_table(regclass); Type: FUNCTION; Schema: audit; Owner: -
--

CREATE FUNCTION audit.audit_table(target_table regclass) RETURNS void
    LANGUAGE sql
    AS $_$
SELECT audit.audit_table($1, BOOLEAN 't', BOOLEAN 't');
$_$;


--
-- Name: FUNCTION audit_table(target_table regclass); Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON FUNCTION audit.audit_table(target_table regclass) IS '
Add auditing support to the given table. Row-level changes will be logged with full client query text. No cols are ignored.
';


--
-- Name: audit_table(regclass, boolean, boolean); Type: FUNCTION; Schema: audit; Owner: -
--

CREATE FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean) RETURNS void
    LANGUAGE sql
    AS $_$
SELECT audit.audit_table($1, $2, $3, ARRAY[]::text[]);
$_$;


--
-- Name: audit_table(regclass, boolean, boolean, text[]); Type: FUNCTION; Schema: audit; Owner: -
--

CREATE FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean, ignored_cols text[]) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
  stm_targets text = 'INSERT OR UPDATE OR DELETE OR TRUNCATE';
  _q_txt text;
  _ignored_cols_snip text = '';
BEGIN
    EXECUTE 'DROP TRIGGER IF EXISTS audit_trigger_row ON ' || quote_ident(target_table::TEXT);
    EXECUTE 'DROP TRIGGER IF EXISTS audit_trigger_stm ON ' || quote_ident(target_table::TEXT);

    IF audit_rows THEN
        IF array_length(ignored_cols,1) > 0 THEN
            _ignored_cols_snip = ', ' || quote_literal(ignored_cols);
        END IF;
        _q_txt = 'CREATE TRIGGER audit_trigger_row AFTER INSERT OR UPDATE OR DELETE ON ' ||
                 quote_ident(target_table::TEXT) ||
                 ' FOR EACH ROW EXECUTE PROCEDURE audit.if_modified_func(' ||
                 quote_literal(audit_query_text) || _ignored_cols_snip || ');';
        RAISE NOTICE '%',_q_txt;
        EXECUTE _q_txt;
        stm_targets = 'TRUNCATE';
    ELSE
    END IF;

    _q_txt = 'CREATE TRIGGER audit_trigger_stm AFTER ' || stm_targets || ' ON ' ||
             target_table ||
             ' FOR EACH STATEMENT EXECUTE PROCEDURE audit.if_modified_func('||
             quote_literal(audit_query_text) || ');';
    RAISE NOTICE '%',_q_txt;
    EXECUTE _q_txt;

END;
$$;


--
-- Name: FUNCTION audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean, ignored_cols text[]); Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean, ignored_cols text[]) IS '
Add auditing support to a table.

Arguments:
   target_table:     Table name, schema qualified if not on search_path
   audit_rows:       Record each row change, or only audit at a statement level
   audit_query_text: Record the text of the client query that triggered the audit event?
   ignored_cols:     Columns to exclude from update diffs, ignore updates that change only ignored cols.
';


--
-- Name: if_modified_func(); Type: FUNCTION; Schema: audit; Owner: -
--

CREATE FUNCTION audit.if_modified_func() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'pg_catalog', 'public'
    AS $$
DECLARE
    audit_row audit.logged_actions;
    include_values boolean;
    log_diffs boolean;
    h_old hstore;
    h_new hstore;
    excluded_cols text[] = ARRAY[]::text[];
BEGIN
    IF TG_WHEN <> 'AFTER' THEN
        RAISE EXCEPTION 'audit.if_modified_func() may only run as an AFTER trigger';
    END IF;

    audit_row = ROW(
        nextval('audit.logged_actions_event_id_seq'), -- event_id
        TG_TABLE_SCHEMA::text,                        -- schema_name
        TG_TABLE_NAME::text,                          -- table_name
        TG_RELID,                                     -- relation OID for much quicker searches
        session_user::text,                           -- session_user_name
        current_timestamp,                            -- action_tstamp_tx
        statement_timestamp(),                        -- action_tstamp_stm
        clock_timestamp(),                            -- action_tstamp_clk
        txid_current(),                               -- transaction ID
        current_setting('application_name'),          -- client application
        inet_client_addr(),                           -- client_addr
        inet_client_port(),                           -- client_port
        current_query(),                              -- top-level query or queries (if multistatement) from client
        substring(TG_OP,1,1),                         -- action
        NULL, NULL,                                   -- row_data, changed_fields
        'f'                                           -- statement_only
        );

    IF NOT TG_ARGV[0]::boolean IS DISTINCT FROM 'f'::boolean THEN
        audit_row.client_query = NULL;
    END IF;

    IF TG_ARGV[1] IS NOT NULL THEN
        excluded_cols = TG_ARGV[1]::text[];
    END IF;

    IF (TG_OP = 'UPDATE' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(OLD.*) - excluded_cols;
        audit_row.changed_fields =  (hstore(NEW.*) - audit_row.row_data) - excluded_cols;
        IF audit_row.changed_fields = hstore('') THEN
            -- All changed fields are ignored. Skip this update.
            RETURN NULL;
        END IF;
    ELSIF (TG_OP = 'DELETE' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(OLD.*) - excluded_cols;
    ELSIF (TG_OP = 'INSERT' AND TG_LEVEL = 'ROW') THEN
        audit_row.row_data = hstore(NEW.*) - excluded_cols;
    ELSIF (TG_LEVEL = 'STATEMENT' AND TG_OP IN ('INSERT','UPDATE','DELETE','TRUNCATE')) THEN
        audit_row.statement_only = 't';
    ELSE
        RAISE EXCEPTION '[audit.if_modified_func] - Trigger func added as trigger for unhandled case: %, %',TG_OP, TG_LEVEL;
        RETURN NULL;
    END IF;
    INSERT INTO audit.logged_actions VALUES (audit_row.*);
    RETURN NULL;
END;
$$;


--
-- Name: FUNCTION if_modified_func(); Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON FUNCTION audit.if_modified_func() IS '
Track changes to a table at the statement and/or row level.

Optional parameters to trigger in CREATE TRIGGER call:

param 0: boolean, whether to log the query text. Default ''t''.

param 1: text[], columns to ignore in updates. Default [].

         Updates to ignored cols are omitted from changed_fields.

         Updates with only ignored cols changed are not inserted
         into the audit log.

         Almost all the processing work is still done for updates
         that ignored. If you need to save the load, you need to use
         WHEN clause on the trigger instead.

         No warning or error is issued if ignored_cols contains columns
         that do not exist in the target table. This lets you specify
         a standard set of ignored columns.

There is no parameter to disable logging of values. Add this trigger as
a ''FOR EACH STATEMENT'' rather than ''FOR EACH ROW'' trigger if you do not
want to log row values.

Note that the user name logged is the login role for the session. The audit trigger
cannot obtain the active role because it is reset by the SECURITY DEFINER invocation
of the audit trigger its self.
';


--
-- Name: connect_pg_simple_sessions; Type: TABLE; Schema: app_private; Owner: -
--

CREATE TABLE app_private.connect_pg_simple_sessions (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp without time zone NOT NULL
);


--
-- Name: unregistered_email_password_resets; Type: TABLE; Schema: app_private; Owner: -
--

CREATE TABLE app_private.unregistered_email_password_resets (
    email public.citext NOT NULL,
    attempts integer DEFAULT 1 NOT NULL,
    latest_attempt timestamp with time zone NOT NULL
);


--
-- Name: TABLE unregistered_email_password_resets; Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON TABLE app_private.unregistered_email_password_resets IS 'If someone tries to recover the password for an email that is not registered in our system, this table enables us to rate-limit outgoing emails to avoid spamming.';


--
-- Name: COLUMN unregistered_email_password_resets.attempts; Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON COLUMN app_private.unregistered_email_password_resets.attempts IS 'We store the number of attempts to help us detect accounts being attacked.';


--
-- Name: COLUMN unregistered_email_password_resets.latest_attempt; Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON COLUMN app_private.unregistered_email_password_resets.latest_attempt IS 'We store the time the last password reset was sent to this email to prevent the email getting flooded.';


--
-- Name: user_authentication_secrets; Type: TABLE; Schema: app_private; Owner: -
--

CREATE TABLE app_private.user_authentication_secrets (
    user_authentication_id uuid NOT NULL,
    details jsonb DEFAULT '{}'::jsonb NOT NULL
);


--
-- Name: user_email_secrets; Type: TABLE; Schema: app_private; Owner: -
--

CREATE TABLE app_private.user_email_secrets (
    user_email_id uuid NOT NULL,
    verification_token text,
    verification_email_sent_at timestamp with time zone,
    password_reset_email_sent_at timestamp with time zone
);


--
-- Name: TABLE user_email_secrets; Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON TABLE app_private.user_email_secrets IS 'The contents of this table should never be visible to the user. Contains data mostly related to email verification and avoiding spamming users.';


--
-- Name: COLUMN user_email_secrets.password_reset_email_sent_at; Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON COLUMN app_private.user_email_secrets.password_reset_email_sent_at IS 'We store the time the last password reset was sent to this email to prevent the email getting flooded.';


--
-- Name: user_secrets; Type: TABLE; Schema: app_private; Owner: -
--

CREATE TABLE app_private.user_secrets (
    user_id uuid NOT NULL,
    password_hash text,
    last_login_at timestamp with time zone DEFAULT now() NOT NULL,
    failed_password_attempts integer DEFAULT 0 NOT NULL,
    first_failed_password_attempt timestamp with time zone,
    reset_password_token text,
    reset_password_token_generated timestamp with time zone,
    failed_reset_password_attempts integer DEFAULT 0 NOT NULL,
    first_failed_reset_password_attempt timestamp with time zone,
    delete_account_token text,
    delete_account_token_generated timestamp with time zone
);


--
-- Name: TABLE user_secrets; Type: COMMENT; Schema: app_private; Owner: -
--

COMMENT ON TABLE app_private.user_secrets IS 'The contents of this table should never be visible to the user. Contains data mostly related to authentication.';


--
-- Name: accounts; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.accounts (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    contact uuid NOT NULL,
    bank_name text NOT NULL,
    bic text DEFAULT ''::text,
    account text DEFAULT ''::text,
    blz text DEFAULT ''::text,
    iban text NOT NULL,
    creditor uuid NOT NULL,
    sign_date date,
    state app_public.accounts_state DEFAULT 'new'::app_public.accounts_state,
    creation_date timestamp with time zone DEFAULT now() NOT NULL,
    edited_by uuid NOT NULL,
    last_locktime timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: activity; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.activity (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    result text,
    request text NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: COLUMN activity.request; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.activity.request IS 'DbQuery';


--
-- Name: bank_transfers; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.bank_transfers (
    ag_name text NOT NULL,
    ag_konto_or_iban text NOT NULL,
    ag_blz_or_bic text NOT NULL,
    zahlpfl_name text NOT NULL,
    zahlpfl_name2 text,
    zahlpfl_strasse text NOT NULL,
    zahlpfl_name_ort text NOT NULL,
    zahlpfl_name_kto_or_iban text NOT NULL,
    zahlpfl_name_blz_or_bic text,
    betrag double precision,
    currency text DEFAULT '€'::text,
    zahlart text DEFAULT 'BASIS'::text NOT NULL,
    termin date NOT NULL,
    vwz1 text DEFAULT ''::text,
    vwz2 text DEFAULT ''::text,
    vwz3 text DEFAULT ''::text,
    vwz4 text DEFAULT ''::text,
    vwz5 text DEFAULT ''::text,
    vwz6 text DEFAULT ''::text,
    vwz7 text DEFAULT ''::text,
    vwz8 text DEFAULT ''::text,
    vwz9 text DEFAULT ''::text,
    ba_id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    tracking_status app_public.bank_transfers_tracking_status DEFAULT 'neu'::app_public.bank_transfers_tracking_status NOT NULL,
    anforderungs_datum date NOT NULL,
    rueck_datum date,
    cycle text NOT NULL,
    ref_id text NOT NULL,
    mandat_id text NOT NULL,
    mandat_datum date NOT NULL,
    ag_creditor_id text NOT NULL,
    sequenz text NOT NULL,
    super_ag_name text NOT NULL
);


--
-- Name: contacts; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.contacts (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mandator uuid NOT NULL,
    creation_date timestamp with time zone DEFAULT now() NOT NULL,
    state text DEFAULT 'contact'::text,
    use_email boolean DEFAULT false,
    company_name text DEFAULT ''::text,
    co_field text DEFAULT ''::text,
    phone_code text DEFAULT 49,
    phone_number text DEFAULT ''::text,
    fax text DEFAULT ''::text,
    title text DEFAULT ''::text,
    title_pro text DEFAULT ''::text,
    first_name text DEFAULT ''::text,
    last_name text DEFAULT ''::text,
    address text DEFAULT ''::text,
    address_2 text DEFAULT ''::text,
    city text DEFAULT ''::text,
    postal_code text DEFAULT ''::text,
    country_code text DEFAULT ''::text,
    gender text DEFAULT ''::text,
    date_of_birth date,
    mobile text DEFAULT ''::text,
    email text DEFAULT ''::text,
    comments text DEFAULT ''::text,
    edited_by uuid NOT NULL,
    merged bigint[],
    last_locktime timestamp with time zone DEFAULT now() NOT NULL,
    owner uuid
);


--
-- Name: COLUMN contacts.title_pro; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.contacts.title_pro IS 'professional title';


--
-- Name: deals; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.deals (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    contact uuid NOT NULL,
    creation_date timestamp with time zone DEFAULT now() NOT NULL,
    account uuid,
    target_account uuid NOT NULL,
    start_day text DEFAULT '1'::text,
    start_date date,
    cycle app_public.deals_cycle NOT NULL,
    amount numeric(10,2) NOT NULL,
    product uuid NOT NULL,
    agent uuid,
    project uuid,
    status text DEFAULT 'active'::text,
    pay_method text DEFAULT 'debit'::text,
    end_date date,
    end_reason uuid,
    repeat_date date,
    edited_by uuid NOT NULL,
    mandator uuid,
    old_active boolean,
    cycle_start_date date,
    last_locktime timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: end_reasons; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.end_reasons (
    id uuid,
    reason text NOT NULL,
    edited_by uuid NOT NULL,
    mandator uuid NOT NULL
);


--
-- Name: mandators; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.mandators (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    contact uuid NOT NULL,
    name text NOT NULL,
    description text,
    info jsonb DEFAULT '{}'::jsonb,
    edited_by uuid NOT NULL,
    parent uuid,
    last_locktime timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: organization_invitations; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.organization_invitations (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    code text,
    user_id uuid,
    email public.citext,
    CONSTRAINT organization_invitations_check CHECK (((user_id IS NULL) <> (email IS NULL))),
    CONSTRAINT organization_invitations_check1 CHECK (((code IS NULL) = (email IS NULL)))
);


--
-- Name: organization_memberships; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.organization_memberships (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    user_id uuid NOT NULL,
    is_owner boolean DEFAULT false NOT NULL,
    is_billing_contact boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: products; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.products (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    value numeric(10,2),
    attributes jsonb DEFAULT '{}'::jsonb,
    mandator uuid NOT NULL,
    active boolean,
    edited_by uuid NOT NULL
);


--
-- Name: projects; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.projects (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    mandator uuid NOT NULL,
    name text NOT NULL,
    description text,
    edited_by uuid NOT NULL,
    provision_percent double precision DEFAULT (0.0)::double precision,
    cancellation_liable integer DEFAULT 0,
    target_account uuid NOT NULL
);


--
-- Name: roles; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.roles (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text DEFAULT ''::text,
    permissions jsonb DEFAULT '{"users": [], "groups": [], "routes": []}'::jsonb NOT NULL,
    edited_by uuid NOT NULL,
    mandator uuid NOT NULL
);


--
-- Name: statements; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.statements (
    a text,
    b text,
    c date NOT NULL,
    d date NOT NULL,
    e double precision NOT NULL,
    f text,
    g text,
    h text,
    i text,
    j text,
    k text,
    l text,
    m text,
    n text,
    o text,
    p text,
    q text,
    r text,
    s text,
    t text,
    u text,
    v text,
    w text,
    x text,
    y text,
    z text,
    aa text,
    processed boolean DEFAULT false NOT NULL,
    kid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    edited_by uuid NOT NULL,
    mandator uuid
);


--
-- Name: user_authentications; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.user_authentications (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    service text NOT NULL,
    identifier text NOT NULL,
    details jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: TABLE user_authentications; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON TABLE app_public.user_authentications IS 'Contains information about the login providers this user has used, so that they may disconnect them should they wish.';


--
-- Name: COLUMN user_authentications.service; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.user_authentications.service IS 'The login service used, e.g. `twitter` or `github`.';


--
-- Name: COLUMN user_authentications.identifier; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.user_authentications.identifier IS 'A unique identifier for the user within the login service.';


--
-- Name: COLUMN user_authentications.details; Type: COMMENT; Schema: app_public; Owner: -
--

COMMENT ON COLUMN app_public.user_authentications.details IS 'Additional profile details extracted from this login method';


--
-- Name: user_groups; Type: TABLE; Schema: app_public; Owner: -
--

CREATE TABLE app_public.user_groups (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    can jsonb DEFAULT '{}'::jsonb,
    mandator uuid NOT NULL,
    edited_by uuid NOT NULL
);


--
-- Name: logged_actions; Type: TABLE; Schema: audit; Owner: -
--

CREATE TABLE audit.logged_actions (
    event_id bigint NOT NULL,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    relid oid NOT NULL,
    session_user_name text,
    action_tstamp_tx timestamp with time zone NOT NULL,
    action_tstamp_stm timestamp with time zone NOT NULL,
    action_tstamp_clk timestamp with time zone NOT NULL,
    transaction_id bigint,
    application_name text,
    client_addr inet,
    client_port integer,
    client_query text,
    action text NOT NULL,
    row_data public.hstore,
    changed_fields public.hstore,
    statement_only boolean NOT NULL,
    CONSTRAINT logged_actions_action_check CHECK ((action = ANY (ARRAY['I'::text, 'D'::text, 'U'::text, 'T'::text])))
);


--
-- Name: TABLE logged_actions; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON TABLE audit.logged_actions IS 'History of auditable actions on audited tables, from audit.if_modified_func()';


--
-- Name: COLUMN logged_actions.event_id; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.event_id IS 'Unique identifier for each auditable event';


--
-- Name: COLUMN logged_actions.schema_name; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.schema_name IS 'Database schema audited table for this event is in';


--
-- Name: COLUMN logged_actions.table_name; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.table_name IS 'Non-schema-qualified table name of table event occured in';


--
-- Name: COLUMN logged_actions.relid; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.relid IS 'Table OID. Changes with drop/create. Get with ''tablename''::regclass';


--
-- Name: COLUMN logged_actions.session_user_name; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.session_user_name IS 'Login / session user whose statement caused the audited event';


--
-- Name: COLUMN logged_actions.action_tstamp_tx; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.action_tstamp_tx IS 'Transaction start timestamp for tx in which audited event occurred';


--
-- Name: COLUMN logged_actions.action_tstamp_stm; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.action_tstamp_stm IS 'Statement start timestamp for tx in which audited event occurred';


--
-- Name: COLUMN logged_actions.action_tstamp_clk; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.action_tstamp_clk IS 'Wall clock time at which audited event''s trigger call occurred';


--
-- Name: COLUMN logged_actions.transaction_id; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.transaction_id IS 'Identifier of transaction that made the change. May wrap, but unique paired with action_tstamp_tx.';


--
-- Name: COLUMN logged_actions.application_name; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.application_name IS 'Application name set when this audit event occurred. Can be changed in-session by client.';


--
-- Name: COLUMN logged_actions.client_addr; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.client_addr IS 'IP address of client that issued query. Null for unix domain socket.';


--
-- Name: COLUMN logged_actions.client_port; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.client_port IS 'Remote peer IP port address of client that issued query. Undefined for unix socket.';


--
-- Name: COLUMN logged_actions.client_query; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.client_query IS 'Top-level query that caused this auditable event. May be more than one statement.';


--
-- Name: COLUMN logged_actions.action; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.action IS 'Action type; I = insert, D = delete, U = update, T = truncate';


--
-- Name: COLUMN logged_actions.row_data; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.row_data IS 'Record value. Null for statement-level trigger. For INSERT this is the new tuple. For DELETE and UPDATE it is the old tuple.';


--
-- Name: COLUMN logged_actions.changed_fields; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.changed_fields IS 'New values of fields changed by UPDATE. Null except for row-level UPDATE events.';


--
-- Name: COLUMN logged_actions.statement_only; Type: COMMENT; Schema: audit; Owner: -
--

COMMENT ON COLUMN audit.logged_actions.statement_only IS '''t'' if audit event is from an FOR EACH STATEMENT trigger, ''f'' for FOR EACH ROW';


--
-- Name: logged_actions_event_id_seq; Type: SEQUENCE; Schema: audit; Owner: -
--

CREATE SEQUENCE audit.logged_actions_event_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: logged_actions_event_id_seq; Type: SEQUENCE OWNED BY; Schema: audit; Owner: -
--

ALTER SEQUENCE audit.logged_actions_event_id_seq OWNED BY audit.logged_actions.event_id;


--
-- Name: logged_actions event_id; Type: DEFAULT; Schema: audit; Owner: -
--

ALTER TABLE ONLY audit.logged_actions ALTER COLUMN event_id SET DEFAULT nextval('audit.logged_actions_event_id_seq'::regclass);


--
-- Name: connect_pg_simple_sessions session_pkey; Type: CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.connect_pg_simple_sessions
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (uuid);


--
-- Name: unregistered_email_password_resets unregistered_email_pkey; Type: CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.unregistered_email_password_resets
    ADD CONSTRAINT unregistered_email_pkey PRIMARY KEY (email);


--
-- Name: user_authentication_secrets user_authentication_secrets_pkey; Type: CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.user_authentication_secrets
    ADD CONSTRAINT user_authentication_secrets_pkey PRIMARY KEY (user_authentication_id);


--
-- Name: user_email_secrets user_email_secrets_pkey; Type: CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.user_email_secrets
    ADD CONSTRAINT user_email_secrets_pkey PRIMARY KEY (user_email_id);


--
-- Name: user_secrets user_secrets_pkey; Type: CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.user_secrets
    ADD CONSTRAINT user_secrets_pkey PRIMARY KEY (user_id);


--
-- Name: accounts accounts_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.accounts
    ADD CONSTRAINT accounts_pkey PRIMARY KEY (id);


--
-- Name: activity activity_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.activity
    ADD CONSTRAINT activity_pkey PRIMARY KEY (id);


--
-- Name: bank_transfers bank_transfers_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.bank_transfers
    ADD CONSTRAINT bank_transfers_pkey PRIMARY KEY (ba_id);


--
-- Name: contacts contacts_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.contacts
    ADD CONSTRAINT contacts_pkey PRIMARY KEY (id);


--
-- Name: deals deals_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.deals
    ADD CONSTRAINT deals_pkey PRIMARY KEY (id);


--
-- Name: mandators mandators_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.mandators
    ADD CONSTRAINT mandators_pkey PRIMARY KEY (id);


--
-- Name: organization_invitations organization_invitations_organization_id_email_key; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organization_invitations
    ADD CONSTRAINT organization_invitations_organization_id_email_key UNIQUE (organization_id, email);


--
-- Name: organization_invitations organization_invitations_organization_id_user_id_key; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organization_invitations
    ADD CONSTRAINT organization_invitations_organization_id_user_id_key UNIQUE (organization_id, user_id);


--
-- Name: organization_invitations organization_invitations_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organization_invitations
    ADD CONSTRAINT organization_invitations_pkey PRIMARY KEY (id);


--
-- Name: organization_memberships organization_memberships_organization_id_user_id_key; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organization_memberships
    ADD CONSTRAINT organization_memberships_organization_id_user_id_key UNIQUE (organization_id, user_id);


--
-- Name: organization_memberships organization_memberships_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organization_memberships
    ADD CONSTRAINT organization_memberships_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organizations
    ADD CONSTRAINT organizations_pkey PRIMARY KEY (id);


--
-- Name: organizations organizations_slug_key; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organizations
    ADD CONSTRAINT organizations_slug_key UNIQUE (slug);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: projects projects_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.projects
    ADD CONSTRAINT projects_pkey PRIMARY KEY (id);


--
-- Name: roles roles_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.roles
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);


--
-- Name: statements statements_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.statements
    ADD CONSTRAINT statements_pkey PRIMARY KEY (kid);


--
-- Name: user_authentications uniq_user_authentications; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.user_authentications
    ADD CONSTRAINT uniq_user_authentications UNIQUE (service, identifier);


--
-- Name: user_authentications user_authentications_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.user_authentications
    ADD CONSTRAINT user_authentications_pkey PRIMARY KEY (id);


--
-- Name: user_emails user_emails_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.user_emails
    ADD CONSTRAINT user_emails_pkey PRIMARY KEY (id);


--
-- Name: user_emails user_emails_user_id_email_key; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.user_emails
    ADD CONSTRAINT user_emails_user_id_email_key UNIQUE (user_id, email);


--
-- Name: user_groups user_groups_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.user_groups
    ADD CONSTRAINT user_groups_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: logged_actions logged_actions_pkey; Type: CONSTRAINT; Schema: audit; Owner: -
--

ALTER TABLE ONLY audit.logged_actions
    ADD CONSTRAINT logged_actions_pkey PRIMARY KEY (event_id);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: app_private; Owner: -
--

CREATE INDEX sessions_user_id_idx ON app_private.sessions USING btree (user_id);


--
-- Name: idx_user_emails_primary; Type: INDEX; Schema: app_public; Owner: -
--

CREATE INDEX idx_user_emails_primary ON app_public.user_emails USING btree (is_primary, user_id);


--
-- Name: organization_invitations_user_id_idx; Type: INDEX; Schema: app_public; Owner: -
--

CREATE INDEX organization_invitations_user_id_idx ON app_public.organization_invitations USING btree (user_id);


--
-- Name: organization_memberships_user_id_idx; Type: INDEX; Schema: app_public; Owner: -
--

CREATE INDEX organization_memberships_user_id_idx ON app_public.organization_memberships USING btree (user_id);


--
-- Name: uniq_user_emails_primary_email; Type: INDEX; Schema: app_public; Owner: -
--

CREATE UNIQUE INDEX uniq_user_emails_primary_email ON app_public.user_emails USING btree (user_id) WHERE (is_primary IS TRUE);


--
-- Name: uniq_user_emails_verified_email; Type: INDEX; Schema: app_public; Owner: -
--

CREATE UNIQUE INDEX uniq_user_emails_verified_email ON app_public.user_emails USING btree (email) WHERE (is_verified IS TRUE);


--
-- Name: user_authentications_user_id_idx; Type: INDEX; Schema: app_public; Owner: -
--

CREATE INDEX user_authentications_user_id_idx ON app_public.user_authentications USING btree (user_id);


--
-- Name: logged_actions_action_idx; Type: INDEX; Schema: audit; Owner: -
--

CREATE INDEX logged_actions_action_idx ON audit.logged_actions USING btree (action);


--
-- Name: logged_actions_action_tstamp_tx_stm_idx; Type: INDEX; Schema: audit; Owner: -
--

CREATE INDEX logged_actions_action_tstamp_tx_stm_idx ON audit.logged_actions USING btree (action_tstamp_stm);


--
-- Name: logged_actions_relid_idx; Type: INDEX; Schema: audit; Owner: -
--

CREATE INDEX logged_actions_relid_idx ON audit.logged_actions USING btree (relid);


--
-- Name: user_authentications _100_timestamps; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _100_timestamps BEFORE INSERT OR UPDATE ON app_public.user_authentications FOR EACH ROW EXECUTE FUNCTION app_private.tg__timestamps();


--
-- Name: user_emails _100_timestamps; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _100_timestamps BEFORE INSERT OR UPDATE ON app_public.user_emails FOR EACH ROW EXECUTE FUNCTION app_private.tg__timestamps();


--
-- Name: users _100_timestamps; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _100_timestamps BEFORE INSERT OR UPDATE ON app_public.users FOR EACH ROW EXECUTE FUNCTION app_private.tg__timestamps();


--
-- Name: user_emails _200_forbid_existing_email; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _200_forbid_existing_email BEFORE INSERT ON app_public.user_emails FOR EACH ROW EXECUTE FUNCTION app_public.tg_user_emails__forbid_if_verified();


--
-- Name: user_emails _500_audit_added; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_audit_added AFTER INSERT ON app_public.user_emails FOR EACH ROW EXECUTE FUNCTION app_private.tg__add_audit_job('added_email', 'user_id', 'id', 'email');


--
-- Name: user_authentications _500_audit_removed; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_audit_removed AFTER DELETE ON app_public.user_authentications FOR EACH ROW EXECUTE FUNCTION app_private.tg__add_audit_job('unlinked_account', 'user_id', 'service', 'identifier');


--
-- Name: user_emails _500_audit_removed; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_audit_removed AFTER DELETE ON app_public.user_emails FOR EACH ROW EXECUTE FUNCTION app_private.tg__add_audit_job('removed_email', 'user_id', 'id', 'email');


--
-- Name: users _500_deletion_organization_checks_and_actions; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_deletion_organization_checks_and_actions BEFORE DELETE ON app_public.users FOR EACH ROW WHEN ((app_public.current_user_id() IS NOT NULL)) EXECUTE FUNCTION app_public.tg_users__deletion_organization_checks_and_actions();


--
-- Name: users _500_gql_update; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_gql_update AFTER UPDATE ON app_public.users FOR EACH ROW EXECUTE FUNCTION app_public.tg__graphql_subscription('userChanged', 'graphql:user:$1', 'id');


--
-- Name: user_emails _500_insert_secrets; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_insert_secrets AFTER INSERT ON app_public.user_emails FOR EACH ROW EXECUTE FUNCTION app_private.tg_user_email_secrets__insert_with_user_email();


--
-- Name: users _500_insert_secrets; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_insert_secrets AFTER INSERT ON app_public.users FOR EACH ROW EXECUTE FUNCTION app_private.tg_user_secrets__insert_with_user();


--
-- Name: user_emails _500_prevent_delete_last; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_prevent_delete_last AFTER DELETE ON app_public.user_emails REFERENCING OLD TABLE AS deleted FOR EACH STATEMENT EXECUTE FUNCTION app_public.tg_user_emails__prevent_delete_last_email();


--
-- Name: organization_invitations _500_send_email; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_send_email AFTER INSERT ON app_public.organization_invitations FOR EACH ROW EXECUTE FUNCTION app_private.tg__add_job('organization_invitations__send_invite');


--
-- Name: user_emails _500_verify_account_on_verified; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _500_verify_account_on_verified AFTER INSERT OR UPDATE OF is_verified ON app_public.user_emails FOR EACH ROW WHEN ((new.is_verified IS TRUE)) EXECUTE FUNCTION app_public.tg_user_emails__verify_account_on_verified();


--
-- Name: user_emails _900_send_verification_email; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER _900_send_verification_email AFTER INSERT ON app_public.user_emails FOR EACH ROW WHEN ((new.is_verified IS FALSE)) EXECUTE FUNCTION app_private.tg__add_job('user_emails__send_verification');


--
-- Name: accounts audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.accounts FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: activity audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.activity FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: bank_transfers audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.bank_transfers FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: contacts audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.contacts FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: deals audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.deals FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: end_reasons audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.end_reasons FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: mandators audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.mandators FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: products audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.products FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: projects audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.projects FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: roles audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.roles FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: statements audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.statements FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: user_groups audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.user_groups FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: users audit_trigger_row; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_row AFTER INSERT OR DELETE OR UPDATE ON app_public.users FOR EACH ROW EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: accounts audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.accounts FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: activity audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.activity FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: bank_transfers audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.bank_transfers FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: contacts audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.contacts FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: deals audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.deals FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: end_reasons audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.end_reasons FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: mandators audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.mandators FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: products audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.products FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: projects audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.projects FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: roles audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.roles FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: statements audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.statements FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: user_groups audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.user_groups FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: users audit_trigger_stm; Type: TRIGGER; Schema: app_public; Owner: -
--

CREATE TRIGGER audit_trigger_stm AFTER TRUNCATE ON app_public.users FOR EACH STATEMENT EXECUTE FUNCTION audit.if_modified_func('true');


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_public.users(id) ON DELETE CASCADE;


--
-- Name: user_authentication_secrets user_authentication_secrets_user_authentication_id_fkey; Type: FK CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.user_authentication_secrets
    ADD CONSTRAINT user_authentication_secrets_user_authentication_id_fkey FOREIGN KEY (user_authentication_id) REFERENCES app_public.user_authentications(id) ON DELETE CASCADE;


--
-- Name: user_email_secrets user_email_secrets_user_email_id_fkey; Type: FK CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.user_email_secrets
    ADD CONSTRAINT user_email_secrets_user_email_id_fkey FOREIGN KEY (user_email_id) REFERENCES app_public.user_emails(id) ON DELETE CASCADE;


--
-- Name: user_secrets user_secrets_user_id_fkey; Type: FK CONSTRAINT; Schema: app_private; Owner: -
--

ALTER TABLE ONLY app_private.user_secrets
    ADD CONSTRAINT user_secrets_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_public.users(id) ON DELETE CASCADE;


--
-- Name: organization_invitations organization_invitations_organization_id_fkey; Type: FK CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organization_invitations
    ADD CONSTRAINT organization_invitations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES app_public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_invitations organization_invitations_user_id_fkey; Type: FK CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organization_invitations
    ADD CONSTRAINT organization_invitations_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_public.users(id) ON DELETE CASCADE;


--
-- Name: organization_memberships organization_memberships_organization_id_fkey; Type: FK CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organization_memberships
    ADD CONSTRAINT organization_memberships_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES app_public.organizations(id) ON DELETE CASCADE;


--
-- Name: organization_memberships organization_memberships_user_id_fkey; Type: FK CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.organization_memberships
    ADD CONSTRAINT organization_memberships_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_public.users(id) ON DELETE CASCADE;


--
-- Name: user_authentications user_authentications_user_id_fkey; Type: FK CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.user_authentications
    ADD CONSTRAINT user_authentications_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_public.users(id) ON DELETE CASCADE;


--
-- Name: user_emails user_emails_user_id_fkey; Type: FK CONSTRAINT; Schema: app_public; Owner: -
--

ALTER TABLE ONLY app_public.user_emails
    ADD CONSTRAINT user_emails_user_id_fkey FOREIGN KEY (user_id) REFERENCES app_public.users(id) ON DELETE CASCADE;


--
-- Name: connect_pg_simple_sessions; Type: ROW SECURITY; Schema: app_private; Owner: -
--

ALTER TABLE app_private.connect_pg_simple_sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: app_private; Owner: -
--

ALTER TABLE app_private.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: user_authentication_secrets; Type: ROW SECURITY; Schema: app_private; Owner: -
--

ALTER TABLE app_private.user_authentication_secrets ENABLE ROW LEVEL SECURITY;

--
-- Name: user_email_secrets; Type: ROW SECURITY; Schema: app_private; Owner: -
--

ALTER TABLE app_private.user_email_secrets ENABLE ROW LEVEL SECURITY;

--
-- Name: user_secrets; Type: ROW SECURITY; Schema: app_private; Owner: -
--

ALTER TABLE app_private.user_secrets ENABLE ROW LEVEL SECURITY;

--
-- Name: accounts; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.accounts ENABLE ROW LEVEL SECURITY;

--
-- Name: activity; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.activity ENABLE ROW LEVEL SECURITY;

--
-- Name: bank_transfers; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.bank_transfers ENABLE ROW LEVEL SECURITY;

--
-- Name: contacts; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.contacts ENABLE ROW LEVEL SECURITY;

--
-- Name: deals; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.deals ENABLE ROW LEVEL SECURITY;

--
-- Name: user_authentications delete_own; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY delete_own ON app_public.user_authentications FOR DELETE USING ((user_id = app_public.current_user_id()));


--
-- Name: user_emails delete_own; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY delete_own ON app_public.user_emails FOR DELETE USING ((user_id = app_public.current_user_id()));


--
-- Name: user_emails insert_own; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY insert_own ON app_public.user_emails FOR INSERT WITH CHECK ((user_id = app_public.current_user_id()));


--
-- Name: organization_invitations; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.organization_invitations ENABLE ROW LEVEL SECURITY;

--
-- Name: organization_memberships; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.organization_memberships ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.organizations ENABLE ROW LEVEL SECURITY;

--
-- Name: products; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.products ENABLE ROW LEVEL SECURITY;

--
-- Name: projects; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.projects ENABLE ROW LEVEL SECURITY;

--
-- Name: users select_all; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY select_all ON app_public.users FOR SELECT USING (true);


--
-- Name: organization_memberships select_invited; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY select_invited ON app_public.organization_memberships FOR SELECT USING ((organization_id IN ( SELECT app_public.current_user_invited_organization_ids() AS current_user_invited_organization_ids)));


--
-- Name: organizations select_invited; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY select_invited ON app_public.organizations FOR SELECT USING ((id IN ( SELECT app_public.current_user_invited_organization_ids() AS current_user_invited_organization_ids)));


--
-- Name: organization_memberships select_member; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY select_member ON app_public.organization_memberships FOR SELECT USING ((organization_id IN ( SELECT app_public.current_user_member_organization_ids() AS current_user_member_organization_ids)));


--
-- Name: organizations select_member; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY select_member ON app_public.organizations FOR SELECT USING ((id IN ( SELECT app_public.current_user_member_organization_ids() AS current_user_member_organization_ids)));


--
-- Name: user_authentications select_own; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY select_own ON app_public.user_authentications FOR SELECT USING ((user_id = app_public.current_user_id()));


--
-- Name: user_emails select_own; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY select_own ON app_public.user_emails FOR SELECT USING ((user_id = app_public.current_user_id()));


--
-- Name: statements; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.statements ENABLE ROW LEVEL SECURITY;

--
-- Name: organizations update_owner; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY update_owner ON app_public.organizations FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM app_public.organization_memberships
  WHERE ((organization_memberships.organization_id = organizations.id) AND (organization_memberships.user_id = app_public.current_user_id()) AND (organization_memberships.is_owner IS TRUE)))));


--
-- Name: users update_self; Type: POLICY; Schema: app_public; Owner: -
--

CREATE POLICY update_self ON app_public.users FOR UPDATE USING ((id = app_public.current_user_id()));


--
-- Name: user_authentications; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.user_authentications ENABLE ROW LEVEL SECURITY;

--
-- Name: user_emails; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.user_emails ENABLE ROW LEVEL SECURITY;

--
-- Name: user_groups; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.user_groups ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: app_public; Owner: -
--

ALTER TABLE app_public.users ENABLE ROW LEVEL SECURITY;

--
-- Name: SCHEMA app_hidden; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA app_hidden TO crm_starter_visitor;


--
-- Name: SCHEMA app_public; Type: ACL; Schema: -; Owner: -
--

GRANT USAGE ON SCHEMA app_public TO crm_starter_visitor;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE ALL ON SCHEMA public FROM postgres;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO crm_starter;
GRANT USAGE ON SCHEMA public TO crm_starter_visitor;


--
-- Name: FUNCTION assert_valid_password(new_password text); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.assert_valid_password(new_password text) FROM PUBLIC;


--
-- Name: TABLE users; Type: ACL; Schema: app_public; Owner: -
--

GRANT SELECT ON TABLE app_public.users TO crm_starter_visitor;


--
-- Name: COLUMN users.username; Type: ACL; Schema: app_public; Owner: -
--

GRANT UPDATE(username) ON TABLE app_public.users TO crm_starter_visitor;


--
-- Name: COLUMN users.name; Type: ACL; Schema: app_public; Owner: -
--

GRANT UPDATE(name) ON TABLE app_public.users TO crm_starter_visitor;


--
-- Name: COLUMN users.avatar_url; Type: ACL; Schema: app_public; Owner: -
--

GRANT UPDATE(avatar_url) ON TABLE app_public.users TO crm_starter_visitor;


--
-- Name: FUNCTION link_or_register_user(f_user_id uuid, f_service character varying, f_identifier character varying, f_profile json, f_auth_details json); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.link_or_register_user(f_user_id uuid, f_service character varying, f_identifier character varying, f_profile json, f_auth_details json) FROM PUBLIC;


--
-- Name: FUNCTION login(username public.citext, password text); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.login(username public.citext, password text) FROM PUBLIC;


--
-- Name: FUNCTION really_create_user(username public.citext, email text, email_is_verified boolean, name text, avatar_url text, password text); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.really_create_user(username public.citext, email text, email_is_verified boolean, name text, avatar_url text, password text) FROM PUBLIC;


--
-- Name: FUNCTION register_user(f_service character varying, f_identifier character varying, f_profile json, f_auth_details json, f_email_is_verified boolean); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.register_user(f_service character varying, f_identifier character varying, f_profile json, f_auth_details json, f_email_is_verified boolean) FROM PUBLIC;


--
-- Name: FUNCTION tg__add_audit_job(); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.tg__add_audit_job() FROM PUBLIC;


--
-- Name: FUNCTION tg__add_job(); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.tg__add_job() FROM PUBLIC;


--
-- Name: FUNCTION tg__timestamps(); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.tg__timestamps() FROM PUBLIC;


--
-- Name: FUNCTION tg_user_email_secrets__insert_with_user_email(); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.tg_user_email_secrets__insert_with_user_email() FROM PUBLIC;


--
-- Name: FUNCTION tg_user_secrets__insert_with_user(); Type: ACL; Schema: app_private; Owner: -
--

REVOKE ALL ON FUNCTION app_private.tg_user_secrets__insert_with_user() FROM PUBLIC;


--
-- Name: FUNCTION accept_invitation_to_organization(invitation_id uuid, code text); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.accept_invitation_to_organization(invitation_id uuid, code text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.accept_invitation_to_organization(invitation_id uuid, code text) TO crm_starter_visitor;


--
-- Name: FUNCTION change_password(old_password text, new_password text); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.change_password(old_password text, new_password text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.change_password(old_password text, new_password text) TO crm_starter_visitor;


--
-- Name: FUNCTION confirm_account_deletion(token text); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.confirm_account_deletion(token text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.confirm_account_deletion(token text) TO crm_starter_visitor;


--
-- Name: TABLE organizations; Type: ACL; Schema: app_public; Owner: -
--

GRANT SELECT ON TABLE app_public.organizations TO crm_starter_visitor;


--
-- Name: COLUMN organizations.slug; Type: ACL; Schema: app_public; Owner: -
--

GRANT UPDATE(slug) ON TABLE app_public.organizations TO crm_starter_visitor;


--
-- Name: COLUMN organizations.name; Type: ACL; Schema: app_public; Owner: -
--

GRANT UPDATE(name) ON TABLE app_public.organizations TO crm_starter_visitor;


--
-- Name: FUNCTION create_organization(slug public.citext, name text); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.create_organization(slug public.citext, name text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.create_organization(slug public.citext, name text) TO crm_starter_visitor;


--
-- Name: FUNCTION current_session_id(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.current_session_id() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.current_session_id() TO crm_starter_visitor;


--
-- Name: FUNCTION "current_user"(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public."current_user"() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public."current_user"() TO crm_starter_visitor;


--
-- Name: FUNCTION current_user_id(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.current_user_id() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.current_user_id() TO crm_starter_visitor;


--
-- Name: FUNCTION current_user_invited_organization_ids(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.current_user_invited_organization_ids() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.current_user_invited_organization_ids() TO crm_starter_visitor;


--
-- Name: FUNCTION current_user_member_organization_ids(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.current_user_member_organization_ids() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.current_user_member_organization_ids() TO crm_starter_visitor;


--
-- Name: FUNCTION delete_organization(organization_id uuid); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.delete_organization(organization_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.delete_organization(organization_id uuid) TO crm_starter_visitor;


--
-- Name: FUNCTION forgot_password(email public.citext); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.forgot_password(email public.citext) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.forgot_password(email public.citext) TO crm_starter_visitor;


--
-- Name: FUNCTION invite_to_organization(organization_id uuid, username public.citext, email public.citext); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.invite_to_organization(organization_id uuid, username public.citext, email public.citext) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.invite_to_organization(organization_id uuid, username public.citext, email public.citext) TO crm_starter_visitor;


--
-- Name: FUNCTION logout(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.logout() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.logout() TO crm_starter_visitor;


--
-- Name: TABLE user_emails; Type: ACL; Schema: app_public; Owner: -
--

GRANT SELECT,DELETE ON TABLE app_public.user_emails TO crm_starter_visitor;


--
-- Name: COLUMN user_emails.email; Type: ACL; Schema: app_public; Owner: -
--

GRANT INSERT(email) ON TABLE app_public.user_emails TO crm_starter_visitor;


--
-- Name: FUNCTION make_email_primary(email_id uuid); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.make_email_primary(email_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.make_email_primary(email_id uuid) TO crm_starter_visitor;


--
-- Name: FUNCTION organization_for_invitation(invitation_id uuid, code text); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.organization_for_invitation(invitation_id uuid, code text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.organization_for_invitation(invitation_id uuid, code text) TO crm_starter_visitor;


--
-- Name: FUNCTION organizations_current_user_is_billing_contact(org app_public.organizations); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.organizations_current_user_is_billing_contact(org app_public.organizations) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.organizations_current_user_is_billing_contact(org app_public.organizations) TO crm_starter_visitor;


--
-- Name: FUNCTION organizations_current_user_is_owner(org app_public.organizations); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.organizations_current_user_is_owner(org app_public.organizations) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.organizations_current_user_is_owner(org app_public.organizations) TO crm_starter_visitor;


--
-- Name: FUNCTION remove_from_organization(organization_id uuid, user_id uuid); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.remove_from_organization(organization_id uuid, user_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.remove_from_organization(organization_id uuid, user_id uuid) TO crm_starter_visitor;


--
-- Name: FUNCTION request_account_deletion(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.request_account_deletion() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.request_account_deletion() TO crm_starter_visitor;


--
-- Name: FUNCTION resend_email_verification_code(email_id uuid); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.resend_email_verification_code(email_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.resend_email_verification_code(email_id uuid) TO crm_starter_visitor;


--
-- Name: FUNCTION reset_password(user_id uuid, reset_token text, new_password text); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.reset_password(user_id uuid, reset_token text, new_password text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.reset_password(user_id uuid, reset_token text, new_password text) TO crm_starter_visitor;


--
-- Name: FUNCTION tg__graphql_subscription(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.tg__graphql_subscription() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.tg__graphql_subscription() TO crm_starter_visitor;


--
-- Name: FUNCTION tg_user_emails__forbid_if_verified(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.tg_user_emails__forbid_if_verified() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.tg_user_emails__forbid_if_verified() TO crm_starter_visitor;


--
-- Name: FUNCTION tg_user_emails__prevent_delete_last_email(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.tg_user_emails__prevent_delete_last_email() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.tg_user_emails__prevent_delete_last_email() TO crm_starter_visitor;


--
-- Name: FUNCTION tg_user_emails__verify_account_on_verified(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.tg_user_emails__verify_account_on_verified() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.tg_user_emails__verify_account_on_verified() TO crm_starter_visitor;


--
-- Name: FUNCTION tg_users__deletion_organization_checks_and_actions(); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.tg_users__deletion_organization_checks_and_actions() FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.tg_users__deletion_organization_checks_and_actions() TO crm_starter_visitor;


--
-- Name: FUNCTION transfer_organization_billing_contact(organization_id uuid, user_id uuid); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.transfer_organization_billing_contact(organization_id uuid, user_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.transfer_organization_billing_contact(organization_id uuid, user_id uuid) TO crm_starter_visitor;


--
-- Name: FUNCTION transfer_organization_ownership(organization_id uuid, user_id uuid); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.transfer_organization_ownership(organization_id uuid, user_id uuid) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.transfer_organization_ownership(organization_id uuid, user_id uuid) TO crm_starter_visitor;


--
-- Name: FUNCTION users_has_password(u app_public.users); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.users_has_password(u app_public.users) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.users_has_password(u app_public.users) TO crm_starter_visitor;


--
-- Name: FUNCTION verify_email(user_email_id uuid, token text); Type: ACL; Schema: app_public; Owner: -
--

REVOKE ALL ON FUNCTION app_public.verify_email(user_email_id uuid, token text) FROM PUBLIC;
GRANT ALL ON FUNCTION app_public.verify_email(user_email_id uuid, token text) TO crm_starter_visitor;


--
-- Name: FUNCTION audit_table(target_table regclass); Type: ACL; Schema: audit; Owner: -
--

REVOKE ALL ON FUNCTION audit.audit_table(target_table regclass) FROM PUBLIC;


--
-- Name: FUNCTION audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean); Type: ACL; Schema: audit; Owner: -
--

REVOKE ALL ON FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean) FROM PUBLIC;


--
-- Name: FUNCTION audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean, ignored_cols text[]); Type: ACL; Schema: audit; Owner: -
--

REVOKE ALL ON FUNCTION audit.audit_table(target_table regclass, audit_rows boolean, audit_query_text boolean, ignored_cols text[]) FROM PUBLIC;


--
-- Name: FUNCTION if_modified_func(); Type: ACL; Schema: audit; Owner: -
--

REVOKE ALL ON FUNCTION audit.if_modified_func() FROM PUBLIC;


--
-- Name: TABLE organization_memberships; Type: ACL; Schema: app_public; Owner: -
--

GRANT SELECT ON TABLE app_public.organization_memberships TO crm_starter_visitor;


--
-- Name: TABLE user_authentications; Type: ACL; Schema: app_public; Owner: -
--

GRANT SELECT,DELETE ON TABLE app_public.user_authentications TO crm_starter_visitor;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: app_hidden; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_hidden REVOKE ALL ON SEQUENCES  FROM crm_starter;
ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_hidden GRANT SELECT,USAGE ON SEQUENCES  TO crm_starter_visitor;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: app_hidden; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_hidden REVOKE ALL ON FUNCTIONS  FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_hidden REVOKE ALL ON FUNCTIONS  FROM crm_starter;
ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_hidden GRANT ALL ON FUNCTIONS  TO crm_starter_visitor;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: app_public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_public REVOKE ALL ON SEQUENCES  FROM crm_starter;
ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_public GRANT SELECT,USAGE ON SEQUENCES  TO crm_starter_visitor;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: app_public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_public REVOKE ALL ON FUNCTIONS  FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_public REVOKE ALL ON FUNCTIONS  FROM crm_starter;
ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA app_public GRANT ALL ON FUNCTIONS  TO crm_starter_visitor;


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA public REVOKE ALL ON SEQUENCES  FROM crm_starter;
ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA public GRANT SELECT,USAGE ON SEQUENCES  TO crm_starter_visitor;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: public; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA public REVOKE ALL ON FUNCTIONS  FROM PUBLIC;
ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA public REVOKE ALL ON FUNCTIONS  FROM crm_starter;
ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter IN SCHEMA public GRANT ALL ON FUNCTIONS  TO crm_starter_visitor;


--
-- Name: DEFAULT PRIVILEGES FOR FUNCTIONS; Type: DEFAULT ACL; Schema: -; Owner: -
--

ALTER DEFAULT PRIVILEGES FOR ROLE crm_starter REVOKE ALL ON FUNCTIONS  FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

