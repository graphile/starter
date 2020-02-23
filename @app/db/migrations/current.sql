-- Enter migration here

/*
example of a table that could be created after setup complete

- uncomment the statements below
- save the file and graphile-migrate will update the schema into database automagically
- any "drop" statements should be at the top (in reverse order)
reverse order as we could have references
from the second created table to the first created table

here is an pseudo example:
DROP C;
DROP B;
DROP A;
CREATE A;
CREATE B;
CREATE C;

if references exists from B -> A
we have to DROP B before DROP A we have references that point to A from B

In the example below post and feed need to be
deleted in reverse order due to feed -> post
*/

-- UNCOMMENT FROM HERE --

-- drop table if exists app_public.feed;
-- drop table if exists app_public.post;

-- drop type if exists app_public.post_topic;

-- create type app_public.post_topic as enum (
--   'discussion',
--   'inspiration',
--   'help',
--   'showcase'
-- );

-- create table app_public.post (
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

-- create table app_public.feed (
--   id               serial primary key,
--   posts            integer not null references app_public.post(id),
--   created_at       timestamp default now()
-- );

-- comment on table app_public.feed is 'the feed of the posts';
-- comment on column app_public.feed.id is 'the primary key for the feed.';
-- comment on column app_public.feed.created_at is 'the time this feed was created.';
