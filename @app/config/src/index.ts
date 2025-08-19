// @ts-expect-error
import packageJson from "../../../package.json" with { type: "json" };

// TODO: customise this with your own settings!

export const fromEmail =
  '"PostGraphile Starter" <no-reply@examples.graphile.org>';
export const awsRegion = "us-east-1";
export const projectName = packageJson.projectName.replace(/[-_]/g, " ");
export const companyName = projectName; // For copyright ownership
export const emailLegalText =
  // Envvar here so we can override on the demo website
  process.env.LEGAL_TEXT || "<Insert legal email footer text here >";
