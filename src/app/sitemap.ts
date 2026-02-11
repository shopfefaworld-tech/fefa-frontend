import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://shopfefa.world";
  const lastModified = new Date();

  const staticRoutes: string[] = [
    "/",
    "/collections",
    "/cart",
    "/wishlist",
    "/checkout",
    "/account/orders",
    "/account/settings",
    "/gift",
  ];

  return staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
  }));
}

