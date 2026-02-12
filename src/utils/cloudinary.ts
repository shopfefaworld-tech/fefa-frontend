export function optimizeCloudinaryUrl(
  url: string | undefined,
  options: { width?: number } = {}
): string {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  const width = options.width ?? 1200;
  const transforms = `f_auto,q_auto,c_limit,w_${width},dpr_auto`;

  if (url.includes("/upload/f_auto")) return url;
  return url.replace("/upload/", `/upload/${transforms}/`);
}

