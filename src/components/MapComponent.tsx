'use client'

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

interface MapComponentProps {
    location: { lat: number; lng: number } | null
    setLocation: (location: { lat: number; lng: number }) => void
}

function LocationMarker({ location, setLocation }: MapComponentProps) {
    useMapEvents({
        click(e) {
            setLocation({ lat: e.latlng.lat, lng: e.latlng.lng })
        },
    })
    return location ? <Marker position={location} /> : null
}

export default function MapComponent({ location, setLocation }: MapComponentProps) {
    if (!location) return null

    return (
        <div className="rounded-lg overflow-hidden border border-slate-200">
            <MapContainer
                center={location}
                zoom={15}
                style={{ height: "350px", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker location={location} setLocation={setLocation} />
            </MapContainer>
        </div>
    )
}