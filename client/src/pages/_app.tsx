import "antd/dist/antd.less";
import "nprogress/nprogress.css";
import * as React from "react";
import App, { Container } from "next/app";
import { ApolloProvider } from "react-apollo";
import withApollo from "../lib/withApollo";
import { ApolloClient } from "apollo-client";
import Router from "next/router";
import { notification } from "antd";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
});

if (typeof window !== "undefined") {
  Router.events.on("routeChangeStart", () => {
    NProgress.start();
  });

  Router.events.on("routeChangeComplete", () => {
    NProgress.done();
  });
  Router.events.on("routeChangeError", (err: Error | string) => {
    NProgress.done();
    notification.open({
      message: "Page load failed",
      description: `This is very embarassing! Please reload the page. Further error details: ${
        typeof err === "string" ? err : err.message
      }`,
      duration: 0,
    });
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
      <Container>
        <ApolloProvider client={apollo}>
          <Component {...pageProps} />
        </ApolloProvider>
      </Container>
    );
  }
}

export default withApollo(MyApp);
