"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Eye, AlertCircle, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"
import ReportComplaintForm from "./ReportComplaintForm"
import Cookies from "js-cookie"
import { useRouter } from "next/navigation"

// ----------------------------
// Interfaces
// ----------------------------
interface complaint {
    complaint_id: string
    status: string
    category: string
    priority: string
    title: string
    description: string
    created_at: Date
}

// ----------------------------
// Helper Functions
// ----------------------------
const getPriorityColor = (priority: string) => {
    const colors = {
        high: "bg-red-100 text-red-800 border-red-200",
        medium: "bg-amber-100 text-amber-800 border-amber-200",
        low: "bg-green-100 text-green-800 border-green-200"
    }
    return colors[priority.toLowerCase() as keyof typeof colors] || "bg-slate-100 text-slate-800 border-slate-200"
}

const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('resolved') || statusLower.includes('completed')) {
        return <CheckCircle2 className="w-4 h-4 text-green-600" />
    }
    if (statusLower.includes('pending') || statusLower.includes('open')) {
        return <Clock className="w-4 h-4 text-amber-600" />
    }
    if (statusLower.includes('rejected') || statusLower.includes('closed')) {
        return <XCircle className="w-4 h-4 text-red-600" />
    }
    return <AlertCircle className="w-4 h-4 text-blue-600" />
}

const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower.includes('resolved') || statusLower.includes('completed')) {
        return "bg-green-100 text-green-800 border-green-200"
    }
    if (statusLower.includes('pending') || statusLower.includes('open')) {
        return "bg-amber-100 text-amber-800 border-amber-200"
    }
    if (statusLower.includes('rejected') || statusLower.includes('closed')) {
        return "bg-red-100 text-red-800 border-red-200"
    }
    return "bg-blue-100 text-blue-800 border-blue-200"
}

// ----------------------------
// Component
// ----------------------------
export default function ComplainForm() {
    const [complaindata, setComplaints] = useState<complaint[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    // Pagination
    const [currentPage, setCurrentPage] = useState(1)
    const itemsPerPage = 5
    // Filters
    const [filterTitle, setFilterTitle] = useState("")
    const [filterCategory, setFilterCategory] = useState("")
    const [filterPriority, setFilterPriority] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    useEffect(() => {
        const fetchData = async () => {
            const tokenString = Cookies.get('token');
            let token: any = null;
            if (tokenString) {
                try {
                    token = JSON.parse(tokenString);
                } catch (e) {
                    console.error("Failed to parse token from cookies:", e);
                    token = null;
                }
            }

            try {
                let response;
                if (token?.user?.role === "admin") {
                    response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/complaints/all`)
                } else {
                    const userId = token?.user?.id;
                    response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/complaints/user/${userId ?? ""}`)
                }

                if (!response.ok) throw new Error("Failed to fetch complaints")

                const data = await response.json()
                console.log("API Response:", data)

                // Normalize server responses into complaint[]
                if (Array.isArray(data)) {
                    setComplaints(data as complaint[])
                } else if (Array.isArray(data.complaints)) {
                    setComplaints(data.complaints as complaint[])
                } else if (data.complaint) {
                    setComplaints([data.complaint] as complaint[])
                } else if (data) {
                    setComplaints([data] as complaint[])
                } else {
                    setComplaints([])
                }
            } catch (error) {
                console.error("Error fetching complaints:", error)
                setError(error instanceof Error ? error.message : "An error occurred")
                setComplaints([])
            } finally {
                setLoading(false)
                useRouter().refresh()
            }
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600 text-lg font-medium">Loading complaints...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <p className="text-slate-800 text-xl font-semibold">Failed to Load Complaints</p>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        )
    }

    // Filtering logic
    const filteredComplaints = complaindata.filter((c) => {
        return (
            (!filterTitle || c.title.toLowerCase().includes(filterTitle.toLowerCase())) &&
            (!filterCategory || c.category.toLowerCase().includes(filterCategory.toLowerCase())) &&
            (!filterPriority || c.priority.toLowerCase().includes(filterPriority.toLowerCase())) &&
            (!filterStatus || c.status.toLowerCase().includes(filterStatus.toLowerCase()))
        )
    })

    // Pagination logic
    const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage)
    const paginatedComplaints = filteredComplaints.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                            <Badge className="bg-blue-100 text-blue-800 border border-blue-200 px-4 py-2 text-sm font-medium">
                                Total: {filteredComplaints.length}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="max-h-[80%] overflow-y-scroll">
                    <ReportComplaintForm />
                </div>

                {/* Complaints Table */}
                <Card className="shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-4 sm:px-6 py-5">
                        <CardTitle className="text-xl font-bold text-slate-800">
                            All Complaints
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            {/* Filters Row */}
                            <div className="flex flex-wrap gap-2 p-4 bg-slate-50 border-b border-slate-200">
                                <input
                                    type="text"
                                    placeholder="Filter Title"
                                    className="px-2 py-1 border rounded text-sm"
                                    value={filterTitle}
                                    onChange={e => { setFilterTitle(e.target.value); setCurrentPage(1); }}
                                />
                                <input
                                    type="text"
                                    placeholder="Filter Category"
                                    className="px-2 py-1 border rounded text-sm"
                                    value={filterCategory}
                                    onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                                />
                                <input
                                    type="text"
                                    placeholder="Filter Priority"
                                    className="px-2 py-1 border rounded text-sm"
                                    value={filterPriority}
                                    onChange={e => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                                />
                                <input
                                    type="text"
                                    placeholder="Filter Status"
                                    className="px-2 py-1 border rounded text-sm"
                                    value={filterStatus}
                                    onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                />
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-slate-50 hover:bg-slate-50">
                                        <TableHead className="font-bold text-slate-700 whitespace-nowrap">ID</TableHead>
                                        <TableHead className="font-bold text-slate-700 min-w-[200px]">Title</TableHead>
                                        <TableHead className="font-bold text-slate-700 whitespace-nowrap">Category</TableHead>
                                        <TableHead className="font-bold text-slate-700 whitespace-nowrap">Priority</TableHead>
                                        <TableHead className="font-bold text-slate-700 whitespace-nowrap">Status</TableHead>
                                        <TableHead className="font-bold text-slate-700 whitespace-nowrap">Created</TableHead>
                                        <TableHead className="font-bold text-slate-700 text-center whitespace-nowrap">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedComplaints.length > 0 ? (
                                        paginatedComplaints.map((c) => (
                                            <TableRow
                                                key={c.complaint_id}
                                                className="hover:bg-slate-50 transition-colors"
                                            >
                                                <TableCell className="font-mono text-xs sm:text-sm text-slate-600">
                                                    {c.complaint_id.substring(0, 8)}...
                                                </TableCell>
                                                <TableCell className="font-medium text-slate-800">
                                                    <div className="max-w-xs truncate">{c.title}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="capitalize whitespace-nowrap">
                                                        {c.category}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`capitalize border whitespace-nowrap ${getPriorityColor(c.priority)}`}
                                                    >
                                                        {c.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`capitalize flex items-center gap-1 w-fit border whitespace-nowrap ${getStatusColor(c.status)}`}
                                                    >
                                                        {getStatusIcon(c.status)}
                                                        {c.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-600 text-sm whitespace-nowrap">
                                                    {new Date(c.created_at).toLocaleDateString('en-US', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Link
                                                        href={`/complaints/${c.complaint_id}`}
                                                        className="inline-flex items-center gap-2 bg-stone-500 hover:bg-stone-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-lg whitespace-nowrap"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        <span className="hidden sm:inline">View Details</span>
                                                        <span className="sm:hidden">View</span>
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-12">
                                                <div className="flex flex-col items-center gap-3">
                                                    <AlertCircle className="w-12 h-12 text-slate-400" />
                                                    <p className="text-slate-600 text-lg font-medium">No complaints found</p>
                                                    <p className="text-slate-500 text-sm">There are currently no complaints in the system.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                                {filteredComplaints.length > 0 && (
                                    <TableCaption className="mt-4 text-slate-600">
                                        <div className="flex gap-4 justify-center items-center mt-2">
                                            <button
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded border border-blue-200 disabled:opacity-50"
                                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </button>
                                            <span>
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                className="px-3 py-1 bg-blue-100 text-blue-800 rounded border border-blue-200 disabled:opacity-50"
                                                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </TableCaption>
                                )}
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}