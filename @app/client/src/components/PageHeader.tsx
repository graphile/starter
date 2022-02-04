import { Group, Paper, Title, TitleProps } from "@mantine/core";
import React from "react";

export function PageHeader({
  title,
  extra,
  ...other
}: { title: string; extra?: React.ReactNode } & TitleProps) {
  return (
    <Paper>
      <Group position={"apart"}>
        <Title order={2} style={{ lineHeight: 1, marginBottom: 24 }} {...other}>
          {title}
        </Title>
        {extra ? extra : null}
      </Group>
    </Paper>
  );
}
