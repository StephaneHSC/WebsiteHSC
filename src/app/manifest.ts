import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Heli Skycargo",
    short_name: "Heli Skycargo",
    description:
      "Full-service air and ocean freight forwarder. End-to-end visibility and control over your helicopter shipments through bespoke logistics.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#E40C28",
    icons: [
      { src: "/icon.png", sizes: "192x192", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
