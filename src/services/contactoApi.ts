export interface FormularioContacto {
  nombre: string
  apellido: string
  email: string
  asunto: string
  mensaje: string
}

export async function enviarFormulario(
  data: FormularioContacto
): Promise<{ exito: boolean }> {
  console.log('[Contacto API] Datos listos para enviar:', data)

  const baseUrl = import.meta.env.VITE_API_URL || 'https://backendvelazco-production.up.railway.app/api';
  const res = await fetch(`${baseUrl}/public/contacto`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al enviar')
  return await res.json()
}
