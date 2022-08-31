import classNames from "classnames";
import { HiOutlineInformationCircle } from "react-icons/hi";

export interface PasswordStrengthProps {
  passwordStrength: number; // 0-4
  suggestions: string[];
  isDirty: boolean;
}

export function PasswordStrength({
  passwordStrength,
  suggestions = [
    "Use a few words, avoid common phrases",
    "No need for symbols, digits, or uppercase letters",
  ],
  isDirty = false,
}: PasswordStrengthProps) {
  if (!isDirty) return null;

  return (
    <div className="flex flex-row justify-between">
      <div className="basis-3/4">
        <progress
          className={classNames(
            ["progress progress-primary w-full my-2"],
            passwordStrength < 2 ? "progress-error" : "progress-success"
          )}
          value={passwordStrength + 1}
          max="5"
        ></progress>
      </div>
      {suggestions.length > 0 && (
        <div className="dropdown dropdown-end dropdown-hover">
          <label
            tabIndex={0}
            className="btn btn-circle btn-ghost btn-xs text-info text-lg"
          >
            <HiOutlineInformationCircle />
          </label>
          <div
            tabIndex={0}
            className="card compact dropdown-content shadow bg-base-100 rounded-box w-80"
          >
            <div className="card-body">
              <h2 className="card-title">Password Suggestions</h2>
              <ul className="list-disc list-inside">
                {suggestions.map((suggestion, key) => {
                  return <li key={key}>{suggestion}</li>;
                })}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
