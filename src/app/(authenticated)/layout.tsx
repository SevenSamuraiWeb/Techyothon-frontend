import { AppSidebar } from "@/components/app-sidebar"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookiesObj = await cookies()
    const session = cookiesObj.get('token')?.value
    console.log(session)
    if (!session)
        redirect('/login')
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mr-2 data-[orientation=vertical]:h-4"
                />
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}