import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "HOMEY",
    short_name: "HOMEY",
    description: "Minimalist app for couples",
    start_url: "/",
    display: "standalone",
    background_color: "#080e1e",
    theme_color: "#080e1e",
    icons: [
      {
        src: "/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
