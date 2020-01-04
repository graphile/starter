const fetch = require("node-fetch");
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function main() {
  let attempts = 0;
  let response;
  while (true) {
    try {
      response = await fetch("http://localhost:5678");
      if (!response.ok) {
        throw new Error("Try again");
      }
      break;
    } catch (e) {
      attempts++;
      if (attempts <= 15) {
        console.log(`Server is not ready yet: ${e.message}`);
      } else {
        console.log(`Server never came up, aborting :(`);
        process.exit(1);
      }
      await sleep(1000);
    }
  }
  const text = await response.text();

  // Check for known text on homepage
  if (!text.includes("https://graphile.org/postgraphile")) {
    throw new Error("Failed to confirm server works.");
  }

  // TODO: make this test depend on the worker running

  console.log("Docker tests passed.");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
