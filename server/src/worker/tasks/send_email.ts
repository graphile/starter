import { Task } from "graphile-worker";
import { template as lodashTemplate } from "lodash";
// @ts-ignore
import mjml2html = require("mjml");
import * as html2text from "html-to-text";
import getTransport from "../transport";
import { readFile } from "../../fs";
import { companyName, legalText, fromEmail } from "../../config";

const isDev = process.env.NODE_ENV !== "production";

export interface SendEmailPayload {
  options: {
    from?: string;
    to: string;
    subject: string;
  };
  template: string;
  variables: {
    [varName: string]: any;
  };
}

const task: Task = async inPayload => {
  const payload: SendEmailPayload = inPayload as any;
  const transport = await getTransport();
  const { options: inOptions, template, variables } = payload;
  const options = {
    from: fromEmail,
    ...inOptions,
  };
  if (template) {
    const templateFn = await loadTemplate(template);
    const html = await templateFn(variables);
    const html2textableHtml = html.replace(/(<\/?)div/g, "$1p");
    const text = html2text
      .fromString(html2textableHtml, {
        wordwrap: 120,
      })
      .replace(/\n\s+\n/g, "\n\n");
    Object.assign(options, { html, text });
  }
  await transport.sendMail(options);
};

export default task;

const templatePromises = {};
function loadTemplate(template: string) {
  if (isDev || !templatePromises[template]) {
    templatePromises[template] = (async () => {
      if (!template.match(/^[a-zA-Z0-9_.-]+$/)) {
        throw new Error(`Disallowed template name '${template}'`);
      }
      const templateString = await readFile(
        `${process.cwd()}/../../templates/${template}`,
        "utf8"
      );
      const templateFn = lodashTemplate(templateString, {
        escape: /\[\[([\s\S]+?)\]\]/g,
      });
      return (variables: { [varName: string]: any }) => {
        const mjml = templateFn({
          companyName,
          legalText,
          ...variables,
        });
        const { html, errors } = mjml2html(mjml);
        if (errors && errors.length) {
          console.error(errors);
        }
        return html;
      };
    })();
  }
  return templatePromises[template];
}
