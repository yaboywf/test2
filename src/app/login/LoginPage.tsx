"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { showMessage } from '@/lib/message';
import styles from './logInPage.module.scss'
import "@/components/header.module.scss";
import IntroVideo from './Video';
import Link from 'next/link';

const LogInPage = ({ error }: { error: string | null }) => {
    const router = useRouter();
    const [isMobile, setIsMobile] = useState<boolean | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (error) showMessage(error);

        const check = () => {
            if (typeof window !== "undefined") {
                setIsMobile(window.innerWidth < 900);
            }
        };
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    return (
        <div className={styles.login}>
            <div className={styles.video_container}>
                {isMobile === null ? null : !isMobile ?
                    <>
                        <IntroVideo className={styles.video_main} />
                        <IntroVideo className={styles.video_overlay} />
                    </> :
                    <img src="/bb-banner-1.webp" alt="Background Image" width={150} height={150} />
                }
            </div>
            <div className={styles.content}>
                <div className={"logo"}>
                    <img src="/bb-crest.png" alt='BB Logo' width={60} height={60} />
                    <div>
                        <p>The boys' brigade</p>
                        <span>21st Singapore Company</span>
                    </div>
                </div>

                <Link href="/api/auth/login">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"></path>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"></path>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"></path>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"></path>
                    </svg>
                    Google
                </Link>

                <Link href="/parade_notice">View Parade Notice and Calendar <i className='fa-regular fa-arrow-right'></i></Link>

                <div className={`tip ${styles.tip}`}>Boys: school email · Others: personal email</div>
                <div className={styles.login_instruction}>
                    <i className='fa-regular fa-info-circle'></i>
                    Registered users only. Contact admin for help.
                </div>
            </div>
        </div>
    )
}

export default LogInPage