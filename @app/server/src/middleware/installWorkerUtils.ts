import { Express } from "express";
import { makeWorkerUtils, WorkerUtils } from "graphile-worker";

import { getRootPgPool } from "./installDatabasePools";

export function getWorkerUtils(app: Express): WorkerUtils {
  return app.get("workerUtils");
}

export default async (app: Express) => {
  const workerUtils = await makeWorkerUtils({
    pgPool: getRootPgPool(app),
  });

  app.set("workerUtils", workerUtils);
};
