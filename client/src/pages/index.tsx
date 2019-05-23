/*! This file contains code that is copyright 2019 Graphile Ltd, see
 * GRAPHILE_LICENSE.md for license information. */
import * as React from "react";
import SharedLayout from "../components/SharedLayout";

export default function Home() {
  return (
    <SharedLayout title="Home">
      <h2>Welcome to PostGraphile Starter</h2>
      <p>
        This project can serve as a basis for your own project. We've added a
        things that most projects require, but you're free to remove them or
        replace them with whatever you need.
      </p>
      <h3>IMPORTANT</h3>
      <p>
        The first user to register will automatically be an "admin". To disable
        this, delete the database function{" "}
        <code>app_private.tg_users__make_first_user_admin()</code> and related
        triggers.
      </p>
      <h3>Page load delays</h3>
      <p>
        We use Next.js to control the React app. This gives us server-side
        rendering, routing, bundle splitting, hot reloading, and much more.
        However, this does mean that in development when you visit a new URL it
        must first be loaded from the file system and transpiled by the server,
        served to the client, and then executed. This means there can be a small
        delay when loading a web page for the first time in development. In
        production, this delay will be much smaller, and can be eliminated with
        prefetching. You can read more about this in the{" "}
        <a href="https://nextjs.org/docs#prefetching-pages">Next.js docs</a>
      </p>
      <h3>Registration</h3>
      <p>
        To get started, you'll probably want to try the login/registration flow.{" "}
        <strong>
          In development we don't send any emails to real email addresses
        </strong>
        , instead all emails are sent to ethereal.email where you can browse
        them. Keep an eye on the terminal that's running the server, when an
        email is triggered it will present you with a URL you can visit to view
        the email. We've configured the project to use Amazon SES to send emails
        in production (you will need to create the relevant resources and
        provide the relevant secrets to use this); however it can easily be
        reconfigured to use your email transport service of choice.
      </p>
      <p>
        To get started, click "login" at the top right, then choose "Register
        Here".
      </p>
      <p>
        NOTE: to prevent people blocking legitimate users from registering, we
        only prevent the same email address being used multiple times when it
        has been verified by someone. It's up to your application to turn
        features off/etc when the user does not have any verified email
        addresses (should you desire this).
      </p>
      <h3>Validation</h3>
      <p>
        We use <a href="https://ant.design/components/form/">AntD's forms</a>,
        so validation is provided via these. We've shown how to connect
        server-side errors into the form validation, for example try registering
        a new account using the email address of an account{" "}
        <strong>that has already been verified</strong>.
      </p>
      <h3>This file</h3>
      <p>
        This file is located in the client pages folder:
        <code>client/src/pages/index.tsx</code>. If you edit it and save it
        should update in your browser immediately. Further if you disable JS and
        reload the page you should see the content is still displayed (this is
        called "server-side rendering" and is important to ensuring that your
        users have the best low-latency experience of your website, and that
        search engines can index its content).
      </p>
      <h3>The server</h3>
      <p>
        The entry point to the server is <code>server/src/server/index.ts</code>
        ; this creates an Express.js server and installs a number of
        middlewares, including PostGraphile.
      </p>
      <p>
        To make sessions persistent (which you definitely want, because we
        restart the server whenever server files change), we've configured
        Express to use Redis as a session store. You need to ensure redis is
        installed and running locally, or disable the <code>REDIS_URL</code>{" "}
        configuration variable in <code>.env</code>.
      </p>
      <h3>Realtime</h3>
      <p>
        We've configured PostGraphile with @graphile/pg-pubsub to enable
        realtime events from the DB; and Apollo is configured to consume them.
        TODO: how to demonstrate this?
      </p>
      <h3>What now?</h3>
      <p>
        If you're happy with our user account system, we recommend that you
        commit this first migration with <code>yarn db:migrate commit</code>,
        and then set about making this application your own.
      </p>
    </SharedLayout>
  );
}
