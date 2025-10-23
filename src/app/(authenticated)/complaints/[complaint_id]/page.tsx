'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    ArrowLeft,
    MapPin,
    Building2,
    Calendar,
    User,
    Mail,
    Phone,
    Clock,
    FileText,
    Image,
    CheckCircle2,
    AlertCircle
} from "lucide-react"
import Link from "next/link"

enum Status {
    Open = "Open",
    InProgress = "InProgress",
    Resolved = "Resolved",
}

interface Complaint {
    _id: string
    title: string
    description: string
    category: string
    priority: string
    status: string
    location: {
        type: string
        coordinates: number[]
    }
    address: string
    image_url: string
    audio_url: string
    user_id: string
    assigned_department: string
    status_history: {
        status: string
        timestamp: string
        updated_by: string
        comment: string
    }[]
    verified_by_citizen: boolean
    related_complaints: string[]
    is_duplicate: boolean
    created_at: string
    updated_at: string
    resolved_at: string | null
    reportedBy?: {
        name: string
        email: string
        phone: string
    }
    assignedTo?: string
    department?: string
}

const getStatusColor = (status?: string) => {
    switch (status) {
        case "Open":
            return "bg-red-100 text-red-700 hover:bg-red-100"
        case "InProgress":
            return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
        case "Resolved":
            return "bg-green-100 text-green-700 hover:bg-green-100"
        default:
            return "bg-slate-100 text-slate-700"
    }
}

const getPriorityColor = (priority?: string) => {
    switch (priority) {
        case "Low":
            return "bg-blue-100 text-blue-700 hover:bg-blue-100"
        case "Medium":
            return "bg-orange-100 text-orange-700 hover:bg-orange-100"
        case "High":
            return "bg-red-100 text-red-700 hover:bg-red-100"
        default:
            return "bg-slate-100 text-slate-700"
    }
}

export default function ComplaintDetail({ params }: { params: Promise<any> }) {
    const [complaintData, setComplaintData] = useState<Complaint | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchComplaintData = async () => {
            try {
                // ✅ Extract complaint_id directly (no await)
                const { complaint_id } = await params;
                console.log("Fetching complaint:", complaint_id);

                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/complaints/${complaint_id}`);

                if (!response.ok) {
                    console.error("Failed to fetch data");
                    return;
                }

                // ✅ Call .json() only once
                const data: Complaint = await response.json();
                console.log("Complaint data:", data);

                setComplaintData(data);
            } catch (error) {
                console.error("Error fetching complaint data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchComplaintData();
    }, []);


    if (loading) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center text-slate-600">
                Loading complaint details...
            </div>
        )
    }

    if (!complaintData) {
        return (
            <div className="w-full min-h-screen flex justify-center items-center text-slate-600">
                Complaint not found.
            </div>
        )
    }

    return (
        <div className="w-full min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Back & Action Buttons */}
                <div className="flex items-center justify-between">
                    <Link href="/complaints" className="gap-2 flex flex-row items-center text-slate-600 hover:text-slate-800">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Complaints
                    </Link>
                    <div className="flex gap-2">
                        <Button variant="outline">Edit</Button>
                        <Button className="bg-slate-800 hover:bg-slate-700">Update Status</Button>
                    </div>
                </div>

                {/* Title & Status */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">
                            Complaint #{complaintData._id.slice(-6)}
                        </h1>
                        <p className="text-slate-600 mt-1">{complaintData.title}</p>
                    </div>
                    <div className="flex gap-2">
                        <Badge className={getStatusColor(complaintData.status)} variant="secondary">
                            {complaintData.status}
                        </Badge>
                        <Badge className={getPriorityColor(complaintData.priority)} variant="secondary">
                            {complaintData.priority} Priority
                        </Badge>
                    </div>
                </div>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left: Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Description */}
                        <Card className="shadow-md border-0 rounded-xl">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Description
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <p className="text-slate-700 leading-relaxed whitespace-pre-line">
                                    {complaintData.description}
                                </p>
                            </CardContent>
                        </Card>

                        {/* Evidence */}
                        {complaintData.image_url && (
                            <Card className="shadow-md border-0 rounded-xl">
                                <CardHeader className="border-b bg-slate-50">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Image className="w-5 h-5" />
                                        Attached Evidence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <img
                                        src={complaintData.image_url}
                                        alt="Complaint evidence"
                                        className="w-full h-auto rounded-lg border border-slate-200"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        {/* Timeline */}
                        <Card className="shadow-md border-0 rounded-xl">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Activity Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    {complaintData.status_history.map((event, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <div className="flex flex-col items-center">
                                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                                {idx < complaintData.status_history.length - 1 && (
                                                    <div className="w-0.5 h-full bg-slate-200"></div>
                                                )}
                                            </div>
                                            <div className="flex-1 pb-4">
                                                <p className="font-semibold text-slate-800">
                                                    {event.comment}
                                                </p>
                                                <p className="text-sm text-slate-600">
                                                    {new Date(event.timestamp).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right: Metadata */}
                    <div className="space-y-6">
                        {/* Complaint Info */}
                        <Card className="shadow-md border-0 rounded-xl">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-lg">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Building2 className="w-5 h-5 text-slate-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-600">Department</p>
                                        <p className="font-semibold text-slate-800">{complaintData.assigned_department}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-slate-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-600">Address</p>
                                        <p className="font-semibold text-slate-800">{complaintData.address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-slate-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-600">Category</p>
                                        <p className="font-semibold text-slate-800">{complaintData.category}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-slate-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-600">Created</p>
                                        <p className="font-semibold text-slate-800">
                                            {new Date(complaintData.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-600">Last Updated</p>
                                        <p className="font-semibold text-slate-800">
                                            {new Date(complaintData.updated_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Reporter Info */}
                        {complaintData.reportedBy && (
                            <Card className="shadow-md border-0 rounded-xl">
                                <CardHeader className="border-b bg-slate-50">
                                    <CardTitle className="text-lg">Reporter Information</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6 space-y-4">
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-slate-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-slate-600">Name</p>
                                            <p className="font-semibold text-slate-800">{complaintData.reportedBy.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Mail className="w-5 h-5 text-slate-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-slate-600">Email</p>
                                            <p className="font-semibold text-slate-800 break-all">{complaintData.reportedBy.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-3">
                                        <Phone className="w-5 h-5 text-slate-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-slate-600">Phone</p>
                                            <p className="font-semibold text-slate-800">{complaintData.reportedBy.phone}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Quick Actions */}
                        <Card className="shadow-md border-0 rounded-xl">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-lg">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-2">
                                <Button className="w-full justify-start gap-2 bg-green-600 hover:bg-green-700">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Mark as Resolved
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <AlertCircle className="w-4 h-4" />
                                    Request More Info
                                </Button>
                                <Button variant="outline" className="w-full justify-start gap-2">
                                    <User className="w-4 h-4" />
                                    Reassign
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    )
}
