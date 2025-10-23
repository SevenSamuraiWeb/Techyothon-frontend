"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, LayoutDashboard, BarChart3, FileText } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const data = {
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Analytics",
            url: "/analytics",
            icon: BarChart3,
        },
        {
            title: "Complaints",
            url: "/complaints",
            icon: FileText,
        },
    ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname()

    return (
        <Sidebar {...props}>
            {/* Sidebar Header */}
            <SidebarHeader className="border-b border-slate-200 p-4">
                <h1 className="text-xl font-semibold text-slate-800 tracking-tight">
                    🧭 CivicTrack
                </h1>
                <p className="text-xs text-slate-500">Smart Problem Resolver</p>
            </SidebarHeader>

            <SidebarContent className="flex flex-col justify-between h-full">
                {/* Navigation */}
                <div className="flex-1 mt-4">
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-slate-500 text-xs uppercase px-3 mb-1">
                            Navigation
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {data.navMain.map((item) => {
                                    const isActive = pathname === item.url
                                    return (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild isActive={isActive}>
                                                <Link
                                                    href={item.url}
                                                    className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                                                        ? "bg-slate-800 text-white"
                                                        : "text-slate-700 hover:bg-slate-100"
                                                        }`}
                                                >
                                                    <item.icon className="w-4 h-4" />
                                                    <span className="text-sm font-medium">{item.title}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    )
                                })}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </div>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-200">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-600 hover:bg-red-50 hover:text-red-700"
                        onClick={() => {
                            // Add logout logic here
                            console.log("User logged out")
                        }}
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </Button>
                </div>
            </SidebarContent>

            <SidebarRail />
        </Sidebar>
    )
}
