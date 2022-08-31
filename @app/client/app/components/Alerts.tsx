import classNames from "classnames";
import type { IconType } from "react-icons";
import {
  HiOutlineCheckCircle,
  HiOutlineExclamation,
  HiOutlineXCircle,
} from "react-icons/hi";

export interface AlertProps {
  title?: string;
  message?: string | null;
  code?: string | null;
  children?: React.ReactChild;
}

export function ErrorAlert(props: AlertProps) {
  return (
    <GenericAlert icon={HiOutlineXCircle} className="alert-error" {...props} />
  );
}

export function WarningAlert(props: AlertProps) {
  return (
    <GenericAlert
      icon={HiOutlineExclamation}
      className="alert-warning"
      {...props}
    />
  );
}

export function SuccessAlert(props: AlertProps) {
  return (
    <GenericAlert
      icon={HiOutlineCheckCircle}
      className="alert-success"
      {...props}
    />
  );
}

export interface GenericAlertProps extends AlertProps {
  icon?: IconType;
  className?: string;
}

export function GenericAlert({
  icon: Icon,
  className,
  title,
  message,
  code,
  children,
}: GenericAlertProps) {
  return (
    <div className={classNames("alert", className)}>
      <div>
        {!!Icon && (
          <span className="text-2xl">
            <Icon />
          </span>
        )}
        <div>
          {!!title && <h1 className="text-xl font-bold">{title}</h1>}
          <div>
            {children}
            {message}
            {!!code && (
              <span>
                {" "}
                (Error code: <code>ERR_{code}</code>)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
