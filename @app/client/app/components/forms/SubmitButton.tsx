import type { ButtonProps } from "antd";
import { Button } from "antd";
import { useIsSubmitting } from "remix-validated-form";

export const SubmitButton = ({ children, ...rest }: ButtonProps) => {
  const isSubmitting = useIsSubmitting();
  return (
    <Button
      htmlType="submit"
      disabled={isSubmitting}
      loading={isSubmitting}
      {...rest}
    >
      {children}
    </Button>
  );
};
