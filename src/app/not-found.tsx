import styles from "@/styles/notFound.module.scss"
import Link from "next/link";

export default async function NotFound() {
    return (
        <main className="layout">
            <div className={styles.notFound}>
                <img src="/not-found.webp" alt="Not Found" width={150} height={150} />
                <h1>Oh no!</h1>
                <p>This page does not exist or you do not have permission to view it.</p>
                <Link href="/home">Go back to home</Link>
            </div>
        </main>
    );
}