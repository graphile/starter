import { Application, ErrorRequestHandler } from "express";
import * as fs from "fs";
import { template, TemplateExecutor } from "lodash";

const isDev = process.env.NODE_ENV === "development";

interface ParsedError {
  message: String;
  status: number;
}

function parseError(error: Error): ParsedError {
  /*
   * Because an error may contain confidential information or information that
   * might help attackers, by default we don't output the error message at all.
   * You should override this for specific classes of errors below.
   */
  // TODO: process certain errors

  const code = error["statusCode"] || error["status"] || error["code"];
  const codeAsFloat = parseInt(code, 10);
  const httpCode =
    isFinite(codeAsFloat) && codeAsFloat >= 400 && codeAsFloat < 600
      ? codeAsFloat
      : 500;

  return {
    message: "An unknown error occurred",
    status: httpCode,
  };
}

let errorPageTemplate: TemplateExecutor;
function getErrorPage({ message }: ParsedError) {
  if (!errorPageTemplate || isDev) {
    errorPageTemplate = template(
      fs.readFileSync(`${__dirname}/../../../error.html`, "utf8")
    );
  }
  return errorPageTemplate({ message });
}

export default function(app: Application) {
  const errorRequestHandler: ErrorRequestHandler = (error, _req, res, next) => {
    try {
      const parsedError = parseError(error);
      const errorMessageString = `ERROR: ${parsedError.message}`;
      res.status(parsedError.status);
      res.format({
        "text/plain": function() {
          res.send(errorMessageString);
        },

        "text/html": function() {
          res.send(getErrorPage(parsedError));
        },

        "application/json": function() {
          res.send({ errors: [{ message: errorMessageString }] });
        },

        default: function() {
          // log the request and respond with 406
          res.status(406).send("Not Acceptable");
        },
      });
    } catch (e) {
      next(e);
    }
  };
  app.use(errorRequestHandler);
}
