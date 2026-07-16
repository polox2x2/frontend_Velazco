export const getImageUrl = (path: string | undefined | null) => {
  if (!path) return '/img/hero-products.png';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  
  // Obtener URL base sin /api
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
  
  // Asumir que es un archivo en /storage/
  return `${baseUrl}/storage/${encodeURIComponent(path)}`;
};
