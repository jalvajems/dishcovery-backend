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
    const isProduction = process.env.NODE_ENV === "production";
    
    // Prioritize BASE_URL from environment if available
    const apiHost = process.env.BASE_URL || (isProduction 
      ? "https://api.dishcovery.jalva.online" 
      : "http://localhost");
      
    const port = process.env.PORT || 4000;
    const baseUrl = (process.env.BASE_URL || isProduction) ? apiHost : `${apiHost}:${port}`;
      
    // Ensure path doesn't have duplicate slashes
    const cleanPath = path.replace(/^\/+/, '');
    return `${baseUrl}/api/file/image/${cleanPath}`;
  } catch (error) {
    console.error("Error expanding image URL for path:", path, error);
    return path; // Fallback to original path
  }
};
