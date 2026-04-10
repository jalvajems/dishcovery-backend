import { env } from "../config/env.config";

/**
 * Expands a stored image path into a full URL if it's not already one.
 * Supports both legacy full URLs and new S3 keys.
 * 
 * @param path The image path or full URL stored in the database
 * @returns The full URL to the image
 */
export const expandImageUrl = (path: string | string[] | undefined | null): any => {
  if (!path) return path;

  if (Array.isArray(path)) {
    return path.map(p => expandImageUrl(p));
  }
  
  // If it's already a full URL, return it as is
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  
  // Otherwise, treat it as an S3 key and expand it to our local secure proxy
  try {
    // For local development, use localhost. For production, ideally use an env variable.
    // NOTE: This can be moved to env.config.ts later for better centralization.
    const apiHost = env.NODE_ENV === "production" 
      ? "https://api.dishcovery.jalva.online" 
      : "http://localhost";
      
    const port = env.PORT || 4000;
    const baseUrl = env.NODE_ENV === "production" ? apiHost : `${apiHost}:${port}`;
      
    // Ensure path doesn't have duplicate slashes
    const cleanPath = path.replace(/^\/+/, '');
    return `${baseUrl}/api/file/image/${cleanPath}`;
  } catch (error) {
    console.error("Error expanding image URL for path:", path, error);
    return path; // Fallback to original path
  }
};
