import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Postlin - AI-Powered LinkedIn Content Assistant",
    short_name: "Postlin",
    description:
      "Create, schedule, and publish LinkedIn posts with AI-powered content generation. Automate your LinkedIn presence with Postlin.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFDF5",
    theme_color: "#4B6BFB",
    icons: [
      {
        src: "/logo.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
