'use client'

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Cookies from "js-cookie"
import { Mic, MicOff } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import the Map component with no SSR
const MapComponent = dynamic(() => import("@/components/MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 flex items-center justify-center" style={{ height: "350px" }}>
            <p className="text-slate-600">Loading map...</p>
        </div>
    )
})

export default function ReportComplaintPage() {
    const [title, setTitle] = useState("")
    const [details, setDetails] = useState("")
    const [evidence, setEvidence] = useState<File | null>(null)
    const [audio, setAudio] = useState<File | null>(null)
    const [preview, setPreview] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [recording, setRecording] = useState(false)
    const [loading, setLoading] = useState(false)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunks = useRef<Blob[]>([])

    // Detect user location on mount
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => setLocation({ lat: 19.0760, lng: 72.8777 }) // fallback to Mumbai
            )
        } else {
            setLocation({ lat: 19.0760, lng: 72.8777 })
        }
    }, [])

    // Button handler to select current location
    const handleSelectCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                () => alert("Unable to fetch current location.")
            )
        } else {
            alert("Geolocation is not supported by your browser.")
        }
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null
        setEvidence(file)
        if (file) setPreview(URL.createObjectURL(file))
    }

    // 🎤 Handle audio recording
    const handleRecordAudio = async () => {
        if (!recording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
                const mediaRecorder = new MediaRecorder(stream)
                mediaRecorderRef.current = mediaRecorder
                audioChunks.current = []

                mediaRecorder.ondataavailable = (e) => {
                    audioChunks.current.push(e.data)
                }
                mediaRecorder.onstop = () => {
                    const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" })
                    setAudio(new File([audioBlob], "recording.webm", { type: "audio/webm" }))
                }

                mediaRecorder.start()
                setRecording(true)
            } catch (err) {
                alert("Microphone permission denied.")
            }
        } else {
            mediaRecorderRef.current?.stop()
            setRecording(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const token = Cookies.get("token")
        const userid = token ? JSON.parse(token).user?.id : null
        console.log("Submitting complaint for user:", userid)
        if (!title || !details || !location || !evidence) {
            alert("Please fill in all required fields and select a location.")
            return
        }
        setLoading(true)
        const formData = new FormData()
        formData.append("title", title)
        formData.append("description", details)
        formData.append("latitude", location.lat.toString())
        formData.append("longitude", location.lng.toString())
        formData.append("image", evidence)
        if (audio) formData.append("audio", audio)
        if (userid) formData.append("user_id", userid)

        console.log("FormData entries:")
        for (const [key, value] of formData.entries()) {
            console.log(`${key}: ${value}`)
        }
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/complaints/submit`, {
                method: "POST",
                body: formData,
            })
            if (!res.ok) throw new Error("Failed to submit complaint")

            alert("Complaint submitted successfully!")
            setTitle("")
            setDetails("")
            setEvidence(null)
            setAudio(null)
            setPreview(null)
        } catch (err) {
            console.error(err)
            alert("Error submitting complaint.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
            <Card className="w-full max-w-4xl shadow-xl border border-slate-200 rounded-2xl">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Report a Complaint</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Title */}
                        <div>
                            <label className="block mb-2 font-medium">Complaint Title</label>
                            <Input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Broken streetlight near my house"
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block mb-2 font-medium">Complaint Details</label>
                            <Textarea
                                value={details}
                                onChange={(e) => setDetails(e.target.value)}
                                placeholder="Describe your complaint in detail..."
                                required
                                className="resize-none"
                            />
                        </div>

                        {/* Image Evidence */}
                        <div>
                            <label className="block mb-2 font-medium">Upload Image Evidence</label>
                            <Input type="file" accept="image/*" onChange={handleFileChange} required />
                            {preview && (
                                <div className="relative mt-2">
                                    <img
                                        src={preview}
                                        alt="Preview"
                                        className="w-full h-48 object-cover rounded-lg border border-slate-200"
                                    />
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => {
                                            setEvidence(null);
                                            setPreview(null);
                                        }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Audio Evidence */}
                        <div className="space-y-2">
                            <label className="block font-medium">Audio Evidence (Optional)</label>
                            <div className="flex items-center gap-3">
                                <Button
                                    type="button"
                                    onClick={handleRecordAudio}
                                    variant={recording ? "destructive" : "outline"}
                                >
                                    {recording ? (
                                        <>
                                            <MicOff className="mr-2 w-4 h-4" /> Stop Recording
                                        </>
                                    ) : (
                                        <>
                                            <Mic className="mr-2 w-4 h-4" /> Record Audio
                                        </>
                                    )}
                                </Button>
                                <Input
                                    type="file"
                                    accept="audio/*"
                                    onChange={(e) => e.target.files?.[0] && setAudio(e.target.files[0])}
                                />
                            </div>
                            {audio && (
                                <div className="flex items-center gap-2 mt-1">
                                    <p className="text-sm text-slate-600">Attached Audio: {audio.name}</p>
                                    <Button type="button" variant="destructive" size="sm" onClick={() => setAudio(null)}>
                                        Remove
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Map */}
                        <div>
                            <label className="block mb-2 font-medium">Select Location</label>
                            <div className="mb-2">
                                <Button className="hover:bg-slate-200 hover:cursor-pointer" type="button" variant="secondary" onClick={handleSelectCurrentLocation}>
                                    Use My Current Location
                                </Button>
                            </div>
                            <MapComponent location={location} setLocation={setLocation} />
                            {location && (
                                <p className="mt-2 text-sm text-slate-700">
                                    Coordinates: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                                </p>
                            )}
                        </div>

                        {/* Submit */}
                        <div className="flex justify-end">
                            <Button type="submit" disabled={loading}>
                                {loading ? "Submitting..." : "Submit Complaint"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}