import classNames from "classnames";
import { useField } from "remix-validated-form";

type FormInputProps = {
  name: string;
  label?: React.ReactNode;
  required?: boolean;
  children?: React.ReactNode;
  inputPrefix?: React.ReactNode;
};

export const FormInput = ({
  name,
  label,
  required,
  children,
  inputPrefix,
  className,
  ...rest
}: FormInputProps &
  React.DetailedHTMLProps<
    React.InputHTMLAttributes<HTMLInputElement>,
    HTMLInputElement
  >) => {
  const { getInputProps, error } = useField(name);

  const inputElement = (
    <input
      className={classNames([
        "input input-bordered",
        { "w-full pl-10": !!inputPrefix },
        { "input-error": !!error },
        className,
      ])}
      {...getInputProps({ id: name, ...rest })}
    />
  );

  return (
    <div className="form-control">
      {!!label && (
        <label className="label" htmlFor={name}>
          {label}
        </label>
      )}
      {inputPrefix ? (
        <div className="relative">
          <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
            {inputPrefix}
          </div>
          {inputElement}
        </div>
      ) : (
        inputElement
      )}
      <div className="min-h-6">
        {error && <p className="mt-1 text-sm text-error">{error}</p>}
      </div>
      {children}
    </div>
  );
};
