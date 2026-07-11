import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import styles from './DeliveryMap.module.css'

const markerIcon = L.icon({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

const ICA_POS: [number, number] = [-14.065, -75.731]

interface DeliveryMapProps {
  onAddressChange: (address: string) => void
}

function ClickHandler({
  onPin,
}: {
  onPin: (latlng: [number, number]) => void
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onPin([+lat.toFixed(6), +lng.toFixed(6)])
    },
  })
  return null
}

function DeliveryMap({ onAddressChange }: DeliveryMapProps) {
  const [posicion, setPosicion] = useState<[number, number] | null>(null)
  const [cargandoDir, setCargandoDir] = useState(false)

  const manejarPin = async (latlng: [number, number]) => {
    setPosicion(latlng)
    await reverseGeocode(latlng)
  }

  const reverseGeocode = async (latlng: [number, number]) => {
    setCargandoDir(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${latlng[0]}&lon=${latlng[1]}&format=json&accept-language=es`,
        { headers: { 'User-Agent': 'VelazcoApp/1.0' } },
      )
      const data = await res.json()
      if (data.display_name) {
        onAddressChange(data.display_name)
      }
    } catch {
      onAddressChange(`${latlng[0]}, ${latlng[1]}`)
    } finally {
      setCargandoDir(false)
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.mapContainer}>
        <MapContainer
          center={ICA_POS}
          zoom={14}
          className={styles.map}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPin={manejarPin} />
          {posicion && <Marker position={posicion} icon={markerIcon} />}
        </MapContainer>
      </div>
      {cargandoDir && <p className={styles.loading}>Obteniendo dirección…</p>}
    </div>
  )
}

export default DeliveryMap
