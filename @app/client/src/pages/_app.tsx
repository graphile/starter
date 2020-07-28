import "antd/dist/antd.less";
import "nprogress/nprogress.css";
import "../styles.less";

import { ApolloProvider } from "@apollo/react-hooks";
import { withApollo } from "@app/lib";
import { notification } from "antd";
import { ApolloClient } from "apollo-client";
import App from "next/app";
import Router from "next/router";
import NProgress from "nprogress";
import * as React from "react";

declare global {
  interface Window {
    __GRAPHILE_APP__: {
      ROOT_URL?: string;
      T_AND_C_URL?: string;
    };
  }
}

NProgress.configure({
  showSpinner: false,
});

if (typeof window !== "undefined") {
  const nextDataEl = document.getElementById("__NEXT_DATA__");
  if (!nextDataEl || !nextDataEl.textContent) {
    throw new Error("Cannot read from __NEXT_DATA__ element");
  }
  const data = JSON.parse(nextDataEl.textContent);
  window.__GRAPHILE_APP__ = {
    ROOT_URL: data.query.ROOT_URL,
    T_AND_C_URL: data.query.T_AND_C_URL,
  };

  Router.events.on("routeChangeStart", () => {
    NProgress.start();
  });

  Router.events.on("routeChangeComplete", () => {
    NProgress.done();
  });
  Router.events.on("routeChangeError", (err: Error | string) => {
    NProgress.done();
    if (err["cancelled"]) {
      // No worries; you deliberately cancelled it
    } else {
      notification.open({
        message: "Page load failed",
        description: `This is very embarrassing! Please reload the page. Further error details: ${
          typeof err === "string" ? err : err.message
        }`,
        duration: 0,
      });
    }
  });
}

class MyApp extends App<{ apollo: ApolloClient<any> }> {
  static async getInitialProps({ Component, ctx }: any) {
    let pageProps = {};

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx);
    }

    return { pageProps };
  }

  render() {
    const { Component, pageProps, apollo } = this.props;

    return (
      <ApolloProvider client={apollo}>
        <Component {...pageProps} />
      </ApolloProvider>
    );
  }
}

export default withApollo(MyApp);
