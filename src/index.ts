import { Hono } from "hono";
import { cors } from "hono/cors";
import { cache } from "hono/cache";
import { prettyJSON } from "hono/pretty-json";
import { secureHeaders } from "hono/secure-headers";
import { StatusCode } from "hono/utils/http-status";
import { getPinnedRepos } from "./lib";

type Bindings = { dev?: boolean };
const app = new Hono<{ Bindings: Bindings }>();

app.use("*", prettyJSON({ space: 4 }));
app.use("*", secureHeaders());
app.use("*", cors({ origin: "*", allowMethods: ["GET"] }));

// Enable 5 minute caching for all routes in production
app.use("*", async (c, next) => {
  if (!c.env.dev) {
    return cache({
      cacheName: "gh-request-cache",
      cacheControl: "max-age=300",
    })(c, next);
  }
  return next();
});

// Redirect root path to GitHub repository
app.get("/", async (c) => {
  return c.redirect(
    "https://github.com/kpriyanshu2003/github-pinned-repos",
    301,
  );
});

// Fetch and parse pinned repositories for a given GitHub username
app.get("/:username", async (c) => {
  const username = c.req.param("username");

  try {
    const pinned_repos = await getPinnedRepos(username);
    return c.json(pinned_repos);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    const statusMap: Record<string, number> = {
      "User not found": 404,
      "Origin rate limit exceeded": 429,
    };

    const status = (statusMap[message] || 500) as StatusCode;
    c.status(status);
    return c.json({ detail: message });
  }
});

export default app;
