import SideBar from "@/components/SideBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex">
      <SideBar />
      {children}
    </section>
  );
}

