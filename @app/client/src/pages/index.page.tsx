import { useSharedQuery } from "@app/graphql";
import { Button, Code, Divider, Grid, Mark, Text } from "@mantine/core";
import React from "react";

import { Heading, SharedLayout, Strong } from "../components";

// Convenience helper
const Li = ({ children, ...props }: any) => (
  <li {...props}>
    <Text>{children}</Text>
  </li>
);

export { Page };

function Page() {
  const query = useSharedQuery();
  return (
    // @ts-ignore
    <SharedLayout title="" query={query}>
      <Grid>
        {/* TODO: responsive<Box w={{ sm: 24, md: 12 }}>*/}
        <Grid.Col span={8}>
          <Heading data-cy="homepage-header">
            Welcome to the PostGraphile starter
          </Heading>
          <Text>
            This project can serve as a basis for your own project. We've added
            many features that most projects require, but you're free to remove
            them or replace them with whatever you need.
          </Text>

          <Text>Please read the next few sections before continuing.</Text>

          <Heading order={4}>Vite-SSR and page load delays: dev only</Heading>
          <Text>
            We use vite-plugin-ssr to serve the React app. This gives us
            server-side rendering, routing, bundle splitting, hot reloading, and
            much more. However, in development when you visit a page it must
            first be loaded from the file system and transpiled and bundled by
            the server, served to the client, and then executed. This means
            there can be a small delay when loading a web page for the first
            time in development. In production, this delay should be vastly
            smaller, and can be eliminated with pre-fetching. You can read more
            about this in the{" "}
            <a href="https://vite-plugin-ssr.com/useClientRouter#link-prefetching">
              Vite-plugin-ssr docs
            </a>
          </Text>

          <Heading order={4}>Page hangs: development only</Heading>
          <Text>
            If the page hangs this is likely because the vite-plugin-ssr server
            was restarted. Please reload the page.
          </Text>

          <Heading order={4}>Emails</Heading>
          <Text>
            <strong>
              In development we don't send any emails to real email addresses
            </strong>
            , instead all emails are sent to{" "}
            <a href="http://ethereal.email">ethereal.email</a> where you can
            browse them. Keep an eye on the terminal; when an email is triggered
            the server will log a URL to view the email.
          </Text>

          <Heading order={4}>
            <a href="/graphiql">
              Graph<em>i</em>QL
            </a>
          </Heading>
          <Text>
            You can browse the GraphQL API and even issue GraphQL queries using
            the built in Graph<em>i</em>QL interface located at{" "}
            <a href="/graphiql">
              <code>/graphiql</code>
            </a>
            .
          </Text>

          <Heading order={4}>
            This page:{" "}
            <a href="https://github.com/marcelchastain/graphile-starter-vite/blob/main/@app/client/src/pages/index.page.tsx">
              <code>@app/client/src/pages/index.page.tsx</code>
            </a>
          </Heading>
          <Text>
            If you edit this file and save, the page in the browser should
            automatically update.
          </Text>

          <Heading order={4}>
            The server:{" "}
            <a href="https://github.com/marcelchastain/graphile-starter-vite/blob/main/@app/server/src/index.ts">
              <code>@app/server/src/index.ts</code>
            </a>
          </Heading>
          <Text>
            This entry point creates an Express.js server and installs a number
            of middlewares, including PostGraphile.
          </Text>

          <Heading order={4}>Initial migration</Heading>
          <Text>
            We use <code>graphile-migrate</code> in this project to manage
            database migrations; this allows you to change the database very
            rapidly by just editing the current migration file:{" "}
            <code>migrations/current.sql</code>. This file should be written in
            an idempotent manner so that it can be ran repeatedly without
            causing issues.
          </Text>
          <Text>
            We've committed the first migration for you (which builds the user
            system), but should you wish to customize this user system the
            easiest way is to run <code>yarn db uncommit</code> which will undo
            this initial migration and move its content back to current.sql for
            you to modify. Please see{" "}
            <a href="https://github.com/graphile/migrate/blob/main/README.md">
              the graphile-migrate documentation
            </a>
            .
          </Text>
          <Strong>
            <Strong>WARNING</Strong>: <code>graphile-migrate</code> is
            experimental, you may want to find a different migration solution
            before putting it into production (your sponsorship will help make
            this project stable faster).
          </Strong>

          <Heading order={4}>isAdmin</Heading>
          <Text>
            The <code>isAdmin</code> flag doesn't do anything in this starter,
            but you can use it in your own applications should you need it.
          </Text>

          <Heading order={4}>What now?</Heading>
          <Text>
            To get started, click "Sign in" at the top right, then choose
            "Create One" to create a new account.
          </Text>
          <Text>
            When you're happy, you can add database changes to{" "}
            <code>current.sql</code> and see them reflected in the GraphiQL
            interface a <a href="/graphiql">/graphiql</a>.
          </Text>

          <Divider />

          <Heading order={3}>Further notes</Heading>

          <Text>
            <Mark>You can read this later.</Mark> The important things were
            above; below is additional information worth a read when you're done
            experimenting.
          </Text>

          <Heading order={4}>Making it yours</Heading>
          <Text>
            This project isn't intended to be <code>git clone</code>'d; instead
            you should start a new git repository with the code from the latest
            release:
          </Text>
          <ol>
            <Li>
              Download and extract a zip of the{" "}
              <a href="https://github.com/marcelchastain/graphile-starter-vite/releases">
                latest release from GitHub
              </a>
            </Li>
            <Li>
              In that folder run:
              <ul>
                <Li>
                  <code>git init</code>
                </Li>
                <Li>
                  <code>git add .</code>
                </Li>
                <Li>
                  <code>git commit -m "PostGraphile starter base"</code>
                </Li>
              </ul>
            </Li>
            <Li>
              Change the project name in <code>package.json</code>
            </Li>
            <Li>
              Change the project settings in{" "}
              <code>@app/config/src/index.ts</code>
            </Li>
            <Li>Replace the README.md file</Li>
            <Li>Commit as you usually would</Li>
          </ol>
          <Text>
            We also advise addressing the <code>TODO</code> items in the
            codebase, particularly the one in{" "}
            <code>@app/db/scripts/wipe-if-demo</code>
          </Text>

          <Heading order={4}>Production readiness</Heading>
          <Text>
            Remember that disabling GraphiQL does not prevent people from
            issuing arbitrary GraphQL queries against your API. Before you ship,
            be sure to{" "}
            <a href="https://www.graphile.org/postgraphile/production/">
              read the Production Considerations
            </a>{" "}
            in the PostGraphile docs. You may consider{" "}
            <a href="https://www.graphile.org/postgraphile/pricing/">
              going Pro
            </a>{" "}
            as one option for protecting your PostGraphile API; another is to
            use "stored operations" (a.k.a. "persisted queries").
          </Text>

          <Heading order={4}>Realtime</Heading>
          <Text>
            We've configured PostGraphile with <Code>@graphile/pg-pubsub</Code>{" "}
            to enable realtime events from the DB; and Apollo is configured to
            consume them. For example, if you register with email/password you
            may notice the red dot at the top right indicating that you need to
            verify your email. If you verify your email in another tab (or even
            another browser) you should notice that this dot disappears.
            Realtime ✨🌈
          </Text>

          <Heading order={4}>Server-side rendering (SSR)</Heading>
          <Text>
            If you disable JS and reload the page you should see the content is
            still displayed (this "server-side rendering" is important to
            ensuring that your users have the best low-latency experience of
            your website, and that the majority of search engines can index its
            content).
          </Text>

          <Heading order={4}>Duplicate emails</Heading>
          <Text>
            To prevent people blocking legitimate users from registering, we
            only prevent the same email address being used multiple times when
            it has been verified by someone. It's up to your application to turn
            features off/etc when the user does not have any verified email
            addresses (should you desire this).
          </Text>

          <Heading order={4}>Email in production</Heading>
          <Text>
            We've configured the project to use Amazon SES to send emails in
            production (you will need to create the relevant resources and
            provide the relevant secrets to use this); however it can easily be
            reconfigured to use your email transport service of choice.
          </Text>

          <Heading order={4}>Validation</Heading>
          <Text>
            We use{" "}
            <a href="https://mantine.dev/hooks/use-form/">Mantine's forms</a>,
            so validation is provided via these. We've shown how to connect
            server-side errors into the form validation, for example try
            registering a new account using the email address of an account{" "}
            <strong>that has already been verified</strong>.
          </Text>

          <Heading order={4}>
            One-time clone: no such thing as breaking changes
          </Heading>
          <Text>
            It's expected that you'll do a one-time clone of this project to
            base your project off, and that you will not keep your project up to
            date with this one. As such, we can make any changes we like to this
            project without breaking your project.
          </Text>
        </Grid.Col>
        <Grid.Col span={4}>
          <Heading order={4}>PostGraphile relies on your support</Heading>
          <Strong>A message from Benjie</Strong>
          <Text>
            I really hope that this project wows you 😍 and saves you huge
            amounts of time. I've certainly poured a lot of time into it!
          </Text>
          <Text>
            Without support from the community Jem and I could not keep building
            and advancing these open source projects under the hugely flexible
            MIT license. Please{" "}
            <a href="https://graphile.org/sponsor">
              join these amazing people in sponsoring PostGraphile
            </a>{" "}
            and related projects.
          </Text>
          <Text>
            Every contribution helps us to spend more time on open source.
          </Text>
          <Text>
            <Button
              component="a"
              href="https://graphile.org/sponsor"
              variant={"filled"}
            >
              Sponsor Graphile Today
            </Button>
          </Text>
          <Text>Thank you! 🙏</Text>
        </Grid.Col>
      </Grid>
    </SharedLayout>
  );
}
