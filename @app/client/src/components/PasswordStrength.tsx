import {
  Box,
  PasswordInput,
  PasswordInputProps,
  Popover,
  Progress,
  Text,
} from "@mantine/core";
import React, { useState } from "react";
import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";

function PasswordRequirement({
  meets,
  label,
}: {
  meets: boolean;
  label: string;
}) {
  return (
    <Text
      color={meets ? "teal" : "red"}
      sx={{ display: "flex", alignItems: "center" }}
      mt={7}
      size="sm"
    >
      {meets ? <AiOutlineCheck /> : <AiOutlineClose />}{" "}
      <Box ml={10}>{label}</Box>
    </Text>
  );
}

export const passwordRequirements = [
  { re: /\S{6,}/, label: "Includes at least 6 characters" },
  { re: /[0-9]/, label: "Includes number" },
  { re: /[a-z]/, label: "Includes lowercase letter" },
  { re: /[A-Z]/, label: "Includes uppercase letter" },
  { re: /[$&+,:;=?@#|'<>.^*()%!-]/, label: "Includes special symbol" },
];

function getStrength(password: string) {
  let multiplier = password.length > 5 ? 0 : 1;

  passwordRequirements.forEach((requirement) => {
    if (!requirement.re.test(password)) {
      multiplier += 1;
    }
  });

  return Math.max(
    100 - (100 / (passwordRequirements.length + 1)) * multiplier,
    10
  );
}

export const PasswordStrength: React.FC<Omit<PasswordInputProps, "children">> =
  ({ onChange, value, ...inputProps }) => {
    const [popoverOpened, setPopoverOpened] = useState(false);
    const checks = passwordRequirements.map((requirement, index) => (
      <PasswordRequirement
        key={index}
        label={requirement.label}
        meets={requirement.re.test(String(value))}
      />
    ));

    const strength = getStrength(String(value));
    const color = strength === 100 ? "teal" : strength > 50 ? "yellow" : "red";

    // TODO mc-2022-02-01 mantine bug w/ reveal password actionicon
    return (
      <Popover
        opened={popoverOpened}
        position="bottom"
        placement="start"
        withArrow
        styles={{ popover: { width: "100%" } }}
        sx={{ display: "block" }}
        noFocusTrap
        transition="pop-top-left"
        onFocusCapture={() => setPopoverOpened(true)}
        onBlurCapture={() => setPopoverOpened(false)}
        target={
          <PasswordInput
            required
            value={value}
            onChange={onChange}
            {...inputProps}
          />
        }
      >
        <Progress
          color={color}
          value={strength}
          size={5}
          style={{ marginBottom: 10 }}
        />
        {checks}
      </Popover>
    );
  };
