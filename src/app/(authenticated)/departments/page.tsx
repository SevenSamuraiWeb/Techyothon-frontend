'use client'

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Building2, AlertCircle, Clock, CheckCircle2, XCircle, TrendingUp, ArrowRight } from "lucide-react"

const departments = [
    "Roads Department",
    "Sanitation Department",
    "Electricity Department",
    "Water Department",
    "Other",
]

interface DepartmentStats {
    department: string
    total_complaints: number
    by_status: Record<string, number>
    by_priority: Record<string, number>
}

export default function DepartmentsPage() {
    const [stats, setStats] = useState<DepartmentStats[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)
            try {
                const results = await Promise.all(
                    departments.map(async (dept) => {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/departments/${encodeURIComponent(dept)}/stats`)
                        return res.ok ? res.json() : null
                    })
                )
                setStats(results.filter(Boolean))
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const getDepartmentIcon = (dept: string) => {
        if (dept.toLowerCase().includes('road')) return '🛣️'
        if (dept.toLowerCase().includes('sanitation')) return '🧹'
        if (dept.toLowerCase().includes('electricity')) return '⚡'
        if (dept.toLowerCase().includes('water')) return '💧'
        return '📋'
    }

    const getStatusColor = (status: string) => {
        const s = status.toLowerCase()
        if (s === "resolved" || s === "completed") return "bg-green-100 text-green-700"
        if (s === "in progress" || s === "pending") return "bg-blue-100 text-blue-700"
        if (s === "open" || s === "new") return "bg-yellow-100 text-yellow-700"
        return "bg-gray-100 text-gray-700"
    }

    const getPriorityColor = (priority: string) => {
        const p = priority.toLowerCase()
        if (p === "high" || p === "urgent") return "bg-red-100 text-red-700"
        if (p === "medium") return "bg-orange-100 text-orange-700"
        if (p === "low") return "bg-slate-100 text-slate-700"
        return "bg-gray-100 text-gray-700"
    }

    const totalComplaints = stats.reduce((sum, dept) => sum + dept.total_complaints, 0)
    const totalResolved = stats.reduce((sum, dept) => sum + (dept.by_status['Resolved'] || dept.by_status['resolved'] || 0), 0)
    const totalOpen = stats.reduce((sum, dept) => sum + (dept.by_status['Open'] || dept.by_status['open'] || dept.by_status['New'] || dept.by_status['new'] || 0), 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <Building2 className="h-8 w-8 text-blue-600" />
                            Departments Dashboard
                        </h1>
                        <p className="text-slate-600 mt-2">Monitor and manage complaints across all departments</p>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Total Complaints</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalComplaints}</p>
                                </div>
                                <div className="h-14 w-14 bg-blue-100 rounded-xl flex items-center justify-center">
                                    <AlertCircle className="h-7 w-7 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-yellow-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Open Complaints</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalOpen}</p>
                                </div>
                                <div className="h-14 w-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                                    <Clock className="h-7 w-7 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="pt-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600">Resolved</p>
                                    <p className="text-3xl font-bold text-slate-900 mt-1">{totalResolved}</p>
                                </div>
                                <div className="h-14 w-14 bg-green-100 rounded-xl flex items-center justify-center">
                                    <CheckCircle2 className="h-7 w-7 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center space-y-3">
                            <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="text-slate-600 font-medium">Loading department statistics...</p>
                        </div>
                    </div>
                )}

                {/* Department Cards */}
                {!loading && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {stats.map((dept) => (
                            <Card key={dept.department} className="hover:shadow-xl transition-all duration-300 border-0 shadow-md overflow-hidden group">
                                <div className="h-2 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-3 text-lg">
                                        <span className="text-2xl">{getDepartmentIcon(dept.department)}</span>
                                        <span className="text-slate-900">{dept.department}</span>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Total Complaints */}
                                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                        <span className="text-sm font-medium text-slate-600">Total Complaints</span>
                                        <span className="text-2xl font-bold text-slate-900">{dept.total_complaints}</span>
                                    </div>

                                    {/* Status Breakdown */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Status Breakdown</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(dept.by_status).length > 0 ? (
                                                Object.entries(dept.by_status).map(([status, count]) => (
                                                    <Badge key={status} variant="outline" className={`${getStatusColor(status)} border-0 px-3 py-1`}>
                                                        {status}: {count}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400">No data</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Priority Breakdown */}
                                    <div className="space-y-2">
                                        <p className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Priority Breakdown</p>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.entries(dept.by_priority).length > 0 ? (
                                                Object.entries(dept.by_priority).map(([priority, count]) => (
                                                    <Badge key={priority} variant="outline" className={`${getPriorityColor(priority)} border-0 px-3 py-1`}>
                                                        {priority}: {count}
                                                    </Badge>
                                                ))
                                            ) : (
                                                <span className="text-xs text-slate-400">No data</span>
                                            )}
                                        </div>
                                    </div>

                                    {/* View Button */}
                                    <Link href={`/departments/${encodeURIComponent(dept.department)}`} className="block">
                                        <Button
                                            variant="outline"
                                            className="w-full mt-2 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all duration-300"
                                        >
                                            View All Complaints
                                            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && stats.length === 0 && (
                    <Card className="border-dashed">
                        <CardContent className="flex flex-col items-center justify-center py-12">
                            <XCircle className="h-16 w-16 text-slate-400 mb-4" />
                            <p className="text-slate-600 font-medium text-lg">No department data available</p>
                            <p className="text-slate-500 text-sm mt-2">Check back later for updates</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}