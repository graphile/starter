import React, { useEffect } from "react";
import { navigate } from "vite-plugin-ssr/client/router";

export { Page };

const Page: React.FC = () => {
  useEffect(() => {
    navigate("/");
  }, []);
  return <div>Redirection...</div>;
};
