import { useState, useEffect } from 'react';
import { publicApi } from '../services/api';
import { Producto } from '../interfaces/Producto';

export const useProducts = () => {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        setLoading(true);
        const data = await publicApi.getProducts();
        
        // Map backend DTO to frontend Producto interface
        // Base URL logic is now handled globally in getImageUrl

        const mappedProducts: Producto[] = data.map((item: any) => ({
          id: item.id,
          nombre: item.name,
          // Handle backend image storage. Might need full URL depending on how it's served.
          imagen: item.image,
          descripcion: 'Delicioso producto de Panadería Velazco', // Mock description as backend doesn't have it
          precio: item.price,
          categoria: item.category?.name || 'Otros',
          ingredientes: 'Ingredientes secretos de la abuela', // Mock ingredients
        }));

        setProductos(mappedProducts);
      } catch (err: any) {
        console.error('Error fetching products:', err);
        setError(err.message || 'Error al cargar los productos');
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, []);

  return { productos, loading, error };
};
