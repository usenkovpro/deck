// @ts-check
import { createHash } from "node:crypto";
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "astro/config";

/**
 * Lists the built JavaScript and CSS in the service worker's precache.
 *
 * Those files have hashed names that only exist after a build, so they cannot be
 * written into sw.js by hand. Without this, a fresh install that lost signal before
 * its second visit would open to HTML with no styles and no behaviour — the app
 * would look broken at exactly the moment offline support is supposed to save it.
 */
function precacheBuiltAssets() {
  return {
    name: "deck-precache",
    hooks: {
      "astro:build:done": ({ dir, logger }) => {
        const out = fileURLToPath(dir);
        const swPath = join(out, "sw.js");

        let assets = [];
        try {
          assets = readdirSync(join(out, "_astro"))
            .filter((name) => name.endsWith(".js") || name.endsWith(".css"))
            .map((name) => `_astro/${name}`)
            .sort();
        } catch {
          logger.warn("no _astro directory — nothing to precache");
        }

        // Hashed filenames already change whenever their contents do, so hashing the
        // list is enough to give every distinct build its own cache name.
        const build = createHash("sha1")
          .update(assets.join(","))
          .digest("hex")
          .slice(0, 8);

        const source = readFileSync(swPath, "utf8")
          .replace('["__PRECACHE__"]', JSON.stringify(assets))
          .replace('"__BUILD__"', JSON.stringify(build));

        writeFileSync(swPath, source);
        logger.info(`precached ${assets.length} built assets (build ${build})`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  // GitHub Pages serves this from a subfolder, not the root of a domain. Every
  // internal link, the manifest and the service worker scope all go through
  // import.meta.env.BASE_URL so that this is the only place the path is written.
  site: "https://usenkovpro.github.io",
  base: "/deck/",
  integrations: [precacheBuiltAssets()],
});
