import React from "react";
import { Typography } from "antd";

const { Title, Paragraph, Text } = Typography;

// Extract the type of a function's first argument
// Usage: `Arg1<typeof functionHere>`
type Arg1<T> = T extends (arg: infer U) => any ? U : never;

export const H1 = (props: Arg1<typeof Title>) => <Title level={1} {...props} />;
export const H2 = (props: Arg1<typeof Title>) => <Title level={2} {...props} />;
export const H3 = (props: Arg1<typeof Title>) => <Title level={3} {...props} />;
export const H4 = (props: Arg1<typeof Title>) => <Title level={4} {...props} />;

export const P = Paragraph;
export const Strong = (props: Arg1<typeof Text>) => <Text strong {...props} />;
