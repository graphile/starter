import { Button, Popover, PopoverProps, Text } from "@mantine/core";
import React from "react";
import { AiOutlineWarning } from "react-icons/ai";

export interface PopconfirmProps extends PopoverProps {
  title: string;
  onConfirm: () => void;
  onClose: () => void;
  okText: string;
  cancelText: string;
}

export const Popconfirm: React.FC<Omit<PopconfirmProps, "children">> = ({
  title,
  opened,
  onClose,
  onConfirm,
  okText,
  cancelText,
  target,
}) => {
  return (
    <Popover
      opened={opened}
      onClose={onClose}
      target={target}
      position={"top"}
      withArrow
    >
      <div style={{ display: "flex", marginBottom: "1rem", gap: 8 }}>
        <AiOutlineWarning />
        <Text size={"sm"}>{title}</Text>
      </div>
      <div style={{ display: "flex", justifyContent: "end", gap: 8 }}>
        <Button variant="outline" size={"xs"} onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          size={"xs"}
          onClick={() => {
            onConfirm();
            if (onClose) onClose();
          }}
        >
          {okText}
        </Button>
      </div>
    </Popover>
  );
};
