export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '/img/hero-products.png';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // API_URL is something like "http://localhost:8080/api"
  // So the base URL would be API_URL without '/api'
  const apiUrl = import.meta.env.VITE_API_URL || 'https://backendvelazco-production.up.railway.app/api';
  const baseUrl = apiUrl.replace(/\/api\/?$/, '');
    
  if (path.startsWith('/storage/')) {
    const filename = path.substring(9);
    return `${baseUrl}/storage/${encodeURIComponent(filename)}`;
  }
  
  if (path.startsWith('/img/')) {
    return path;
  }
  
  if (path.startsWith('/')) {
    return `${baseUrl}${path}`;
  }
  
  // If it's just a filename, assume it's in /storage/
  return `${baseUrl}/storage/${encodeURIComponent(path)}`;
};
