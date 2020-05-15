import { Avatar } from "antd";
import React, { FC } from "react";

export const UserAvatar: FC<{
  user: { name: string; avatarUrl: string | null | undefined };
}> = (props) => {
  const { name, avatarUrl } = props.user;
  if (avatarUrl) {
    return <Avatar src={avatarUrl} />;
  } else {
    return <Avatar>{(name && name[0]) || "?"}</Avatar>;
  }
};
