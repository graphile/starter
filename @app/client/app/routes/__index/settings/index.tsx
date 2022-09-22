import { formItemLayout, getCodeFromError, tailFormItemLayout } from "@app/lib";
import type { ActionArgs, LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useActionData, useLoaderData } from "@remix-run/react";
import { redirect } from "@remix-run/server-runtime";
import { withZod } from "@remix-validated-form/with-zod";
import { Alert, Form, PageHeader } from "antd";
import { AuthenticityTokenInput } from "remix-utils";
import { ValidatedForm, validationError } from "remix-validated-form";
import * as z from "zod";

import { FormInput } from "~/components/forms/FormInput";
import { SubmitButton } from "~/components/forms/SubmitButton";
import { validateCsrfToken } from "~/utils/csrf";
import type { GraphqlQueryErrorResult } from "~/utils/errors";
import { requireUser } from "~/utils/users";

export const handle = { title: "Settings: Profile" };

export async function loader({ request, context }: LoaderArgs) {
  await requireUser(request, context);
  const sdk = await context.graphqlSdk;
  const { currentUser } = await sdk.SettingsProfile();
  return json(currentUser);
}

const profileSchema = z.object({
  name: z.string().nonempty("Please enter your name"),
  username: z.string().nonempty("Please choose a username"),
});

const profileFormValidator = withZod(profileSchema);

export async function action({ request, context }: ActionArgs) {
  await validateCsrfToken(request, context);
  const sdk = await context.graphqlSdk;
  const fieldValues = await profileFormValidator.validate(
    await request.formData()
  );
  if (fieldValues.error) {
    return validationError(fieldValues.error);
  }
  const { name, username } = fieldValues.data;
  const { currentUser } = await sdk.SettingsProfile();
  if (currentUser == null) {
    throw redirect(
      `/login?next=${encodeURIComponent(new URL(request.url).pathname)}`
    );
  }
  try {
    await sdk.UpdateUser({
      id: currentUser.id,
      patch: { name, username },
    });
  } catch (e: any) {
    const code = getCodeFromError(e);
    if (code === "NUNIQ") {
      return validationError({
        fieldErrors: {
          username:
            "This username is already in use, please pick a different name",
        },
      });
    }
    return json<GraphqlQueryErrorResult>({
      message: e.message,
      code,
      error: true,
    });
  }
  return { success: true };
}

export default function Profile() {
  const user = useLoaderData<typeof loader>();

  const { message, code, error, success } =
    useActionData<GraphqlQueryErrorResult & { success?: true }>() ?? {};

  return (
    <div>
      <PageHeader title="Edit profile" />

      <ValidatedForm
        validator={profileFormValidator}
        method="post"
        style={{ width: "100%" }}
        defaultValues={{
          name: user?.name ?? undefined,
          username: user?.username ?? undefined,
        }}
      >
        <AuthenticityTokenInput />
        <FormInput
          name="name"
          label="Name"
          required
          type="text"
          autoComplete="name"
          {...formItemLayout}
        />
        <FormInput
          name="username"
          label="Username"
          required
          type="text"
          autoComplete="username"
          {...formItemLayout}
        />
        {error ? (
          <Form.Item>
            <Alert
              type="error"
              message={`Updating username`}
              description={
                <span>
                  {message}
                  {code ? (
                    <span>
                      {" "}
                      (Error code: <code>ERR_{code}</code>)
                    </span>
                  ) : null}
                </span>
              }
            />
          </Form.Item>
        ) : success ? (
          <Form.Item>
            <Alert type="success" message={`Profile updated`} />
          </Form.Item>
        ) : null}
        <Form.Item {...tailFormItemLayout}>
          <SubmitButton htmlType="submit">Update Profile</SubmitButton>
        </Form.Item>
      </ValidatedForm>
    </div>
  );
}
