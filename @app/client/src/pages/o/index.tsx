import React, { useEffect } from "react";
import { NextPage } from "next";
import Router from "next/router";

const O: NextPage = () => {
  useEffect(() => {
    Router.replace("/");
  }, []);
  return <div>Redirecting...</div>;
};

export default O;
