import cors from "cors";
import { Express } from "express";

export default (app: Express) => {
  const origin = [];
  if (process.env.ROOT_URL) {
    origin.push(process.env.ROOT_URL);
  }
  if (process.env.CORS_ALLOWED_URLS) {
    origin.push(
      ...(process.env.CORS_ALLOWED_URLS?.replace(/s\s/g, "").split(",") || [])
    );
  }
  const corsOptions = {
    origin,
    credentials: true,
  };
  app.use(cors(corsOptions));
};
