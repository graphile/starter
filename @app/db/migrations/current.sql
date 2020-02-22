-- Enter migration here

/*
example of a table that could be created after setup complete

- uncomment the statements below
- save the file and graphile-migrate will update the schema into database automagically
- any "drop" statements should be at the top (in reverse order)
*/

-- drop table if exists feed;
-- drop table if exists post;

-- create type app_public.post_topic as enum (
--   'discussion',
--   'inspiration',
--   'help',
--   'showcase'
-- );

-- create table if not exists app_public.post (
--   id               serial primary key,
--   author_id        integer not null references app_public.users(id),
--   headline         text not null check (char_length(headline) < 280),
--   body             text,
--   topic            app_public.post_topic,
--   created_at       timestamp default now()
-- );

-- comment on table app_public.post is 'a forum post written by a user.';
-- comment on column app_public.post.id is 'the primary key for the post.';
-- comment on column app_public.post.headline is 'the title written by the user.';
-- comment on column app_public.post.author_id is 'the id of the author user.';
-- comment on column app_public.post.topic is 'the topic this has been posted in.';
-- comment on column app_public.post.body is 'the main body text of our post.';
-- comment on column app_public.post.created_at is 'the time this post was created.';

-- create table if not exists app_public.feed (
--   id               serial primary key,
--   posts            integer not null references app_public.post(id),
--   created_at       timestamp default now()
-- );

-- comment on table app_public.feed is 'the feed of the posts';
-- comment on column app_public.feed.id is 'the primary key for the feed.';
-- comment on column app_public.feed.created_at is 'the time this feed was created.';
