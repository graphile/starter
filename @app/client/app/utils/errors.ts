import type { SerializeFrom } from "@remix-run/server-runtime";
import type { ValidationErrorResponseData } from "remix-validated-form";

export interface GraphqlQueryErrorResult {
  message?: string | null;
  code?: string | null;
  error: true;
}

export type OnlyUndefined<T> = {
  [key in keyof T]: undefined;
};

function isValidationErrorResponseData(
  actionData:
    | SerializeFrom<GraphqlQueryErrorResult | ValidationErrorResponseData>
    | undefined
): actionData is SerializeFrom<ValidationErrorResponseData> | undefined {
  return actionData == null || (actionData as any).formError != null;
}

export function extractGraphqlErrorFromFormAction(
  actionData:
    | SerializeFrom<
        | GraphqlQueryErrorResult
        | ValidationErrorResponseData
        | { success: boolean }
      >
    | undefined
): GraphqlQueryErrorResult | OnlyUndefined<GraphqlQueryErrorResult> {
  if (actionData != null && "success" in actionData) {
    return { message: undefined, code: undefined, error: undefined };
  }
  return isValidationErrorResponseData(actionData)
    ? { message: undefined, code: undefined, error: undefined }
    : actionData;
}
