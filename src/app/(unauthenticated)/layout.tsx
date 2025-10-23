import { cookies } from "next/headers";
import { redirect } from "next/navigation";
export default async function Layout({ children }: { children: React.ReactNode }) {
    const cookiesObj = await cookies()
    const session = cookiesObj.get('token')?.value
    console.log(session)
    if (session)
        redirect('/dashboard')
    return <>{children}</>;
}