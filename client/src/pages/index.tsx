import * as React from "react";
import SharedLayout from "../components/SharedLayout";

export default function Home() {
  return (
    <SharedLayout title="Home">
      <h2>Welcome to PostGraphile Starter</h2>
      <p>
        This project can server as a basis for your own project. We've added a
        number of things that most projects require, but you're free to pull
        them out and switch them with whatever you need.
      </p>
      <ul>
        <li>
          <strong>TypeScript</strong> — make your project maintainable by
          starting with strong typing throughout
        </li>
        <li>
          <strong>Ant Design</strong> — &ldquo;A design system with values of
          Nature and Determinacy for better user experience of enterprise
          applications&rdquo;
        </li>
        <li>
          <strong>Hot reloading</strong> — edit this file
          `client/src/pages/index.tsx` and when you save it should update in
          your browser immediately
        </li>
        <li>
          <strong>SSR with hot reloading</strong> — if you turn JS off and
          reload the page you should be greeted with the same content anyway
        </li>
        <li>
          <strong>Prettier</strong> — consistent automated formatting for your
          code
        </li>
        <li>
          <strong>Linting</strong> — provided by ESLint, can be extended with
          extremely powerful lint rules to protect your project from bugs, bad
          practices, and inconsistencies
        </li>
        <li>
          <strong>Migrations</strong> — we use{" "}
          <a href="https://github.com/graphile/migrate">graphile-migrate</a> but
          you're welcome to switch to whatever migration library you like
        </li>
        <li>
          <strong>Job queue</strong> — we've added{" "}
          <a href="https://github.com/graphile/worker">graphile-worker</a> to
          perform background tasks for you, such as sending emails
        </li>
        <li>
          <strong>Responsive email templates</strong> — we've added MJML and a
          templating system to help you format emails; all emails go through the
          `send_email` task so it's easy to customise
        </li>
        <li>
          <strong>Email transport</strong> — we've configured nodemailer to use
          ethereal.email to catch all development emails, and AWS' SES in
          production (easy to customise)
        </li>
        <li>
          <strong>HTML 2 text emails</strong> — automated conversion from your
          pretty templates to plain text emails for users that prefer that
        </li>
        <li>
          <strong>Express server</strong> — with easy to customise middleware
          system
        </li>
        <li>
          <strong>Sessions</strong> — to persist login information in the
          traditional way (with cookies)
        </li>
        <li>
          <strong>Realtime</strong> — PostGraphile is configured with
          @graphile/pg-pubsub to enable realtime events from the DB; and Apollo
          is configured to consume them
        </li>
        <li>
          <strong>GraphQL</strong> — on the backend through PostGraphile, on the
          frontend via Apollo client
        </li>
        <li>
          <strong>User system</strong> — supporting both username/password
          registration and OAuth / social authentication (Twitter, GitHub,
          Facebook, ...)
        </li>
      </ul>
    </SharedLayout>
  );
}
