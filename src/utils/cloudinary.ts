export function optimizeCloudinaryUrl(
  url: string | undefined,
  options: { width?: number; quality?: number } = {}
): string {
  if (!url || typeof url !== "string") return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) return url;

  const width = options.width ?? 1200;
  // Use explicit high quality when requested (e.g. hero banners); otherwise q_auto for smaller assets
  const q = options.quality != null ? `q_${options.quality}` : "q_auto";
  const transforms = `f_auto,${q},c_limit,w_${width},dpr_auto`;

  if (url.includes("/upload/f_auto")) return url;
  return url.replace("/upload/", `/upload/${transforms}/`);
}

