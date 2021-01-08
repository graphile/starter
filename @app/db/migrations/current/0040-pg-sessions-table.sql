/*
 * This table is used (only) by `connect-pg-simple` (see `installSession.ts`)
 * to track cookie session information at the webserver (`express`) level if
 * you don't have a redis server. If you're using redis everywhere (including
 * development) then you don't need this table.
 *
 * Do not confuse this with the `app_private.sessions` table.
 */

create table app_private.connect_pg_simple_sessions (
  sid varchar not null,
	sess json not null,
	expire timestamp not null
);
alter table app_private.connect_pg_simple_sessions
  enable row level security;
alter table app_private.connect_pg_simple_sessions
  add constraint session_pkey primary key (sid) not deferrable initially immediate;


