import type { ColProps, InputProps } from "antd";
import { Form, Input } from "antd";
import { useField } from "remix-validated-form";

type FormInputProps = {
  name: string;
  label?: React.ReactNode;
  required?: boolean;
  labelCol?: ColProps;
  wrapperCol?: ColProps;
  children?: React.ReactNode;
};

export const FormInput = ({
  name,
  label,
  required,
  labelCol,
  wrapperCol,
  children,
  ...rest
}: FormInputProps & InputProps) => {
  const { getInputProps, error } = useField(name);

  return (
    <>
      <Form.Item
        validateStatus={error ? "error" : ""}
        help={error}
        label={label}
        name={name}
        labelCol={labelCol}
        wrapperCol={wrapperCol}
        required={required}
      >
        <Input required={required} {...getInputProps({ id: name, ...rest })} />
        {children}
      </Form.Item>
    </>
  );

  // return (
  //   <>
  //     <FormControl isInvalid={!!error} isRequired={isRequired}>
  //       <FormLabel htmlFor={name}>{label}</FormLabel>
  //       <Input
  //         {...getInputProps({
  //           id: name,
  //           ...rest,
  //         })}
  //       />
  //       {error && <FormErrorMessage>{error}</FormErrorMessage>}
  //     </FormControl>
  //   </>
  // );
};
