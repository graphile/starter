// PostGraphile core and related modules
import { postgraphile } from "postgraphile";
import { grafserv } from "postgraphile/grafserv/node";
import { PostGraphileAmberPreset } from "postgraphile/presets/amber";
import { makePgService } from "postgraphile/adaptors/pg";
import {
  convertHandlerResultToResult,
  HandlerResult,
} from "postgraphile/grafserv";

// PostGraphile plugins
// import { PgPostgisWktPlugin } from "postgraphile-postgis-wkt";

// Next.js modules for requests and responses
import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getNormalizedDigest } from "./digest_helper";

const connectionString = process.env.ROOT_DATABASE_URL;
if (!connectionString) {
  throw new Error("ROOT_DATABASE_URL not set!");
}

// PostGraphile configuration
const preset = {
  extends: [PostGraphileAmberPreset],
  // plugins: [PgPostgisWktPlugin],
  pgServices: [
    makePgService({
      connectionString,
      schemas: ["public"],
    }),
  ],
  grafserv: {
    graphqlPath: "/api/graphql",
  },
  grafast: {
    explain: false, //process.env.NODE_ENV === 'development',
  },
};

// Create PostGraphile instance
const pgl = postgraphile(preset);

// Create the grafserv instance
const serv = pgl.createServ(grafserv);

/**
 * Handle POST requests (GraphQL queries/mutations).
 */
export async function POST(req: NextRequest) {
  try {
    const normalizedDigest = getNormalizedDigest(req);
    // console.log("normalizedDigest", normalizedDigest);
    const handlerResult = await serv.graphqlHandler(normalizedDigest);
    // console.log("handlerResult", handlerResult);
    const result = await convertHandlerResultToResult(handlerResult);
    // console.log("result", result);

    if (result?.type === "buffer") {
      const { buffer, headers, statusCode } = result;
      return new NextResponse(buffer, {
        status: statusCode,
        headers,
      });
    }
    console.error("Response may be null or empty");
    return new NextResponse("Response may be null or empty:", { status: 500 });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

/**
 * Handle GET requests (GraphiQL interface).
 */
export async function GET(req: NextRequest) {
  try {
    const normalizedDigest = getNormalizedDigest(req);
    const handlerResult = await serv.graphiqlHandler(normalizedDigest);
    const result = await convertHandlerResultToResult(handlerResult);
    if (result?.type === "buffer") {
      const { buffer, headers, statusCode } = result;
      return new NextResponse(buffer, {
        status: statusCode,
        headers,
      });
    }
  } catch (error) {
    console.error("Error in GET handler:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
