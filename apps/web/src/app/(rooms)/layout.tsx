import SideBar from "@/components/SideBar"

export default function RootLayout({ children }: {
    children: React.ReactNode
}) {
    return (
        <section className="flex">
            <div className="w-1/3">
                <SideBar />
            </div>
            <div className="w-2/3">
                {children}
            </div>
        </section>
    )
}