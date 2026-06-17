import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Food App",
    short_name: "Food",
    description: "Mazali taomlarni tez va qulay buyurtma qiling.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#EF4444",
    lang: "uz",
    icons: [
      {
        src: "/logo.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
    ],
  };
}
