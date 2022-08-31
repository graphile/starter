export default function RootContent() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-2">
      <div className="col-span-2 space-y-2">
        <h1 className="text-3xl" data-cy="homepage-header">
          Welcome to the PostGraphile starter
        </h1>
        <div>
          This project can serve as a basis for your own project. We've added
          many features that most projects require, but you're free to remove
          them or replace them with whatever you need.
        </div>

        <div>
          <span className="italic">
            Please read the next few sections before continuing.
          </span>
        </div>

        <h4 className="text-xl">Remix</h4>
        <div>
          We use Remix to serve the React app. This gives us server-side
          rendering, routing, bundle splitting, hot reloading, and much more.
        </div>

        <h4 className="text-xl">Page hangs: development only</h4>
        <div>
          If the page hangs (or shows a connection error) this is likely because
          the Remix server was restarted. Please reload the page.
        </div>

        <h4 className="text-xl">Emails</h4>
        <div>
          <strong>
            In development we don't send any emails to real email addresses
          </strong>
          , instead all emails are sent to{" "}
          <a className="link link-accent" href="http://ethereal.email">
            ethereal.email
          </a>{" "}
          where you can browse them. Keep an eye on the terminal; when an email
          is triggered the server will log a URL to view the email.
        </div>

        <h4 className="text-xl">
          <a className="link link-accent" href="/graphiql">
            Graph<em>i</em>QL
          </a>
        </h4>
        <div>
          You can browse the GraphQL API and even issue GraphQL queries using
          the built in Graph<em>i</em>QL interface located at{" "}
          <a className="link link-accent" href="/graphiql">
            <code>/graphiql</code>
          </a>
          .
        </div>

        <h4 className="text-xl">
          This page:{" "}
          <a
            className="link link-accent"
            href="https://github.com/fnimick/starter/blob/migrate-remix/@app/client/app/routes/__index/index.tsx"
          >
            <code>@app/client/app/routes/__index/index.tsx</code>
          </a>
        </h4>
        <div>
          If you edit this file and save, the page in the browser should
          automatically refresh and update.
        </div>

        <h4 className="text-xl">
          The server:{" "}
          <a
            className="link link-accent"
            href="https://github.com/graphile/starter/blob/main/@app/server/src/index.ts"
          >
            <code>@app/server/src/index.ts</code>
          </a>
        </h4>
        <div>
          This entry point creates an Express.js server and installs a number of
          middlewares, including PostGraphile.
        </div>

        <h4 className="text-xl">Initial migration</h4>
        <div>
          We use <code>graphile-migrate</code> in this project to manage
          database migrations; this allows you to change the database very
          rapidly by just editing the current migration file:{" "}
          <code>migrations/current.sql</code>. This file should be written in an
          idempotent manner so that it can be ran repeatedly without causing
          issues.
        </div>
        <div>
          We've committed the first migration for you (which builds the user
          system), but should you wish to customize this user system the easiest
          way is to run <code>yarn db uncommit</code> which will undo this
          initial migration and move its content back to current.sql for you to
          modify. Please see{" "}
          <a
            className="link link-accent"
            href="https://github.com/graphile/migrate/blob/main/README.md"
          >
            the graphile-migrate documentation
          </a>
          .
        </div>
        <div>
          <p>
            <b>WARNING</b>: <code>graphile-migrate</code> is experimental, you
            may want to find a different migration solution before putting it
            into production (your sponsorship will help make this project stable
            faster).
          </p>
        </div>

        <h4 className="text-xl">isAdmin</h4>
        <div>
          The <code>isAdmin</code> flag doesn't do anything in this starter, but
          you can use it in your own applications should you need it.
        </div>

        <h4 className="text-xl">What now?</h4>
        <div>
          To get started, click "Sign in" at the top right, then choose "Create
          One" to create a new account.
        </div>
        <div>
          When you're happy, you can add database changes to{" "}
          <code>current.sql</code> and see them reflected in the GraphiQL
          interface a{" "}
          <a className="link link-accent" href="/graphiql">
            /graphiql
          </a>
          .
        </div>

        <div className="divider" />

        <h3 className="text-2xl">Further notes</h3>

        <div>
          <span className="italic">You can read this later</span>. The important
          things were above; below is additional information worth a read when
          you're done experimenting.
        </div>

        <h4 className="text-xl">Making it yours</h4>
        <div>
          This project isn't intended to be <code>git clone</code>'d; instead
          you should start a new git repository with the code from the latest
          release:
        </div>
        <ol className="list-decimal list-inside">
          <li>
            Download and extract a zip of the{" "}
            <a
              className="link link-accent"
              href="https://github.com/graphile/starter/releases"
            >
              latest release from GitHub
            </a>
          </li>
          <li>
            In that folder run:
            <ul className="list-disc list-inside indent-2">
              <li>
                <code>git init</code>
              </li>
              <li>
                <code>git add .</code>
              </li>
              <li>
                <code>git commit -m "PostGraphile starter base"</code>
              </li>
            </ul>
          </li>
          <li>
            Change the project name in <code>package.json</code>
          </li>
          <li>
            Change the project settings in <code>@app/config/src/index.ts</code>
          </li>
          <li>Replace the README.md file</li>
          <li>Commit as you usually would</li>
        </ol>
        <div>
          We also advise addressing the <code>TODO</code> items in the codebase,
          particularly the one in <code>@app/db/scripts/wipe-if-demo</code>
        </div>

        <h4 className="text-xl">Production readiness</h4>
        <div>
          Remember that disabling GraphiQL does not prevent people from issuing
          arbitrary GraphQL queries against your API. Before you ship, be sure
          to{" "}
          <a
            className="link link-accent"
            href="https://www.graphile.org/postgraphile/production/"
          >
            read the Production Considerations
          </a>{" "}
          in the PostGraphile docs. You may consider{" "}
          <a
            className="link link-accent"
            href="https://www.graphile.org/postgraphile/pricing/"
          >
            going Pro
          </a>{" "}
          as one option for protecting your PostGraphile API; another is to use
          "stored operations" (a.k.a. "persisted queries").
        </div>

        <h4 className="text-xl">Realtime</h4>
        <div>
          We've configured PostGraphile with <code>@graphile/pg-pubsub</code> to
          enable realtime events from the DB; and Apollo is configured to
          consume them. For example, if you register with email/password you may
          notice the red dot at the top right indicating that you need to verify
          your email. If you verify your email in another tab (or even another
          browser) you should notice that this dot disappears. Realtime ✨🌈
        </div>

        <h4 className="text-xl">Server-side rendering (SSR)</h4>
        <div>
          If you disable JS and reload the page you should see the content is
          still displayed (this "server-side rendering" is important to ensuring
          that your users have the best low-latency experience of your website,
          and that the majority of search engines can index its content).
        </div>

        <h4 className="text-xl">Duplicate emails</h4>
        <div>
          To prevent people blocking legitimate users from registering, we only
          prevent the same email address being used multiple times when it has
          been verified by someone. It's up to your application to turn features
          off/etc when the user does not have any verified email addresses
          (should you desire this).
        </div>

        <h4 className="text-xl">Email in production</h4>
        <div>
          We've configured the project to use Amazon SES to send emails in
          production (you will need to create the relevant resources and provide
          the relevant secrets to use this); however it can easily be
          reconfigured to use your email transport service of choice.
        </div>

        <h4 className="text-xl">Validation</h4>
        <div>
          We use{" "}
          <a
            className="link link-accent"
            href="https://ant.design/components/form/"
          >
            AntD's forms
          </a>
          , so validation is provided via these. We've shown how to connect
          server-side errors into the form validation, for example try
          registering a new account using the email address of an account{" "}
          <strong>that has already been verified</strong>.
        </div>

        <h4 className="text-xl">
          One-time clone: no such thing as breaking changes
        </h4>
        <div>
          It's expected that you'll do a one-time clone of this project to base
          your project off, and that you will not keep your project up to date
          with this one. As such, we can make any changes we like to this
          project without breaking your project.
        </div>
      </div>
      <div className="space-y-2">
        <h4 className="text-xl">PostGraphile relies on your support</h4>
        <div>
          <b>A message from Benjie</b>
        </div>
        <div>
          I really hope that this project wows you 😍 and saves you huge amounts
          of time. I've certainly poured a lot of time into it!
        </div>
        <div>
          Without support from the community Jem and I could not keep building
          and advancing these open source projects under the hugely flexible MIT
          license. Please{" "}
          <a className="link link-accent" href="https://graphile.org/sponsor">
            join these amazing people in sponsoring PostGraphile
          </a>{" "}
          and related projects.
        </div>
        <div>
          Every contribution helps us to spend more time on open source.
        </div>
        <div>
          <a className="btn btn-primary" href="https://graphile.org/sponsor">
            Sponsor Graphile Today
          </a>
        </div>
        <div>Thank you! 🙏</div>
      </div>
    </div>
  );
}
