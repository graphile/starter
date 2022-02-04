import { Box, BoxProps } from "@mantine/core";
import React from "react";

export const Warn: React.FC<{ okay: boolean } & BoxProps<"div">> = ({
  children,
  okay,
  ...other
}) => {
  return okay ? (
    <>{children}</>
  ) : (
    <Box style={{ position: "relative" }} {...other}>
      {children}
      <Box
        component={"sup"}
        data-show="true"
        className="badge-dot"
        sx={(theme) => ({
          position: "absolute",
          top: 0,
          overflow: "hidden",
          right: 0,
          transform: "translate(50%,-50%)",
          transformOrigin: "100% 0",
          zIndex: "auto",
          width: 6,
          minWidth: 6,
          height: 6,
          background: theme.colors.red[7],
          borderRadius: "100%",
          boxShadow: `0 0 0 1px ${theme.colors.red[3]}`,
        })}
      />
    </Box>
  );
};
