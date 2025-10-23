'use client'

import { useState, useEffect } from "react"
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
import { GoogleMap, useLoadScript, Marker } from "@react-google-maps/api"

const containerStyle = { width: '100%', height: '300px' }

export default function ReportComplaintForm() {
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState("")
    const [details, setDetails] = useState("")
    const [evidence, setEvidence] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [mapOpen, setMapOpen] = useState(false)
    const [loadingLocation, setLoadingLocation] = useState(false)

    const { isLoaded } = useLoadScript({
        googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setEvidence(file)
        if (file) setPreview(URL.createObjectURL(file))
    }

    // Open map and get current location
    const handleSelectLocation = () => {
        setLoadingLocation(true)
        setMapOpen(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                    setLoadingLocation(false)
                },
                () => {
                    // fallback location
                    setLocation({ lat: 19.0760, lng: 72.8777 })
                    setLoadingLocation(false)
                }
            )
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!title || !details || !evidence || !location) {
            alert("Please fill all fields and select a location.")
            return
        }

        console.log({ title, details, evidence, location })
        alert("Complaint submitted successfully!")

        // Reset
        setTitle("")
        setDetails("")
        setEvidence(null)
        setPreview(null)
        setLocation(null)
        setOpen(false)
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-slate-600 text-white hover:bg-slate-700">
                    Report Complaint
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
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
                        <Button type="button" onClick={handleSelectLocation}>
                            Select Location
                        </Button>
                        {location && (
                            <p className="mt-2 text-sm text-slate-700">
                                Selected Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                            </p>
                        )}
                    </div>

                    {/* Map Dialog */}
                    {mapOpen && isLoaded && location && (
                        <div className="mt-2">
                            <GoogleMap
                                mapContainerStyle={containerStyle}
                                center={location}
                                zoom={15}
                                onClick={(e) =>
                                    setLocation({
                                        lat: e.latLng?.lat() || 0,
                                        lng: e.latLng?.lng() || 0,
                                    })
                                }
                            >
                                <Marker position={location} />
                            </GoogleMap>
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
                        <Button type="submit">Submit Complaint</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
