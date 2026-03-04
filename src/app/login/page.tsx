import { redirect } from "next/navigation";
import LoginPage from "./LoginPage";
import { getServerSession } from "@/lib/jwt";
import Footer from "../../components/Footer";

export default async function Login({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
    const params = await searchParams;
    const next = params.next || "/home";
    const error = params.error || null;

    const session = await getServerSession();
    if (session) return redirect(next);

    return (
        <>
            <LoginPage error={error} />
            <Footer user={session} />
        </>
    );
}