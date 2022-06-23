import type { SpinProps } from "antd/lib/spin";
import Spin from "antd/lib/spin";
import type { FC } from "react";

export const SpinPadded: FC<SpinProps> = (props) => (
  <div
    style={{
      padding: "2rem",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}
  >
    <Spin {...props} />
  </div>
);
