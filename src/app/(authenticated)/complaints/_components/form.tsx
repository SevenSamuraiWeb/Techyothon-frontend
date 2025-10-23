'use client'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import React, { useState } from "react"
import {
    ChevronDown,
    ChevronRight,
    MapPin,
    Building2,
    FileText,
    Image,
    SquareArrowOutUpLeft, // FIX: Corrected icon name
} from "lucide-react"
import Link from "next/link"
import ReportComplaintForm from "./ReportComplaintForm"

enum status {
    Open = "Open",
    InProgress = "In Progress",
    Resolved = "Resolved",
}

interface complaint {
    id: number;
    subject: string;
    description: string;
    status: status;
    image: string | null; // FIX: Changed 'File' type to 'string' to match data
    location: string;
    department: string;
}

const complaindata: complaint[] = [
    {
        id: 1,
        subject: "Pothole on Main Street",
        description: `There's a large pothole near the traffic signal causing vehicle damage.`,
        status: status.Open,
        image: "/images/pothole.jpg",
        location: "Andheri West, Mumbai",
        department: "Road Maintenance",
    },
    {
        id: 2,
        subject: "Streetlight not working",
        description: "The streetlight near my house has been off for 5 days, making the lane unsafe at night.",
        status: status.InProgress,
        image: "/images/streetlight.jpg",
        location: "Baner, Pune",
        department: "Electrical Department",
    },
    {
        id: 3,
        subject: "Garbage overflow near market",
        description: "The garbage bins near the local market are overflowing and attracting stray dogs.",
        status: status.Resolved,
        image: "/images/garbage.jpg",
        location: "Rajajinagar, Bengaluru",
        department: "Sanitation",
    },
    {
        id: 4,
        subject: "Water leakage on street",
        description: "Water is leaking continuously from an underground pipe, wasting clean water.",
        status: status.Open,
        image: "/images/waterleak.jpg",
        location: "Sector 22, Chandigarh",
        department: "Water Supply",
    },
    {
        id: 5,
        subject: "Illegal dumping of waste",
        description: "People are dumping construction debris in the park area behind our colony.",
        status: status.InProgress,
        image: "/images/dumping.jpg",
        location: "Alkapuri, Vadodara",
        department: "Environment",
    },
    {
        id: 6,
        subject: "Broken street sign",
        description: "The street name board near the post office is broken and lying on the ground.",
        status: status.InProgress,
        image: "/images/signboard.jpg",
        location: "Anna Nagar, Chennai",
        department: "Public Works",
    },
    {
        id: 7,
        subject: "Blocked drainage",
        description: "The drainage outside our apartment is clogged and causing bad odor.",
        status: status.Resolved,
        image: "/images/drainage.jpg",
        location: "Kukatpally, Hyderabad",
        department: "Sewerage",
    },
    {
        id: 8,
        subject: "Power outage in area",
        description: "Power has been out in the neighborhood since last night, no updates from authorities.",
        status: status.Open,
        image: "/images/poweroutage.jpg",
        location: "Salt Lake, Kolkata",
        department: "Electricity Board",
    },
    {
        id: 9,
        subject: "Tree fallen blocking road",
        description: "A large tree fell due to last night’s storm and is blocking the entire lane.",
        status: status.InProgress,
        image: "/images/fallentree.jpg",
        location: "Civil Lines, Jaipur",
        department: "Disaster Management",
    },
    {
        id: 10,
        subject: "Damaged public bench",
        description: "One of the benches in the park is broken and could injure children.",
        status: status.Open,
        image: "/images/bench.jpg",
        location: "Koregaon Park, Pune",
        department: "Parks and Recreation",
    },
];


const getStatusColor = (s: status) => {
    switch (s) {
        case status.Open:
            return "bg-red-100 text-red-700 hover:bg-red-100"
        case status.InProgress:
            return "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
        case status.Resolved:
            return "bg-green-100 text-green-700 hover:bg-green-100"
    }
}

export default function ComplainForm() {
    const [expandedRow, setExpandedRow] = useState<number | null>(null)

    const toggleRow = (id: number) => {
        setExpandedRow(expandedRow === id ? null : id)
    }

    return (
        <div className="w-full p-8">
            <div className="max-w-[90%] mx-auto">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <Card className="shadow-md border-0 rounded-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Open</p>
                                    <p className="text-2xl font-bold text-red-600">
                                        {complaindata.filter(c => c.status === status.Open).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-0 rounded-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">In Progress</p>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {complaindata.filter(c => c.status === status.InProgress).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-md border-0 rounded-xl">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-slate-600 mb-1">Resolved</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {complaindata.filter(c => c.status === status.Resolved).length}
                                    </p>
                                </div>
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                    <FileText className="w-6 h-6 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="w-full flex justify-end mr-5 mt-8 ">
                    <ReportComplaintForm />
                </div>

                <Card className="shadow-lg border-0 rounded-xl overflow-hidden mt-8"> {/* Added margin-top */}
                    <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white">
                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                            {/* FIX: Corrected h-14 to h-5 */}
                            <FileText className="w-5 h-5" />
                            Complaint List
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        <TableHead className="w-[50px]"></TableHead>
                                        <TableHead className="w-[70px] font-semibold text-slate-700">ID</TableHead>
                                        <TableHead className="font-semibold text-slate-700">Subject</TableHead>
                                        <TableHead className="font-semibold text-slate-700">Status</TableHead>
                                        <TableHead className="font-semibold text-slate-700">Location</TableHead>
                                        <TableHead className="font-semibold text-slate-700">Department</TableHead>
                                    </TableRow>
                                </TableHeader>

                                <TableBody className="w-full">
                                    {
                                        complaindata.map((complaint) => (
                                            // FIX: Key moved to the outer Fragment
                                            <React.Fragment key={complaint.id}>
                                                <TableRow
                                                    className="cursor-pointer hover:bg-slate-50 transition-colors"
                                                    onClick={() => toggleRow(complaint.id)}
                                                >
                                                    <TableCell>
                                                        {expandedRow === complaint.id ? (
                                                            <ChevronDown className="w-4 h-4 text-slate-600" />
                                                        ) : (
                                                            <ChevronRight className="w-4 h-4 text-slate-600" />
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="font-semibold text-slate-700">
                                                        #{complaint.id}
                                                    </TableCell>
                                                    <TableCell className="font-medium text-slate-800">
                                                        <div className="flex items-center gap-2">
                                                            {complaint.image && <Image className="w-4 h-4 text-blue-500" />}
                                                            {complaint.subject}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={getStatusColor(complaint.status)}>
                                                            {complaint.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <MapPin className="w-4 h-4" />
                                                            {complaint.location}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2 text-slate-600">
                                                            <Building2 className="w-4 h-4" />
                                                            {complaint.department}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>

                                                {expandedRow === complaint.id && (
                                                    // FIX: Added a unique key to the conditional row
                                                    <TableRow key={complaint.id + "-details"} className="bg-slate-25">
                                                        <TableCell colSpan={6} className="p-0"> {/* Removed padding */}
                                                            <div className="p-4 space-y-4">
                                                                <div>
                                                                    <h4 className="font-semibold text-slate-700 mb-2">Description</h4>
                                                                    <p className="text-slate-600 leading-relaxed">
                                                                        {complaint.description}
                                                                    </p>
                                                                </div>

                                                                {complaint.image && (
                                                                    <div>
                                                                        <h4 className="font-semibold text-slate-700 mb-2">Attached Image</h4>
                                                                        <img
                                                                            src={complaint.image}
                                                                            // FIX: Dynamic alt text for accessibility
                                                                            alt={complaint.subject}
                                                                            className="rounded-lg shadow-md max-w-md w-full h-48 object-cover border border-slate-200"
                                                                        />
                                                                    </div>
                                                                )}

                                                                {/* FIX: Cleaned up Link component */}
                                                                <Link
                                                                    href={`/complaints/${complaint.id}`}
                                                                    className="text-slate-600 hover:underline text-base font-medium inline-flex items-center gap-1.5 pt-2"
                                                                >
                                                                    <SquareArrowOutUpLeft className="w-4 h-4" />
                                                                    View Details
                                                                </Link>
                                                            </div>
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </React.Fragment>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}