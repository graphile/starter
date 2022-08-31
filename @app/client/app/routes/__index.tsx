import { companyName, projectName } from "@app/config";
import { Form, Link, Outlet, useLocation, useMatches } from "@remix-run/react";
import classNames from "classnames";
import { AuthenticityTokenInput } from "remix-utils";

import { Warn } from "~/components";
import { useOptionalUser, useRootMatchesData } from "~/utils/hooks";

export default function RootIndex() {
  const rootData = useRootMatchesData();
  const matches = useMatches();
  const currentUser = useOptionalUser();
  const { pathname, search, hash } = useLocation();

  const limitContentWidth = !(
    matches.filter((match) => match.handle?.fullWidth).length > 0
  );
  const hideLogin =
    matches.filter((match) => match.handle?.hideLogin).length > 0;
  const titleHandle: any | undefined = matches
    .filter((match) => match.handle?.title)
    .pop()?.handle;
  const { title, titleHref } = titleHandle ?? {};

  const currentRouteURL = `${pathname}${search}${hash}`;

  return (
    <div className="min-h-screen flex flex-col items-stretch">
      <div className="navbar bg-base-100 flex-shrink-0">
        <div className="navbar-start">
          <Link
            to="/"
            className="btn btn-ghost normal-case text-base md:text-xl"
          >
            {projectName}
          </Link>
        </div>
        <div className="navbar-center">
          <h3 className="text-base md:text-lg">
            {titleHref ? (
              <Link to={titleHref} data-cy="layout-header-titlelink">
                {title}
              </Link>
            ) : (
              title
            )}
          </h3>
        </div>
        <div className="navbar-end">
          {currentUser ? (
            <div
              className="dropdown dropdown-end"
              data-cy="layout-dropdown-user"
            >
              <Warn
                okay={currentUser.isVerified}
                className="right-2 top-2"
                data-cy="header-unverified-warning"
              >
                <label
                  tabIndex={0}
                  className="btn btn-ghost btn-circle avatar placeholder"
                >
                  <div className="w-10 rounded full">
                    <span>
                      {currentUser.name
                        ?.split(" ")
                        .map((part) => part.charAt(0).toUpperCase())
                        .slice(0, 3) // max 3 initials
                        .join("")}
                    </span>
                  </div>
                </label>
              </Warn>
              <ul
                tabIndex={0}
                className="menu menu-compact dropdown-content shadow bg-base-100 rounded-b-box w-52"
              >
                <li>
                  <Link
                    to="/settings"
                    data-cy="layout-link-settings"
                    onClick={(e) => e.currentTarget.blur()}
                  >
                    <Warn okay={currentUser.isVerified}>
                      <span className="mr-2">Profile</span>
                    </Warn>
                  </Link>
                </li>
                <li>
                  <Link to="/report" onClick={(e) => e.currentTarget.blur()}>
                    Report Template
                  </Link>
                </li>
                <li>
                  <Form
                    method="post"
                    action="/logout"
                    onClick={(e) => e.currentTarget.blur()}
                  >
                    <AuthenticityTokenInput />
                    <button className="button-link" type="submit">
                      Logout
                    </button>
                  </Form>
                </li>
              </ul>
            </div>
          ) : hideLogin ? null : (
            <Link
              to={`/login?next=${encodeURIComponent(currentRouteURL)}`}
              data-cy="header-login-button"
            >
              Sign in
            </Link>
          )}
        </div>
      </div>
      <div
        className={classNames([
          "flex-grow flex flex-col items-center",
          limitContentWidth ? "max-w-5xl w-full self-center" : undefined,
        ])}
      >
        <Outlet />
      </div>
      <footer className="footer items-center p-4 bg-neutral text-neutral-content flex-shrink-0">
        <div className="items-center grid-flow-col">
          <p>
            Copyright &copy; {new Date().getFullYear()} {companyName}. All
            rights reserved.
            {rootData?.ENV.T_AND_C_URL ? (
              <span>
                {" "}
                <a
                  style={{ textDecoration: "underline" }}
                  href={rootData.ENV.T_AND_C_URL}
                >
                  Terms and conditions
                </a>
              </span>
            ) : null}
          </p>
        </div>
        <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
          <p>
            Powered by{" "}
            <a
              style={{ textDecoration: "underline" }}
              href="https://graphile.org/postgraphile"
              target="_blank"
              rel="noreferrer"
            >
              PostGraphile
            </a>
          </p>
          <a href="https://twitter.com" target="_blank" rel="noreferrer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path>
            </svg>
          </a>
          <a href="https://youtube.com" target="_blank" rel="noreferrer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
            </svg>
          </a>
          <a
            href="https://www.nateliason.com/blog/delete-facebook"
            target="_blank"
            rel="noreferrer"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              className="fill-current"
            >
              <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path>
            </svg>
          </a>
        </div>
      </footer>
    </div>
  );
}
