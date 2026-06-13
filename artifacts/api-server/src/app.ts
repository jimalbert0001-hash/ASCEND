import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";
import { setupAuth } from "./lib/supabaseAuth.js";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

await setupAuth(app);

app.use("/api", router);

// Serve static files from frontend build in production
if (process.env.NODE_ENV === "production") {
  const publicPath = path.resolve(
    import.meta.dirname,
    "..",
    "..",
    "dist"
  );
  app.use(express.static(publicPath));
  app.get("*", (req, res) => {
    if (req.path.startsWith("/api")) return;
    res.sendFile(path.join(publicPath, "index.html"));
  });
}

export default app;
