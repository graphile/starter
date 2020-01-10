import zxcvbn from "zxcvbn";

export const setPasswordInfo = (props: any, changedValues: any) => {
  const { password } = changedValues;
  console.log(props);

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
