'use client'
import React, { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    FileText, MapPin, Clock, CheckCircle2, TrendingUp, TrendingDown,
    AlertCircle, Zap, Calendar, Target, BarChart3, PieChart as PieChartIcon
} from "lucide-react"
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell, Area, AreaChart, CartesianGrid
} from "recharts"

interface DashboardData {
    overview: {
        total_complaints: number
        recent_complaints: number
        days_analyzed: number
    }
    by_category: Record<string, number>
    by_status: Record<string, number>
    by_priority: Record<string, number>
    resolution_metrics: {
        avg_resolution_time_hours: number | null
        total_resolved: number
        verification_rate: number
    }
    top_locations: { address: string; count: number }[]
    daily_trends: { date: string; count: number }[]
}

const COLORS = {
    primary: ['#3b82f6', '#2563eb', '#1d4ed8'],
    success: ['#10b981', '#059669', '#047857'],
    warning: ['#f59e0b', '#d97706', '#b45309'],
    danger: ['#ef4444', '#dc2626', '#b91c1c'],
    purple: ['#8b5cf6', '#7c3aed', '#6d28d9'],
    pink: ['#ec4899', '#db2777', '#be185d'],
    chart: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f43f5e']
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchData() {
            try {
                const res = await fetch("http://127.0.0.1:8000/api/analytics/dashboard?days_back=30")
                if (!res.ok) throw new Error('Failed to fetch')
                const json = await res.json()
                setData(json)
            } catch (err) {
                console.error("Failed to fetch dashboard data", err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="relative w-16 h-16 mx-auto">
                        <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                        <div className="absolute inset-0 border-4 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                    <p className="text-gray-700 text-lg font-medium">Loading Dashboard</p>
                </div>
            </div>
        )
    }

    if (error || !data) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md bg-white rounded-md p-6 shadow-sm border border-gray-100">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <p className="text-gray-900 text-xl font-semibold">Unable to Load Data</p>
                    <p className="text-gray-600">Please check your connection and refresh</p>
                </div>
            </div>
        )
    }

    const categoryData = Object.entries(data.by_category).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }))

    const statusData = Object.entries(data.by_status).map(([name, value]) => ({
        name,
        value
    }))

    const priorityData = Object.entries(data.by_priority).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value
    }))

    const resolutionRate = data.overview.total_complaints > 0
        ? ((data.resolution_metrics.total_resolved / data.overview.total_complaints) * 100).toFixed(1)
        : 0

    const recentGrowth = data.overview.total_complaints > 0
        ? ((data.overview.recent_complaints / data.overview.total_complaints) * 100).toFixed(0)
        : 0

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Simple Light Header */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900">
                                Analytics Dashboard
                            </h1>
                            <p className="text-gray-600 text-sm sm:text-base mt-1 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-gray-500" />
                                Last {data.overview.days_analyzed} days
                            </p>
                        </div>
                        <Badge className="bg-blue-500 text-white border-0 px-3 py-1 text-sm self-start sm:self-auto">
                            Live Data
                        </Badge>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">

                {/* Key Metrics - Simple Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                    {/* Total Complaints */}
                    <div className="col-span-2 sm:col-span-1 bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                                <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            </div>
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Total</div>
                        <div className="text-gray-900 text-2xl sm:text-3xl lg:text-4xl font-bold">
                            {data.overview.total_complaints.toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">Complaints</div>
                    </div>

                    {/* Recent Complaints */}
                    <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            </div>
                            <Badge className="bg-gray-100 text-gray-700 border-0 text-xs px-2 py-0.5">30d</Badge>
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Recent</div>
                        <div className="text-gray-900 text-2xl sm:text-3xl lg:text-4xl font-bold">
                            {data.overview.recent_complaints.toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">{recentGrowth}% of total</div>
                    </div>

                    {/* Resolution Rate */}
                    <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            </div>
                            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Resolved</div>
                        <div className="text-gray-900 text-2xl sm:text-3xl lg:text-4xl font-bold">
                            {resolutionRate}%
                        </div>
                        <div className="text-gray-500 text-xs mt-1">{data.resolution_metrics.total_resolved} cases</div>
                    </div>

                    {/* Avg Response Time */}
                    <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            </div>
                            <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" />
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Avg Time</div>
                        <div className="text-gray-900 text-2xl sm:text-3xl lg:text-4xl font-bold">
                            {data.resolution_metrics.avg_resolution_time_hours
                                ? `${data.resolution_metrics.avg_resolution_time_hours.toFixed(1)}h`
                                : "N/A"}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">Response</div>
                    </div>
                </div>

                {/* Trends Chart - Light Card */}
                <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Daily Trends</h2>
                        </div>
                        <Badge className="bg-gray-100 text-gray-700 border border-gray-200 self-start sm:self-auto">
                            30 Days Overview
                        </Badge>
                    </div>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={data.daily_trends}>
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" />
                            <XAxis
                                dataKey="date"
                                stroke="#9ca3af"
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis
                                stroke="#9ca3af"
                                tick={{ fill: '#6b7280', fontSize: 11 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    color: '#111827',
                                    fontSize: '12px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#colorGradient)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Categories & Status - Light Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Categories */}
                    <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <PieChartIcon className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Categories</h2>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                            <div className="w-full sm:w-auto">
                                <ResponsiveContainer width={200} height={200}>
                                    <PieChart>
                                        <Pie
                                            data={categoryData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            dataKey="value"
                                        >
                                            {categoryData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS.chart[index % COLORS.chart.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: '#ffffff',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '8px',
                                                fontSize: '12px',
                                                color: '#111827'
                                            }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex-1 w-full space-y-2">
                                {categoryData.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 rounded-md transition-colors">
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <div
                                                className="w-3 h-3 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: COLORS.chart[idx % COLORS.chart.length] }}
                                            />
                                            <span className="text-gray-800 text-sm font-medium truncate">{item.name}</span>
                                        </div>
                                        <Badge className="bg-gray-100 text-gray-800 border-0 text-xs ml-2">{item.value}</Badge>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Status & Priority */}
                    <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center gap-2 mb-6">
                            <Target className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Status & Priority</h2>
                        </div>

                        {/* Status Section */}
                        <div className="mb-6">
                            <h3 className="text-gray-700 text-sm font-semibold mb-3">Status Breakdown</h3>
                            <div className="space-y-3">
                                {statusData.map((item, idx) => {
                                    const total = statusData.reduce((sum, s) => sum + s.value, 0)
                                    const percentage = total === 0 ? 0 : ((item.value / total) * 100).toFixed(0)
                                    return (
                                        <div key={idx} className="space-y-1.5">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-700 text-sm font-medium">{item.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-500 text-xs">{percentage}%</span>
                                                    <Badge className="bg-blue-500 text-white text-xs">{item.value}</Badge>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-400 rounded-full transition-all duration-700"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Priority Section */}
                        <div>
                            <h3 className="text-gray-700 text-sm font-semibold mb-3">Priority Levels</h3>
                            <ResponsiveContainer width="100%" height={180}>
                                <BarChart data={priorityData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e6e9ee" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#9ca3af"
                                        tick={{ fill: '#6b7280', fontSize: 11 }}
                                    />
                                    <YAxis
                                        stroke="#9ca3af"
                                        tick={{ fill: '#6b7280', fontSize: 11 }}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: '#ffffff',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '8px',
                                            fontSize: '12px',
                                            color: '#111827'
                                        }}
                                    />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS.chart[(index + 3) % COLORS.chart.length]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Performance Metrics - Light Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                    <div className="bg-white rounded-md p-4 sm:p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                                <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            </div>
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Verification Rate</div>
                        <div className="text-gray-900 text-3xl sm:text-4xl font-bold mb-2">
                            {data.resolution_metrics.verification_rate}%
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-green-400 rounded-full transition-all"
                                style={{ width: `${data.resolution_metrics.verification_rate}%` }}
                            />
                        </div>
                    </div>

                    <div className="bg-white rounded-md p-4 sm:p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                                <Target className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            </div>
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Total Resolved</div>
                        <div className="text-gray-900 text-3xl sm:text-4xl font-bold">
                            {data.resolution_metrics.total_resolved.toLocaleString()}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">Completed cases</div>
                    </div>

                    <div className="bg-white rounded-md p-4 sm:p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className="bg-gray-100 p-2 sm:p-3 rounded-lg">
                                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
                            </div>
                        </div>
                        <div className="text-gray-600 text-xs sm:text-sm font-medium mb-1">Analysis Period</div>
                        <div className="text-gray-900 text-3xl sm:text-4xl font-bold">
                            {data.overview.days_analyzed}
                        </div>
                        <div className="text-gray-500 text-xs mt-1">Days of data</div>
                    </div>
                </div>

                {/* Top Locations - Light Cards */}
                <div className="bg-white rounded-md p-4 sm:p-6 shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-600" />
                            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Top Locations</h2>
                        </div>
                        <Badge className="bg-gray-100 text-gray-700 border border-gray-200">Top 5</Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                        {data.top_locations.map((loc, idx) => {
                            const maxCount = Math.max(...data.top_locations.map(l => l.count))
                            const percentage = maxCount === 0 ? 0 : (loc.count / maxCount) * 100
                            return (
                                <div
                                    key={idx}
                                    className="bg-gray-50 rounded-md p-4 border border-gray-100 transition-all"
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="bg-gray-100 p-2 rounded-lg">
                                            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                                        </div>
                                        <Badge className="bg-blue-500 text-white text-xs">#{idx + 1}</Badge>
                                    </div>
                                    <div className="text-gray-800 text-sm mb-3 line-clamp-2 min-h-[2.5rem] font-medium">
                                        {loc.address}
                                    </div>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <div className="text-gray-900 text-2xl sm:text-3xl font-bold">{loc.count}</div>
                                            <div className="text-gray-500 text-xs">cases</div>
                                        </div>
                                        <div className="text-gray-700 text-sm font-semibold">{percentage.toFixed(0)}%</div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
}