import classNames from "classnames";
import React from "react";
import { useIsSubmitting } from "remix-validated-form";

export const SubmitButton = ({
  children,
  className,
  ...rest
}: React.DetailedHTMLProps<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  HTMLButtonElement
>) => {
  const isSubmitting = useIsSubmitting();
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className={classNames("btn", className, { loading: isSubmitting })}
      {...rest}
    >
      {children}
    </button>
  );
};
