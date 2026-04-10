import { getFileUrl } from "../config/s3aws.config";

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
  
  // Otherwise, treat it as an S3 key and expand it
  try {
    return getFileUrl(path);
  } catch (error) {
    console.error("Error expanding image URL for path:", path, error);
    return path; // Fallback to original path
  }
};
