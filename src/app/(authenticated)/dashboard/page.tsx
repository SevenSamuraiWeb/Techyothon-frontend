import ComplainForm from "./_components/form"
export default function DashboardPage() {
    return (
        <div>
            <h1 className="flex ml-[2rem] mt-[1rem] text-xl font-bold">Dashboard</h1>
            <div className="flex flex-col w-full min-h-full items-center justify-center">
                <ComplainForm />
            </div>
        </div>
    )
}