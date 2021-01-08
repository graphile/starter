/*
 * These triggers are commonly used across many tables.
 */

-- Used for queueing jobs easily; relys on the fact that every table we have
-- has a primary key 'id' column; this won't work if you rename your primary
-- key columns.
create function app_private.tg__add_job() returns trigger as $$
begin
  perform graphile_worker.add_job(tg_argv[0], json_build_object('id', NEW.id));
  return NEW;
end;
$$ language plpgsql volatile security definer set search_path to pg_catalog, public, pg_temp;
comment on function app_private.tg__add_job() is
  E'Useful shortcut to create a job on insert/update. Pass the task name as the first trigger argument, and optionally the queue name as the second argument. The record id will automatically be available on the JSON payload.';

-- This trigger is used to queue a job to inform a user that a significant
-- security change has been made to their account (e.g. adding a new email
-- address, linking a new social login).
create function app_private.tg__add_audit_job() returns trigger as $$
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
$$ language plpgsql volatile security definer set search_path to pg_catalog, public, pg_temp;
comment on function app_private.tg__add_audit_job() is
  E'For notifying a user that an auditable action has taken place. Call with audit event name, user ID attribute name, and optionally another value to be included (e.g. the PK of the table, or some other relevant information). e.g. `tg__add_audit_job(''added_email'', ''user_id'', ''email'')`';

/*
 * This trigger is used on tables with created_at and updated_at to ensure that
 * these timestamps are kept valid (namely: `created_at` cannot be changed, and
 * `updated_at` must be monotonically increasing).
 */
create function app_private.tg__timestamps() returns trigger as $$
begin
  NEW.created_at = (case when TG_OP = 'INSERT' then NOW() else OLD.created_at end);
  NEW.updated_at = (case when TG_OP = 'UPDATE' and OLD.updated_at >= NOW() then OLD.updated_at + interval '1 millisecond' else NOW() end);
  return NEW;
end;
$$ language plpgsql volatile set search_path to pg_catalog, public, pg_temp;
comment on function app_private.tg__timestamps() is
  E'This trigger should be called on all tables with created_at, updated_at - it ensures that they cannot be manipulated and that updated_at will always be larger than the previous updated_at.';

/*
 * This trigger is useful for adding realtime features to our GraphQL schema
 * with minimal effort in the database. It's a very generic trigger function;
 * you're intended to pass three arguments when you call it:
 *
 * 1. The "event" name to include, this is an arbitrary string.
 * 2. The "topic" template that we'll be publishing the event to. A `$1` in
 *    this may be added as a placeholder which will be replaced by the
 *    "subject" value.
 * 3. The "subject" column, we'll read the value of this column from the NEW
 *    (for insert/update) or OLD (for delete) record and include it in the
 *    event payload.
 *
 * A PostgreSQL `NOTIFY` will be issued to the topic (or "channel") generated
 * from arguments 2 and 3, the body of the notification will be a stringified
 * JSON object containing `event`, `sub` (the subject specified by argument 3)
 * and `id` (the record id).
 *
 * Example:
 *
 *     create trigger _500_gql_update
 *       after update on app_public.users
 *       for each row
 *       execute procedure app_public.tg__graphql_subscription(
 *         'userChanged', -- the "event" string, useful for the client to know what happened
 *         'graphql:user:$1', -- the "topic" the event will be published to, as a template
 *         'id' -- If specified, `$1` above will be replaced with NEW.id or OLD.id from the trigger.
 *       );
 */
create function app_public.tg__graphql_subscription() returns trigger as $$
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
        'subject', v_sub,
        'id', v_record.id
      )::text);
    end if;
  end loop;
  return v_record;
end;
$$ language plpgsql volatile;
comment on function app_public.tg__graphql_subscription() is
  E'This function enables the creation of simple focussed GraphQL subscriptions using database triggers. Read more here: https://www.graphile.org/postgraphile/subscriptions/#custom-subscriptions';
