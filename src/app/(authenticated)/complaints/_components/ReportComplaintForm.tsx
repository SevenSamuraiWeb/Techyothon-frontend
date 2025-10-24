'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"
import Cookies from "js-cookie"

// Fix for Leaflet's default marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
})

const containerStyle = { width: '100%', height: '300px' }

interface ComplaintForm {
    title: string
    description: string
    latitude: number
    longitude: number
    address?: string
    user_id?: string
    image: File | null
    audio?: File | null
}

export default function ReportComplaintForm() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [details, setDetails] = useState("")
    const [evidence, setEvidence] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [mapOpen, setMapOpen] = useState(false)
    const [loadingLocation, setLoadingLocation] = useState(false)
    const [loading, setLoading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setEvidence(file)
        if (file) setPreview(URL.createObjectURL(file))
    }

    // Step 1: Ask for user's current location
    const handleSelectLocation = () => {
        setLoadingLocation(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                    setLoadingLocation(false)
                    setMapOpen(true)
                },
                () => {
                    // fallback to Mumbai
                    setLocation({ lat: 19.0760, lng: 72.8777 })
                    setLoadingLocation(false)
                    setMapOpen(true)
                }
            )
        } else {
            alert("Geolocation is not supported by your browser.")
            setLoadingLocation(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!title || !details || !location || !evidence) {
            alert("Please fill in all fields and select a location.")
            return
        }

        const formData = new FormData()
        formData.append("title", title)
        formData.append("description", details)
        formData.append("latitude", location.lat.toString())
        formData.append("longitude", location.lng.toString())
        formData.append("image", evidence)
        const userid = Cookies.get("token") ? JSON.parse(Cookies.get("token") || "").user.userid : null
        console.log("User ID:", userid)
        if (userid) {
            formData.append("user_id", userid)
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/complaints/submit`, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("Failed to submit complaint")

            alert("Complaint submitted successfully!")
            setOpen(false)
            setPreview(null)
            setTitle("")
            setDetails("")
            setEvidence(null)
            setLocation(null)
        } catch (error) {
            console.error("Error while uploading:", error)
            alert("Failed to submit complaint.")
        } finally {
            setLoading(false)
        }
    }

    // Custom component to handle map clicks
    const LocationMarker = () => {
        useMapEvents({
            click(e) {
                setLocation({ lat: e.latlng.lat, lng: e.latlng.lng })
            },
        })

        return location ? <Marker position={location} /> : null
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-600 text-white hover:bg-slate-700">
                    + Report Complaint
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md max-h-[80%] overflow-y-scroll">
                <DialogHeader>
                    <DialogTitle>Report a New Complaint</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Title */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Complaint Title</label>
                        <Input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Large pothole on Main St."
                        />
                    </div>

                    {/* Details */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Complaint Detail</label>
                        <Textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Please provide a detailed description of the issue..."
                            className="resize-none"
                        />
                    </div>

                    {/* Evidence */}
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium">Evidence</label>
                        <Input type="file" accept=".jpg,.jpeg,.png,.webp" onChange={handleFileChange} />
                    </div>

                    {/* Preview */}
                    {preview && (
                        <div>
                            <p className="text-sm text-slate-600 mt-1">Preview:</p>
                            <img
                                src={preview}
                                alt="Preview"
                                className="w-full h-48 object-cover rounded-md mt-1 border border-slate-200"
                            />
                        </div>
                    )}

                    {/* Select Location */}
                    <div className="flex flex-col">
                        <Button
                            type="button"
                            onClick={handleSelectLocation}
                            disabled={loadingLocation}
                        >
                            {loadingLocation ? "Fetching Location..." : "Select Location"}
                        </Button>
                        {location && (
                            <p className="mt-2 text-sm text-slate-700">
                                Selected Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </p>
                        )}
                    </div>

                    {/* Map Selection */}
                    {mapOpen && location && (
                        <div className="mt-2">
                            <MapContainer
                                center={location}
                                zoom={15}
                                style={containerStyle}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <LocationMarker />
                            </MapContainer>
                            <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() => setMapOpen(false)}
                            >
                                Confirm Location
                            </Button>
                        </div>
                    )}

                    <DialogFooter className="flex justify-between">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>{loading ? "Submitting..." : "Submit Complaint"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}