import { Group, Paper, PaperProps, Text } from "@mantine/core";
import React from "react";
import { AiOutlineInbox } from "react-icons/ai";

export interface EmptyProps extends PaperProps<any> {
  description?: string | React.ReactNode;
  icon?: React.ReactNode;
}
export const Empty: React.FC<Omit<EmptyProps, "defaultProps">> = ({
  icon,
  description,
  ...paperProps
}) => {
  return (
    <Paper withBorder padding={48} {...paperProps}>
      <Group align={"center"} position={"center"} color={"dimmed"}>
        <div style={{ textAlign: "center" }}>
          {icon ? icon : <AiOutlineInbox style={{ height: 48, width: 48 }} />}
          <Text color={"dimmed"}>{description ? description : "No data"}</Text>
        </div>
      </Group>
    </Paper>
  );
};
