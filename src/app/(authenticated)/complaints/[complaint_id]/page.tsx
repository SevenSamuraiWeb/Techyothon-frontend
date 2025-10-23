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
import Link from "next/link";

enum Status {
    Open = "Open",
    InProgress = "In Progress",
    Resolved = "Resolved",
}

interface Complaint {
    id: number;
    subject: string;
    description: string;
    status: Status;
    image: string | null;
    location: string;
    department: string;
    createdAt: string;
    updatedAt: string;
    reportedBy: {
        name: string;
        email: string;
        phone: string;
    };
    assignedTo?: string;
    priority: "Low" | "Medium" | "High";
    category: string;
}

const complaintData: Complaint = {
    id: 1,
    subject: "Complaint about service",
    description: "I am not satisfied with the service provided. The staff was rude and unhelpful during my visit. I waited for over 30 minutes without any assistance. When I finally got someone's attention, they were dismissive of my concerns and didn't provide any solution to my problem. This is unacceptable and I expect better service quality from your organization.",
    status: Status.InProgress,
    image: "https://images.unsplash.com/photo-1556745753-b2904692b3cd?w=800&h=600&fit=crop",
    location: "New York - Downtown Branch",
    department: "Customer Service",
    createdAt: "2025-10-20 10:30 AM",
    updatedAt: "2025-10-22 02:15 PM",
    reportedBy: {
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "+1 (555) 123-4567"
    },
    assignedTo: "Sarah Johnson",
    priority: "High",
    category: "Service Quality"
}

const getStatusColor = (status: Status) => {
    switch (status) {
        case "Open":
            return "bg-red-100 text-red-700 hover:bg-red-100"
        case "In Progress":
            return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
        case "Resolved":
            return "bg-green-100 text-green-700 hover:bg-green-100"
    }
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "Low":
            return "bg-blue-100 text-blue-700 hover:bg-blue-100"
        case "Medium":
            return "bg-orange-100 text-orange-700 hover:bg-orange-100"
        case "High":
            return "bg-red-100 text-red-700 hover:bg-red-100"
    }
}

export default async function ComplaintDetail({ params }: { params: Promise<{ complaint_id: string }> }) {
    const { complaint_id } = await params;
    console.log("Complaint ID:", complaint_id);
    return (
        <div className="w-full min-h-screen bg-slate-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
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

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-800">Complaint #{complaintData.id}</h1>
                        <p className="text-slate-600 mt-1">{complaintData.subject}</p>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-6">
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

                        {complaintData.image && (
                            <Card className="shadow-md border-0 rounded-xl">
                                <CardHeader className="border-b bg-slate-50">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Image className="w-5 h-5" />
                                        Attached Evidence
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <img
                                        src={complaintData.image}
                                        alt="Complaint evidence"
                                        className="w-full h-auto rounded-lg border border-slate-200"
                                    />
                                </CardContent>
                            </Card>
                        )}

                        <Card className="shadow-md border-0 rounded-xl">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Clock className="w-5 h-5" />
                                    Activity Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                            <div className="w-0.5 h-full bg-slate-200"></div>
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-semibold text-slate-800">Status updated to In Progress</p>
                                            <p className="text-sm text-slate-600">Oct 22, 2025 at 2:15 PM</p>
                                            <p className="text-sm text-slate-500 mt-1">Updated by Sarah Johnson</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                            <div className="w-0.5 h-full bg-slate-200"></div>
                                        </div>
                                        <div className="flex-1 pb-4">
                                            <p className="font-semibold text-slate-800">Complaint assigned to Sarah Johnson</p>
                                            <p className="text-sm text-slate-600">Oct 21, 2025 at 9:00 AM</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 bg-slate-400 rounded-full"></div>
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-800">Complaint submitted</p>
                                            <p className="text-sm text-slate-600">Oct 20, 2025 at 10:30 AM</p>
                                            <p className="text-sm text-slate-500 mt-1">Reported by {complaintData.reportedBy.name}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-6">
                        <Card className="shadow-md border-0 rounded-xl">
                            <CardHeader className="border-b bg-slate-50">
                                <CardTitle className="text-lg">Details</CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6 space-y-4">
                                <div className="flex items-start gap-3">
                                    <Building2 className="w-5 h-5 text-slate-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-600">Department</p>
                                        <p className="font-semibold text-slate-800">{complaintData.department}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-slate-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-600">Location</p>
                                        <p className="font-semibold text-slate-800">{complaintData.location}</p>
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
                                        <p className="font-semibold text-slate-800">{complaintData.createdAt}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Clock className="w-5 h-5 text-slate-600 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-slate-600">Last Updated</p>
                                        <p className="font-semibold text-slate-800">{complaintData.updatedAt}</p>
                                    </div>
                                </div>

                                {complaintData.assignedTo && (
                                    <div className="flex items-start gap-3">
                                        <User className="w-5 h-5 text-slate-600 mt-0.5" />
                                        <div>
                                            <p className="text-sm text-slate-600">Assigned To</p>
                                            <p className="font-semibold text-slate-800">{complaintData.assignedTo}</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

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