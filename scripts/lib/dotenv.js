const fsp = require("fs").promises;
const dotenv = require("dotenv");

const DOTENV_PATH = `${__dirname}/../../.env`;

async function readDotenv() {
  let buffer = null;
  try {
    buffer = await fsp.readFile(DOTENV_PATH);
  } catch (e) {
    /* noop */
  }
  const config = buffer ? dotenv.parse(buffer) : null;
  // also read from current env, because docker-compose already needs to know some of it
  // eg. $PG_DUMP, $CONFIRM
  return { ...config, ...process.env };
}

function encodeDotenvValue(str) {
  if (typeof str !== "string") {
    throw new Error(`'${str}' is not a string`);
  }
  if (str.trim() !== str) {
    // `dotenv` would escape this with single/double quotes but that won't work in docker-compose
    throw new Error(
      "We don't support leading/trailing whitespace in config variables"
    );
  }
  if (str.indexOf("\n") >= 0) {
    // `dotenv` would escape this with single/double quotes and `\n` but that won't work in docker-compose
    throw new Error("We don't support newlines in config variables");
  }
  return str;
}

async function withDotenvUpdater(overrides, callback) {
  let data;
  try {
    data = await fsp.readFile(DOTENV_PATH, "utf8");
    // Trim whitespace, and prefix with newline so we can do easier checking later
    data = "\n" + data.trim();
  } catch (e) {
    data = "";
  }

  const config = data ? dotenv.parse(data) : null;
  const answers = {
    ...config,
    ...process.env,
    ...overrides,
  };

  function add(varName, defaultValue, comment) {
    const SET = `\n${varName}=`;
    const encodedValue = encodeDotenvValue(
      varName in answers ? answers[varName] : defaultValue || ""
    );
    const pos = data.indexOf(SET);
    if (pos >= 0) {
      /* Replace this value with the new value */

      // Where's the next newline (or the end of the file if there is none)
      let nlpos = data.indexOf("\n", pos + 1);
      if (nlpos < 0) {
        nlpos = data.length;
      }

      // Surgical editing
      data =
        data.substr(0, pos + SET.length) + encodedValue + data.substr(nlpos);
    } else {
      /* This value didn't already exist; add it to the end */

      if (comment) {
        data += `\n\n${comment}`;
      }

      data += `${SET}${encodedValue}`;
    }
  }

  await callback(add);

  data = data.trim() + "\n";

  await fsp.writeFile(DOTENV_PATH, data);
}

exports.readDotenv = readDotenv;
exports.withDotenvUpdater = withDotenvUpdater;
