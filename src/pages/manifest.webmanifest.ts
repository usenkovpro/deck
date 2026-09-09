/**
 * The web app manifest — what makes Deck installable.
 *
 * Generated rather than kept as a static file so every path runs through BASE_URL,
 * which is what lets the app work when it is served from a subfolder on GitHub Pages
 * instead of the root of a domain.
 */

const base = import.meta.env.BASE_URL;

export function GET() {
  const manifest = {
    name: "Deck — school timetable",
    short_name: "Deck",
    description: "Your school timetable, on your phone, offline.",
    start_url: base,
    scope: base,
    display: "standalone",
    orientation: "portrait",
    // Matches the light theme, which is the default. The dark equivalent is set
    // with a media-query theme-color meta tag; a manifest only gets one.
    background_color: "#f4f6f8",
    theme_color: "#f4f6f8",
    icons: [
      { src: `${base}icon-192.png`, sizes: "192x192", type: "image/png", purpose: "any" },
      { src: `${base}icon-512.png`, sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: `${base}icon-maskable-512.png`,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };

  return new Response(JSON.stringify(manifest, null, 2), {
    headers: { "Content-Type": "application/manifest+json; charset=utf-8" },
  });
}
