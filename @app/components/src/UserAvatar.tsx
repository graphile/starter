import { Avatar } from "antd";
import React, { FC } from "react";

export const UserAvatar: FC<{
  user: {
    name?: string | null;
    avatarUrl?: string | null;
  };
}> = (props) => {
  const { name, avatarUrl } = props.user;
  if (avatarUrl) {
    return <Avatar src={avatarUrl} />;
  } else {
    return <Avatar>{(name && name[0]) || "?"}</Avatar>;
  }
};
