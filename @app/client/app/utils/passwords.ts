import zxcvbn from "zxcvbn";

export const setPasswordStrengthInfo = (
  password: string,
  setPasswordStrength: (score: number) => void,
  setPasswordSuggestions: (message: string[]) => void
): void => {
  const { score, feedback } = zxcvbn(password || "");
  setPasswordStrength(score);

  const messages = [...feedback.suggestions];
  if (feedback.warning !== "") {
    messages.push(feedback.warning);
  }
  setPasswordSuggestions(messages);
};
