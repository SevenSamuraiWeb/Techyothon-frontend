'use client';
import { useState, useEffect } from 'react';
import { ArrowRight, FileText, TrendingUp, MapPin, Users, AlertCircle, Activity, Clock, CheckCircle, BarChart3 } from 'lucide-react';

type TopLocation = { address?: string; count?: number };
type ResolutionMetrics = { verification_rate?: number; avg_resolution_time_hours?: number };
type Analytics = {
    by_category?: Record<string, number>;
    top_locations?: TopLocation[];
    resolution_metrics?: ResolutionMetrics;
    by_status?: Record<string, number>;
    by_priority?: Record<string, number>;
    overview?: { recent_complaints?: number };
};

type Complaint = { title?: string; status?: string; priority?: string };

type DashboardData = {
    complaints: { total: number; recent: Complaint[] };
    analytics: Analytics | null;
    departments: any[];
};

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData>({
        complaints: { total: 0, recent: [] },
        analytics: null,
        departments: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            // Fetch complaints
            const complaintsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/complaints/all`);
            const complaintsData = await complaintsRes.json();

            // Fetch analytics
            const analyticsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/analytics/dashboard?days_back=7`);
            const analyticsData = await analyticsRes.json();

            setData({
                complaints: {
                    total: complaintsData.total || 0,
                    recent: (complaintsData.complaints || []).slice(0, 3)
                },
                analytics: analyticsData,
                departments: complaintsData.departments || []
            });
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-stone-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                    <p className="mt-4 text-slate-600 font-medium">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const { complaints, analytics } = data;
    const categoryCount = analytics?.by_category ? Object.keys(analytics.by_category).length : 0;
    const topLocation = analytics?.top_locations?.[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-zinc-50 to-stone-50">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-slate-600 via-zinc-600 to-stone-600 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold mb-2">Dashboard</h1>
                            <p className="text-slate-100 text-sm sm:text-base">Real-time overview of complaint management</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg">
                            <Activity className="h-4 w-4 animate-pulse" />
                            <span className="text-sm font-medium">Live Updates</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 pb-8">
                {/* Quick Stats - Enhanced */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                    <QuickStat
                        label="Total Complaints"
                        value={complaints.total}
                        icon={<FileText className="h-5 w-5" />}
                        gradient="from-blue-500 to-blue-600"
                        trend="+12%"
                    />
                    <QuickStat
                        label="This Week"
                        value={analytics?.overview?.recent_complaints || 0}
                        icon={<TrendingUp className="h-5 w-5" />}
                        gradient="from-purple-500 to-purple-600"
                        trend="+8%"
                    />
                    <QuickStat
                        label="In Progress"
                        value={analytics?.by_status?.['In Progress'] || 0}
                        icon={<Clock className="h-5 w-5" />}
                        gradient="from-orange-500 to-orange-600"
                        trend="5 active"
                    />
                    <QuickStat
                        label="Resolved"
                        value={analytics?.by_status?.['Resolved'] || 0}
                        icon={<CheckCircle className="h-5 w-5" />}
                        gradient="from-green-500 to-green-600"
                        trend="82% rate"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

                    {/* Recent Complaints - Featured */}
                    <div className="lg:col-span-2">
                        <SectionCard
                            title="Recent Complaints"
                            subtitle={`${complaints.total} total complaints`}
                            icon={<FileText className="h-5 w-5 text-blue-600" />}
                            iconBg="bg-blue-100"
                            link="/complaints"
                        >
                            <div className="space-y-3">
                                {complaints.recent.length > 0 ? (
                                    complaints.recent.map((c, idx) => (
                                        <div key={idx} className="group p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl hover:shadow-md transition-all border border-slate-200 hover:border-blue-300 cursor-pointer">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-slate-900 truncate mb-2 group-hover:text-blue-600 transition-colors">{c.title}</p>
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <StatusBadge status={c.status} />
                                                        <PriorityBadge priority={c.priority} />
                                                    </div>
                                                </div>
                                                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 text-slate-500">
                                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                                        <p>No recent complaints</p>
                                    </div>
                                )}
                            </div>
                        </SectionCard>
                    </div>

                    {/* Analytics Overview - Enhanced */}
                    <SectionCard
                        title="Analytics"
                        subtitle="Performance metrics"
                        icon={<BarChart3 className="h-5 w-5 text-purple-600" />}
                        iconBg="bg-purple-100"
                        link="/analytics"
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <MetricBox
                                    label="Categories"
                                    value={categoryCount}
                                    color="purple"
                                />
                                <MetricBox
                                    label="Verified"
                                    value={`${analytics?.resolution_metrics?.verification_rate || 0}%`}
                                    color="green"
                                />
                            </div>
                            <div className="bg-gradient-to-br from-slate-50 to-slate-100/50 p-4 rounded-xl border border-slate-200">
                                <p className="text-xs text-slate-600 font-semibold mb-2 uppercase tracking-wide">Resolution Rate</p>
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 bg-slate-200 rounded-full h-3 overflow-hidden">
                                        <div
                                            className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full transition-all duration-500"
                                            style={{ width: `${analytics?.resolution_metrics?.verification_rate || 0}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-lg font-bold text-slate-900">
                                        {analytics?.resolution_metrics?.verification_rate || 0}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    </SectionCard>

                    {/* Location Insights */}
                    <SectionCard
                        title="Location Insights"
                        subtitle="Hotspot analysis"
                        icon={<MapPin className="h-5 w-5 text-green-600" />}
                        iconBg="bg-green-100"
                        link="/map"
                    >
                        <div className="space-y-4">
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                                <p className="text-xs text-green-600 font-semibold mb-2 uppercase tracking-wide">Top Area</p>
                                <p className="text-sm font-semibold text-slate-900 line-clamp-2 mb-1">
                                    {topLocation?.address || 'No data available'}
                                </p>
                                {topLocation && (
                                    <div className="flex items-center gap-1 text-green-700">
                                        <AlertCircle className="h-3 w-3" />
                                        <span className="text-xs font-medium">{topLocation.count} complaints</span>
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <MetricBox
                                    label="Locations"
                                    value={analytics?.top_locations?.length || 0}
                                    color="green"
                                />
                                <MetricBox
                                    label="Hotspots"
                                    value={analytics?.top_locations?.filter(l => typeof l.count === 'number' && l.count > 3).length || 0}
                                    color="red"
                                />
                            </div>
                        </div>
                    </SectionCard>

                    {/* Departments */}
                    <SectionCard
                        title="Departments"
                        subtitle="Team workload"
                        icon={<Users className="h-5 w-5 text-orange-600" />}
                        iconBg="bg-orange-100"
                        link="/departments"
                    >
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <MetricBox
                                    label="Active"
                                    value={analytics?.by_category ? Object.keys(analytics.by_category).length : 0}
                                    color="orange"
                                />
                                <MetricBox
                                    label="Pending"
                                    value={analytics?.by_status?.['In Progress'] || 0}
                                    color="yellow"
                                />
                            </div>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                                {Object.entries(analytics?.by_priority || {}).slice(0, 3).map(([priority, count]) => (
                                    <div key={priority} className="flex items-center justify-between">
                                        <span className="text-sm text-slate-600 font-medium">{priority}</span>
                                        <span className="text-sm font-bold text-slate-900 bg-white px-3 py-1 rounded-lg">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </SectionCard>

                    {/* Status Overview */}
                    <SectionCard
                        title="Status Overview"
                        subtitle="Current workflow"
                        icon={<Activity className="h-5 w-5 text-red-600" />}
                        iconBg="bg-red-100"
                        link="/status"
                    >
                        <div className="space-y-4">
                            <div className="space-y-2">
                                {Object.entries(analytics?.by_status || {}).slice(0, 3).map(([status, count]) => (
                                    <div key={status} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                        <span className="text-sm text-slate-700 font-medium">{status}</span>
                                        <span className="text-lg font-bold text-slate-900">{count}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                                <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Avg Resolution</p>
                                <p className="text-2xl font-bold text-blue-900">
                                    {analytics?.resolution_metrics?.avg_resolution_time_hours || 'N/A'}
                                    <span className="text-sm font-medium text-blue-600 ml-1">
                                        {analytics?.resolution_metrics?.avg_resolution_time_hours && 'hrs'}
                                    </span>
                                </p>
                            </div>
                        </div>
                    </SectionCard>

                </div>
            </div>
        </div>
    );
}

function QuickStat({ label, value, icon, gradient, trend }: any) {
    return (
        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 border border-slate-200">
            <div className={`bg-gradient-to-br ${gradient} text-white p-3 rounded-lg w-fit mb-3`}>
                {icon}
            </div>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1">{value}</p>
            <p className="text-xs text-slate-600 font-medium mb-1">{label}</p>
            {trend && <p className="text-xs text-green-600 font-semibold">{trend}</p>}
        </div>
    );
}

function SectionCard({ title, subtitle, icon, iconBg, children, link }: any) {
    return (
        <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all p-6 border border-slate-200 group">
            <div className="flex items-start justify-between mb-5">
                <div className="flex items-start gap-3">
                    <div className={`${iconBg} p-3 rounded-xl`}>
                        {icon}
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">{title}</h3>
                        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                    </div>
                </div>
            </div>

            <div className="mb-5">
                {children}
            </div>

            <button
                onClick={() => window.location.href = link}
                className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-blue-600 font-semibold py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-blue-50 transition-all group-hover:translate-x-1"
            >
                View Details
                <ArrowRight className="h-4 w-4" />
            </button>
        </div>
    );
}

function MetricBox({ label, value, color = 'purple' }: { label: string; value: string | number; color?: 'purple' | 'green' | 'orange' | 'yellow' | 'red' }) {
    const colorMap: Record<'purple' | 'green' | 'orange' | 'yellow' | 'red', string> = {
        purple: 'from-purple-50 to-purple-100 border-purple-200 text-purple-900',
        green: 'from-green-50 to-green-100 border-green-200 text-green-900',
        orange: 'from-orange-50 to-orange-100 border-orange-200 text-orange-900',
        yellow: 'from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900',
        red: 'from-red-50 to-red-100 border-red-200 text-red-900',
    };

    const key = color as 'purple' | 'green' | 'orange' | 'yellow' | 'red';

    return (
        <div className={`bg-gradient-to-br ${colorMap[key]} p-4 rounded-xl border`}>
            <p className="text-xs font-semibold mb-1 uppercase tracking-wide opacity-70">{label}</p>
            <p className={`text-2xl font-bold`}>{value}</p>
        </div>
    );
}

function StatusBadge({ status }: { status?: string }) {
    const statusColors: Record<string, string> = {
        'Resolved': 'bg-green-100 text-green-700 border-green-200',
        'In Progress': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        'Submitted': 'bg-blue-100 text-blue-700 border-blue-200',
        'Assigned': 'bg-purple-100 text-purple-700 border-purple-200',
    };

    const key = status ?? '';

    return (
        <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${statusColors[key] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {status}
        </span>
    );
}

function PriorityBadge({ priority }: { priority?: string }) {
    const priorityColors: Record<string, string> = {
        'High': 'bg-red-100 text-red-700 border-red-200',
        'Medium': 'bg-orange-100 text-orange-700 border-orange-200',
        'Low': 'bg-slate-100 text-slate-700 border-slate-200',
    };

    return (
        <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${priorityColors[priority ?? ''] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {priority}
        </span>
    );
}