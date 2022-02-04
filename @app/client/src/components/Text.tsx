import { Paper, Text, Title } from "@mantine/core";
import React, { FC } from "react";

// Extract the type of a function's first argument
// Usage: `Arg1<typeof functionHere>`
type Arg1<T> = T extends (arg: infer U) => any ? U : never;

type TitleProps = Arg1<typeof Title>;

export const H1: FC<TitleProps> = (props) => <Title order={1} {...props} />;
export const H2: FC<TitleProps> = (props) => <Title order={2} {...props} />;
export const H3: FC<TitleProps> = (props) => <Title order={3} {...props} />;
export const H4: FC<TitleProps> = (props) => <Title order={4} {...props} />;
export const H5: FC<TitleProps> = (props) => <Title order={5} {...props} />;
export const H6: FC<TitleProps> = (props) => <Title order={6} {...props} />;

const Paragraph: typeof Text = Text;
export { Paragraph as P };

type TextProps = Arg1<typeof Text>;
export const Strong: FC<TextProps> = (props) => (
  <Text as={"strong"} {...props} />
);

export const Heading: FC<TitleProps> = ({ children, order, ...rest }) => (
  <Paper>
    <Title order={order || 1} {...rest}>
      {children}
    </Title>
  </Paper>
);
