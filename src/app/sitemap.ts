import type { MetadataRoute } from "next";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const routes: {
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }[] = [
    { path: "/", changeFrequency: "daily", priority: 1 },
    { path: "/categories", changeFrequency: "weekly", priority: 0.8 },
    { path: "/restaurants", changeFrequency: "daily", priority: 0.9 },
    { path: "/orders", changeFrequency: "weekly", priority: 0.6 },
    { path: "/favorites", changeFrequency: "weekly", priority: 0.5 },
    { path: "/profile", changeFrequency: "monthly", priority: 0.4 },
    { path: "/notifications", changeFrequency: "weekly", priority: 0.4 },
    { path: "/help", changeFrequency: "monthly", priority: 0.3 },
  ];

  return routes.map(({ path, changeFrequency, priority }) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency,
    priority,
  }));
}
