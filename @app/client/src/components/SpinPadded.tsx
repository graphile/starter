import { Loader, LoaderProps } from "@mantine/core";
import React, { FC } from "react";

export const SpinPadded: FC<LoaderProps> = (props) => (
  <div
    style={{
      padding: "2rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Loader {...props} />
  </div>
);
