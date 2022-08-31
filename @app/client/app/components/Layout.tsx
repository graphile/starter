import classNames from "classnames";
import React from "react";

export interface WarnProps
  extends React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLDivElement>,
    HTMLDivElement
  > {
  children: React.ReactNode;
  okay?: boolean;
}

export function Warn({ children, okay, className, ...props }: WarnProps) {
  return (
    <div className="indicator">
      {!okay && (
        <span
          className={classNames(
            "indicator-item badge badge-secondary badge-xs",
            className
          )}
          {...props}
        />
      )}
      {children}
    </div>
  );
}
