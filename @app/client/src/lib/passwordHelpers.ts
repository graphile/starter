import zxcvbn from "zxcvbn";

interface ExpectedProps {
  setPasswordStrength: (score: number) => void;
  setPasswordSuggestions: (message: string[]) => void;
}

interface ChangedValues {
  [key: string]: {
    value: string;
  };
}

export const setPasswordInfo = (
  props: ExpectedProps,
  changedValues: ChangedValues,
  fieldName = "password"
) => {
  const { [fieldName]: field } = changedValues;

  // On field change check to see if password changed
  if (!field) {
    return;
  }

  const { score, feedback } = zxcvbn(field.value);
  props.setPasswordStrength(score);

  const messages = [...feedback.suggestions];
  if (feedback.warning !== "") {
    messages.push(feedback.warning);
  }
  props.setPasswordSuggestions(messages);
};
