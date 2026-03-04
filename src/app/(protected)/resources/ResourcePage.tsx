'use client'

import { useState, useEffect } from 'react'
import styles from './resourcePage.module.scss'
import { NormalisedAccount } from '@/types/accounts'
import TargetResource from './target/TargetResource'
import ResourceAccess from './ResourceAccess'
import getPusherClient from "@/lib/pusher-client";
import { useRouter } from 'next/navigation'

type Appointments = {
    name: string,
    appointment: string
};

type ResourcePageProps = {
    user: NormalisedAccount
    appointments: Appointments[]
    allowedResources?: string[]
    boys?: { name: string, email: string, sec: number }[]
}

function ResourcesPage({ user, appointments, allowedResources = [], boys = [] }: ResourcePageProps) {
    const router = useRouter();
    const [selectedResource, setSelectedResource] = useState('target-content');
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const pusherClient = getPusherClient();
        const channel = pusherClient.subscribe("resources");

        channel.bind("pusher:subscription_succeeded", () => console.log("Pusher Connected"));
        channel.bind("updated", () => router.refresh());

        return () => channel.unsubscribe();
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return;

        const check = () => setIsMobile(window.innerWidth < 800)

        check()
        window.addEventListener("resize", check)

        return () => window.removeEventListener("resize", check)
    }, [])

    return (
        <div className={styles.resources}>
            <div className={styles.sidebar}>
                {!isMobile && <p>Target</p>}
                <div className={styles.buttons}>
                    <button onClick={() => setSelectedResource("target-content")} className={selectedResource === "target-content" ? styles.selected : ""}>
                        <i className='fa-regular fa-folders'></i>
                        {isMobile && "Target - "}Content
                    </button>
                    {user.type !== 'boy' && <button onClick={() => setSelectedResource("target-control")} className={selectedResource === "target-control" ? styles.selected : ""}>
                        <i className='fa-regular fa-lock'></i>
                        {isMobile && "Target - "}Control and Access
                    </button>}
                </div>
            </div>

            <div className={styles.content}>
                {selectedResource === 'target-content' && <>
                    {(allowedResources.includes("target") || user.type !== 'boy') ?
                        <TargetResource appointments={appointments} /> :
                        <div className={styles['resource-page-blocked']}>
                            <img src="/not-found.webp" width={100} height={100} alt="Not Found" />
                            <p>This resource is blocked. Please try again later.</p>
                        </div>
                    }
                </>}

                {selectedResource === 'target-control' && <ResourceAccess boys={boys} resource={selectedResource.split("-")[0]} />}
            </div>
        </div>
    )
}

export default ResourcesPage