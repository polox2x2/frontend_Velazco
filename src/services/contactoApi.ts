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

  const res = await fetch('http://localhost:8080/api/public/contacto', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Error al enviar')
  return await res.json()
}
