export interface Testimonio {
  id: number
  nombre: string
  texto: string
  calificacion: number
}

export const testimonios: Testimonio[] = [
  {
    id: 1,
    nombre: 'María Gutiérrez',
    texto: 'Los besitos son los mejores de Ica. Siempre que visito la ciudad paso a comprar. La tradición se siente en cada bocado.',
    calificacion: 5,
  },
  {
    id: 2,
    nombre: 'Carlos Mendoza',
    texto: 'Compramos el pan dulce para las reuniones familiares y todos quedan encantados. La calidad es inigualable.',
    calificacion: 5,
  },
  {
    id: 3,
    nombre: 'Ana Torres',
    texto: 'La paciencia es mi postre favorito desde niña. Que sigan manteniendo las recetas originales es un tesoro.',
    calificacion: 5,
  },
  {
    id: 4,
    nombre: 'Pedro Ramírez',
    texto: 'Excelente atención y productos de primera. El camisón es espectacular, lo recomiendo totalmente.',
    calificacion: 5,
  },
  {
    id: 5,
    nombre: 'Lucía Fernández',
    texto: 'Hago pedidos para eventos y siempre cumplen con la calidad y el tiempo prometido. Más de 80 años de tradición lo dicen todo.',
    calificacion: 5,
  },
  {
    id: 6,
    nombre: 'José Castillo',
    texto: 'Las rosquitas son adictivas. No hay mejor lugar para comprar dulces tradicionales en toda la región.',
    calificacion: 5,
  },
]
