import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getServerSession } from "@/lib/jwt";
import "@/styles/globals.scss";
import DynamicNotifications from "@/components/DynamicNotifications";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
    const session = await getServerSession();
    if (!session) return redirect("/login");

    return (
        <>
            <DynamicNotifications />
            <ServiceWorkerRegister />
            <Header user={session} />
            <main className="layout">{children}</main>
            <Footer user={session} />
        </>
    );
}
