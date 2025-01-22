/*******************************************************************************
 * All general routes are handled in this file - all routes agnostic of the API
 * itself. This includes global middleware, general handlers (like 404 and error
 * handling) as well as static asset hosting.
 *
 * For api routes, see api.ts.
 ******************************************************************************/
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { api } from "./api/api.js";

export const app = new Hono();

app.route("/api/v1", api);

app.use(
  serveStatic({
    root: "public",
    index: "index.html",
    precompressed: true,
    onFound: async (path, c) => {
      if (path.match(/\.obj(\.br|\.gz)?$/)) {
        c.header("Content-Type", "text/plain");
      }
      if (!path.match(/index\.html$/)) {
        c.header("Cache-Control", "public, max-age=14400");
      }
    },
  }),
);
