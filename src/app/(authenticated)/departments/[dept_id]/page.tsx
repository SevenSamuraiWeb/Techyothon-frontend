'use client'

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ReassignPopover } from "../_components/ReassignPopover"
import { AlertCircle, Clock, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Complaint {
    _id: string
    title: string
    status: string
    category: string
    priority: string
    created_at: string
}

export default function DepartmentComplaintsPage() {
    const params = useParams()
    const dept = params?.dept_id as string | undefined

    const [complaints, setComplaints] = useState<Complaint[]>([])
    const [filteredComplaints, setFilteredComplaints] = useState<Complaint[]>([])
    const [loading, setLoading] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [priorityFilter, setPriorityFilter] = useState("all")

    useEffect(() => {
        if (!dept) return
        const fetchComplaints = async () => {
            setLoading(true)
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/${dept}/complaints`)
                if (!res.ok) throw new Error("Failed to fetch complaints")
                const data = await res.json()
                setComplaints(data.complaints)
                setFilteredComplaints(data.complaints)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchComplaints()
    }, [dept])

    useEffect(() => {
        let filtered = complaints

        if (searchQuery) {
            filtered = filtered.filter(c =>
                c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.category.toLowerCase().includes(searchQuery.toLowerCase())
            )
        }

        if (statusFilter !== "all") {
            filtered = filtered.filter(c => c.status.toLowerCase() === statusFilter.toLowerCase())
        }

        if (priorityFilter !== "all") {
            filtered = filtered.filter(c => c.priority.toLowerCase() === priorityFilter.toLowerCase())
        }

        setFilteredComplaints(filtered)
    }, [searchQuery, statusFilter, priorityFilter, complaints])

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase()
        if (s === "resolved" || s === "completed") return "bg-green-100 text-green-800 border-green-200"
        if (s === "in progress" || s === "pending") return "bg-blue-100 text-blue-800 border-blue-200"
        if (s === "open" || s === "new") return "bg-yellow-100 text-yellow-800 border-yellow-200"
        return "bg-gray-100 text-gray-800 border-gray-200"
    }

    const getPriorityColor = (priority: string) => {
        const p = priority.toLowerCase()
        if (p === "high" || p === "urgent") return "bg-red-100 text-red-800 border-red-200"
        if (p === "medium") return "bg-orange-100 text-orange-800 border-orange-200"
        if (p === "low") return "bg-slate-100 text-slate-800 border-slate-200"
        return "bg-gray-100 text-gray-800 border-gray-200"
    }

    const stats = {
        total: complaints.length,
        open: complaints.filter(c => c.status.toLowerCase() === "open" || c.status.toLowerCase() === "new").length,
        inProgress: complaints.filter(c => c.status.toLowerCase() === "in progress" || c.status.toLowerCase() === "pending").length,
        resolved: complaints.filter(c => c.status.toLowerCase() === "resolved" || c.status.toLowerCase() === "completed").length,
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">{dept}</h1>
                        <p className="text-slate-600 mt-1">Manage and track department complaints</p>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Complaints</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                                </div>
                                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <AlertCircle className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Open</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.open}</p>
                                </div>
                                <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <Clock className="h-6 w-6 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-orange-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">In Progress</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.inProgress}</p>
                                </div>
                                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Filter className="h-6 w-6 text-orange-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Resolved</p>
                                    <p className="text-2xl font-bold text-slate-900 mt-1">{stats.resolved}</p>
                                </div>
                                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardHeader>
                        <CardTitle>Complaints Overview</CardTitle>
                        <CardDescription>Filter and search through department complaints</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Search by title or category..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="open">Open</SelectItem>
                                    <SelectItem value="in progress">In Progress</SelectItem>
                                    <SelectItem value="resolved">Resolved</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder="Filter by priority" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Priority</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="low">Low</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="text-center space-y-3">
                                    <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                    <p className="text-slate-600">Loading complaints...</p>
                                </div>
                            </div>
                        ) : filteredComplaints.length === 0 ? (
                            <div className="text-center py-12">
                                <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                <p className="text-slate-600 font-medium">No complaints found</p>
                                <p className="text-slate-500 text-sm mt-1">Try adjusting your filters</p>
                            </div>
                        ) : (
                            <div className="border rounded-lg overflow-hidden">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-slate-50">
                                            <TableHead className="font-semibold">Title</TableHead>
                                            <TableHead className="font-semibold">Status</TableHead>
                                            <TableHead className="font-semibold">Priority</TableHead>
                                            <TableHead className="font-semibold">Category</TableHead>
                                            <TableHead className="font-semibold">Created</TableHead>
                                            <TableHead className="font-semibold">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredComplaints.map((c) => (
                                            <TableRow key={c._id} className="hover:bg-slate-50 transition-colors">
                                                <TableCell className="font-medium">{c.title}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getStatusColor(c.status)}>
                                                        {c.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={getPriorityColor(c.priority)}>
                                                        {c.priority}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-slate-600">{c.category}</TableCell>
                                                <TableCell className="text-slate-600">
                                                    {new Date(c.created_at).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </TableCell>
                                                <TableCell>
                                                    <ReassignPopover complaintId={c._id} />
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}