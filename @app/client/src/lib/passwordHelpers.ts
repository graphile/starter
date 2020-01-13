import zxcvbn from "zxcvbn";

interface ExpectedProps {
  setPasswordStrength: (score: number) => void;
  setPasswordSuggestions: (message: string[]) => void;
}

interface ChangedValues {
  password: {
    value: string;
  };
}

export const setPasswordInfo = (
  props: ExpectedProps,
  changedValues: ChangedValues
) => {
  const { password } = changedValues;

  // On field change check to see if password changed
  if (!password) {
    return;
  }

  const { score, feedback } = zxcvbn(password.value);
  props.setPasswordStrength(score);

  const messages = [...feedback.suggestions];
  if (feedback.warning !== "") {
    messages.push(feedback.warning);
  }
  props.setPasswordSuggestions(messages);
};
