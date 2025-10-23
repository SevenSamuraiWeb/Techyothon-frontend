"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    MapPin,
    Layers,
    Filter,
    AlertCircle,
    Clock,
    CheckCircle2,
    XCircle,
    X,
} from "lucide-react";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet's default marker icons in React
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// ----------------------------
// Interfaces
// ----------------------------
interface Complaint {
    complaint_id: string;
    title: string;
    category: string;
    status: string;
    priority: string;
    created_at: string;
    image_url?: string;
}

interface Feature {
    type: string;
    geometry: {
        type: string;
        coordinates: [number, number];
    };
    properties: Complaint;
}

interface GeoJSONData {
    type: string;
    features: Feature[];
}

// ----------------------------
// Helper Functions
// ----------------------------
const getPriorityColor = (priority: string) => {
    const colors = {
        high: "red",
        medium: "orange",
        low: "green",
    };
    return colors[priority?.toLowerCase() as keyof typeof colors] || "blue";
};

const getStatusColor = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("resolved") || statusLower.includes("completed"))
        return "#10b981";
    if (statusLower.includes("pending") || statusLower.includes("open"))
        return "#f59e0b";
    if (statusLower.includes("rejected") || statusLower.includes("closed"))
        return "#ef4444";
    return "#3b82f6";
};

const getStatusIcon = (status: string) => {
    const statusLower = status?.toLowerCase() || "";
    if (statusLower.includes("resolved") || statusLower.includes("completed")) {
        return <CheckCircle2 className="w-4 h-4" />;
    }
    if (statusLower.includes("pending") || statusLower.includes("open")) {
        return <Clock className="w-4 h-4" />;
    }
    if (statusLower.includes("rejected") || statusLower.includes("closed")) {
        return <XCircle className="w-4 h-4" />;
    }
    return <AlertCircle className="w-4 h-4" />;
};

// ----------------------------
// Component
// ----------------------------
export default function ComplaintsMapView() {
    const [geoData, setGeoData] = useState<GeoJSONData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedStatus, setSelectedStatus] = useState<string>("all");
    const [viewMode, setViewMode] = useState<"markers" | "heatmap">("markers");
    const [selectedComplaint, setSelectedComplaint] = useState<Feature | null>(
        null
    );

    const categories = [
        "all",
        "infrastructure",
        "sanitation",
        "traffic",
        "utilities",
        "safety",
    ];
    const statuses = ["all", "pending", "in_progress", "resolved", "rejected"];

    useEffect(() => {
        fetchMapData();
    }, [selectedCategory, selectedStatus, viewMode]);

    const fetchMapData = async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams();
            if (selectedCategory !== "all") params.append("category", selectedCategory);
            if (viewMode === "markers" && selectedStatus !== "all") {
                params.append("status", selectedStatus);
            }

            const endpoint =
                viewMode === "markers"
                    ? "/api/map/complaints"
                    : "/api/map/heatmap";
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}${endpoint}?${params}`
            );
            if (!response.ok) throw new Error("Failed to fetch map data");
            const data = await response.json();
            setGeoData(data);
        } catch (err) {
            console.error("Error fetching map data:", err);
            setError(err instanceof Error ? err.message : "Failed to load map data");
        } finally {
            setLoading(false);
        }
    };

    const renderMap = () => {
        if (!geoData || geoData.features.length === 0) {
            return (
                <div className="flex items-center justify-center h-[600px] bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                    <div className="text-center space-y-3">
                        <MapPin className="w-16 h-16 text-slate-400 mx-auto" />
                        <p className="text-slate-600 font-medium">No complaints to display</p>
                        <p className="text-slate-500 text-sm">Try adjusting your filters</p>
                    </div>
                </div>
            );
        }

        return (
            <MapContainer
                center={[20.5937, 78.9629]} // Default center (India)
                zoom={5}
                style={{ height: "600px", width: "100%" }}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {geoData.features.map((feature, idx) => {
                    const [lng, lat] = feature.geometry.coordinates;
                    const color = getPriorityColor(feature.properties.priority);

                    return (
                        <Marker
                            key={idx}
                            position={[lat, lng]}
                            icon={L.divIcon({
                                className: "custom-icon",
                                html: `<div style="background-color:${color};width:12px;height:12px;border-radius:50%;"></div>`,
                            })}
                            eventHandlers={{
                                click: () => setSelectedComplaint(feature),
                            }}
                        >
                            <Popup>
                                <div>
                                    <h3 className="font-bold">{feature.properties.title}</h3>
                                    <p>Category: {feature.properties.category}</p>
                                    <p>Priority: {feature.properties.priority}</p>
                                    <p>Status: {feature.properties.status}</p>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p className="text-slate-600 text-lg font-medium">Loading map data...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
                <div className="text-center space-y-4 max-w-md">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
                    <p className="text-slate-800 text-xl font-semibold">Failed to Load Map</p>
                    <p className="text-slate-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6 sm:p-8">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-2 flex items-center gap-3">
                                <MapPin className="w-8 h-8 text-blue-500" />
                                Complaints Map
                            </h1>
                            <p className="text-slate-600">
                                Interactive visualization of complaints across locations
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Badge className="bg-blue-100 text-blue-800 border border-blue-200 px-4 py-2">
                                Total: {geoData?.features.length || 0}
                            </Badge>
                        </div>
                    </div>
                </div>

                {/* Map Display */}
                <Card className="shadow-xl border border-slate-200 rounded-2xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                        <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Layers className="w-5 h-5" />
                            Complaint Locations
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">{renderMap()}</CardContent>
                </Card>
            </div>
        </div>
    );
}