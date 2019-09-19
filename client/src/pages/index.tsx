import * as React from "react";
import { Button, Row, Col, Typography } from "antd";
const { Text, Title, Paragraph } = Typography;
import SharedLayout from "../components/SharedLayout";

export default function Home() {
  return (
    <SharedLayout title="Home">
      <Row type="flex" justify="space-between" gutter={32}>
        <Col xs={28} sm={16}>
          <Title data-cy="homepage-header">
            Welcome to the PostGraphile starter
          </Title>
          <Paragraph>
            This project can serve as a basis for your own project. We've added
            many features that most projects require, but you're free to remove
            them or replace them with whatever you need.
          </Paragraph>
          <Paragraph>
            <Text mark>
              Please read this page before continuing as it contains a lot of
              context.
            </Text>
            <Title level={4}>First user is admin</Title>
            <Paragraph>
              The first user to register will automatically have their "admin"
              property set true. Admin doesn't do anything in this starter, but
              you can use it in your own applications. To disable this, delete
              the database function{" "}
              <Text code>app_private.tg_users__make_first_user_admin()</Text>{" "}
              and related triggers.
            </Paragraph>
            <Title level={4}>Page load delays: development only</Title>
            <Paragraph>
              We use Next.js to serve the React app. This gives us server-side
              rendering, routing, bundle splitting, hot reloading, and much
              more. However, in development when you visit a page it must first
              be loaded from the file system and transpiled and bundled by the
              server, served to the client, and then executed. This means there
              can be a small delay when loading a web page for the first time in
              development. In production, this delay should be vastly smaller,
              and can be eliminated with prefetching. You can read more about
              this in the{" "}
              <a href="https://nextjs.org/docs#prefetching-pages">
                Next.js docs
              </a>
            </Paragraph>

            <Title level={4}>Page hangs: development only</Title>
            <Paragraph>
              If the page hangs this is likely because the Next server was
              restarted. Please reload the page.
            </Paragraph>

            <Title level={4}>Emails</Title>
            <Paragraph>
              <strong>
                In development we don't send any emails to real email addresses
              </strong>
              , instead all emails are sent to{" "}
              <a href="http://ethereal.email">ethereal.email</a> where you can
              browse them.
            </Paragraph>
            <Paragraph>
              Keep an eye on the terminal; when an email is triggered the server
              will log a URL to view the email.
            </Paragraph>

            <Title level={4}>This Page</Title>
            <Paragraph>
              This file is located in the client pages folder:{" "}
              <code>client/src/pages/index.tsx</code>. If you edit this file and
              save, the page in the browser should automatically update.
            </Paragraph>
            <Title level={4}>The Server</Title>
            <Paragraph>
              The entry point to the server is{" "}
              <code>backend/src/server/index.ts</code>; this creates an
              Express.js server and installs a number of middlewares, including
              PostGraphile.
            </Paragraph>
            <Title level={4}>Realtime</Title>
            <Paragraph>
              We've configured PostGraphile with{" "}
              <Text code>@graphile/pg-pubsub</Text> to enable realtime events
              from the DB; and Apollo is configured to consume them. For
              example, if you register with email/password you may notice the
              red dot at the top right indicating that you need to verify your
              email. If you verify your email in another tab (or even another
              browser) you should notice that this dot disappears. Realtime ✨🌈
            </Paragraph>
            <Title level={4}>Making it yours</Title>
            <ol>
              <li>
                Download and extract a zip of the latest release from GitHub
              </li>
              <li>
                In that folder run:
                <ul>
                  <li>
                    <code>git init</code>
                  </li>
                  <li>
                    <code>git add .</code>
                  </li>
                  <li>
                    <code>git commit -m"PostGraphile starter base"</code>
                  </li>
                </ul>
              </li>
              <li>
                Change the project name in <code>package.json</code>
              </li>
              <li>
                Change the project settings in{" "}
                <code>backend/src/config.ts</code>
              </li>
              <li>Replace the README.md file</li>
              <li>Commit as you usually would</li>
            </ol>
            <Title level={4}>What now?</Title>
            <Paragraph>
              If you're happy with our user account system, we recommend that
              you commit this first migration with{" "}
              <code>yarn db:migrate commit</code>, and then set about making
              this application your own.
            </Paragraph>
            <Paragraph>
              To get started, click "login" at the top right, then choose
              "Register Here".
            </Paragraph>
            <hr />
            <Title level={3}>Further notes</Title>
            <Title level={4}>Server-side rendering (SSR)</Title>
            <Paragraph>
              If you disable JS and reload the page you should see the content
              is still displayed (this "server-side rendering" is important to
              ensuring that your users have the best low-latency experience of
              your website, and that the majority of search engines can index
              its content).
            </Paragraph>
            <Title level={4}>Duplicate emails</Title>
            <Paragraph>
              To prevent people blocking legitimate users from registering, we
              only prevent the same email address being used multiple times when
              it has been verified by someone. It's up to your application to
              turn features off/etc when the user does not have any verified
              email addresses (should you desire this).
            </Paragraph>
            <Title level={4}>Email in production</Title>
            <Paragraph>
              We've configured the project to use Amazon SES to send emails in
              production (you will need to create the relevant resources and
              provide the relevant secrets to use this); however it can easily
              be reconfigured to use your email transport service of choice.
            </Paragraph>
            <Title level={4}>Validation</Title>
            <Paragraph>
              We use{" "}
              <a href="https://ant.design/components/form/">AntD's forms</a>, so
              validation is provided via these. We've shown how to connect
              server-side errors into the form validation, for example try
              registering a new account using the email address of an account{" "}
              <strong>that has already been verified</strong>.
            </Paragraph>
            <Title level={4}>
              One-time clone: no such thing as breaking changes
            </Title>
            <Paragraph>
              It's expected that you'll do a one-time clone of this project to
              base your project off, and that you will not keep your project up
              to date with this one. As such, we can make any changes we like to
              this project without breaking your project.
            </Paragraph>
          </Paragraph>
        </Col>
        <Col xs={28} sm={8}>
          <Title level={4}>PostGraphile relies on your donations</Title>
          <Paragraph>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vitae
            ligula gravida, molestie ex ut, congue ipsum. Sed eget malesuada
            odio. Vivamus semper, urna vel cursus laoreet, purus justo volutpat
            ligula, vel interdum.
          </Paragraph>
          <Paragraph>
            sapien, et tincidunt ante pulvinar malesuada. Nam consequat
            facilisis dolor. Nunc dignissim lacus dolor. Quisque sagittis
            suscipit felis in ultricies. Suspendisse potenti. Curabitur
            dignissim, eros a imperdiet vestibulum, lacus tellus pharetra
            libero, ac efficitur metus neque eget tortor.
          </Paragraph>
          <Paragraph>
            I really hope that this project wows you 😍 and saves you huge
            amounts of time. I've certainly poured a lot of time into it! To
            help me to keep building and advancing projects like this, please
            join <a href="https://graphile.org/sponsor">these amazing people</a>{" "}
            and
          </Paragraph>
          <Button type="primary" block>
            Donate
          </Button>
        </Col>
      </Row>
    </SharedLayout>
  );
}
