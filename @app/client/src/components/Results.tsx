import { Box, Group, Text } from "@mantine/core";
import React, { ReactNode } from "react";
import { IconType } from "react-icons";
import {
  AiFillAlert,
  AiFillCheckCircle,
  AiFillQuestionCircle,
  AiFillWarning,
} from "react-icons/ai";

export interface ResultProps {
  status: "success" | "error" | "warning" | "400" | "401" | "403" | "404";
  title: string;
  subTitle?: string;
  extra?: ReactNode;
}

export const Result: React.FC<ResultProps> = ({
  status,
  title,
  subTitle,
  extra,
}) => {
  const iconMap: Record<
    ResultProps["status"],
    { color: string; icon: IconType }
  > = {
    success: { color: "teal", icon: AiFillCheckCircle },
    error: { color: "gray", icon: AiFillAlert },
    warning: { color: "gray", icon: AiFillWarning },
    "400": { color: "gray", icon: AiFillQuestionCircle },
    "401": { color: "gray", icon: AiFillAlert },
    "403": { color: "gray", icon: AiFillAlert },
    "404": { color: "gray", icon: AiFillQuestionCircle },
  };

  const { color, icon: Icon } = iconMap[status];
  return (
    <Group direction={"column"} position={"center"} spacing={"lg"}>
      <Box sx={{ color }}>
        <Icon size={"10em"} />
      </Box>
      <Text size={"lg"}>{title}</Text>
      {subTitle && <Text>{subTitle}</Text>}
      {extra}
    </Group>
  );
};
