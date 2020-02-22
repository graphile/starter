-- Enter migration here

/*
example of a table that could be created after setup complete

- uncomment the statements below
- save the file and graphile-migrate will update the schema into database automagically
*/

-- CREATE TYPE app_public.post_topic AS enum (
--   'discussion',
--   'inspiration',
--   'help',
--   'showcase'
-- );

-- CREATE TABLE IF NOT EXISTS app_public.post (
--   id               SERIAL PRIMARY KEY,
--   author_id        INTEGER NOT NULL REFERENCES app_public.users(id),
--   headline         TEXT NOT NULL CHECK (char_length(headline) < 280),
--   body             TEXT,
--   topic            app_public.post_topic,
--   created_at       TIMESTAMP default NOW()
-- );

-- COMMENT ON TABLE APP_PUBLIC.POST IS 'A forum post written by a user.';
-- COMMENT ON COLUMN APP_PUBLIC.POST.ID IS 'The primary key for the post.';
-- COMMENT ON COLUMN APP_PUBLIC.POST.HEADLINE IS 'The title written by the user.';
-- COMMENT ON COLUMN APP_PUBLIC.POST.AUTHOR_ID IS 'The id of the author user.';
-- COMMENT ON COLUMN APP_PUBLIC.POST.TOPIC IS 'The topic this has been posted in.';
-- COMMENT ON COLUMN APP_PUBLIC.POST.BODY IS 'The main body text of our post.';
-- COMMENT ON COLUMN APP_PUBLIC.POST.CREATED_AT IS 'The time this post was created.';
