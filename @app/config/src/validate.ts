/**
 * Validation functions for environment variables.
 *
 * `name` is passed with `value` so that bundlers that replace
 * process.env.MY_VAR with the value will still provide useful error messages.
 */

export const required = (v: {
  value?: string;
  name: string;
}): { value: string; name: string } => {
  const { value, name } = v;
  if (!value || value === "") {
    throw new Error(
      `process.env.${name} is required but not defined - did you remember to run the setup script? Have you sourced the environmental variables file '.env'?`
    );
  }
  return v as any;
};

export const minLength = (
  v: { value: string; name: string },
  minLength: number
): { value: string; name: string } => {
  const { value, name } = v;
  if (value.length < minLength) {
    throw new Error(
      `process.env.${name} should have minimum length ${minLength}.`
    );
  }
  return v;
};

export const parseInteger = (v: {
  value?: string;
  name: string;
}): { value: number; name: string } => ({
  value: parseInt(v.value || "", 10),
  name: v.name,
});

export const defaultNumber = (
  v: { value?: number; name: string },
  defaultValue: number
): { value: number; name: string } => {
  const { value, name } = v;
  return {
    value: value === undefined || isNaN(value) ? defaultValue : value,
    name,
  };
};
