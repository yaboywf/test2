'use client';

import { useEffect, useState } from 'react'
import { PendingTasks } from './pendingTasks'
import DashboardOptions from './dashboardOptions'
import styles from './dashboardPage.module.scss'
import type { CSSProperties } from "react";
import { NormalisedAccount } from '@/types/accounts';
import { useTour } from '@reactour/tour';

type DashboardPageProps = {
    user: Partial<NormalisedAccount>
}

const DashboardPage = ({ user }: DashboardPageProps) => {
    const [userId, setUserId] = useState(0)
    const [paradesAfterToday, setParadesAfterToday] = useState([])
    const { setIsOpen } = useTour()

    useEffect(() => {
        const isTourDone = localStorage.getItem("dashboard_tour_done")
        if (!isTourDone) {
            setIsOpen(true)
            localStorage.setItem("dashboard_tour_done", "true")
        }
    }, [setIsOpen])

    // useEffect(() => {
    //     const parades = await axios.get(`${BASE_URL}/parades`, { headers: { "x-route": "/get_parades_after_today" }, withCredentials: true })
    //     setParadesAfterToday(parades.data)
    // }, [user])

    return (
        <div className={styles.dashboard}>
            <div className={styles['dashboard-routes']} data-tour="routes">
                <DashboardOptions title="My Attendance" icon="user-clock" url="/user_attendance" color="1E5945" description='View your attendance and percentages' />
                {(["boy", "admin"].includes(user.type ?? "")) && <>
                    <DashboardOptions title="My Awards" icon="award" url="/award_management/user" color="C1876B" description='Manage and track your awards' />
                    <DashboardOptions title="My Inspection Results" icon="shirt-long-sleeve" url="/uniform_inspection/user" color="C1876B" description='View recent inspections results' />
                </>}

                {user.type !== "boy" && <DashboardOptions title="Uniform Inspection" icon="shirt-long-sleeve" url="/uniform_inspection" color="D53032" description='Conduct uniform inspection for Boys' />}

                {(user.type !== "boy" || (user.type === "boy" && ["csm", "admin"].some(r => user.appointment?.map(a => a.toLowerCase()).includes(r)))) && <>
                    <DashboardOptions title="User Management" icon="users" url="/user_management" color="252850" description='View and Edit Users and Appointments' />
                    <DashboardOptions title="Award Management" icon="file-certificate" url="/award_management" color="252850" description="Awards, eligibility, and Requirements" />
                    <DashboardOptions title="Results Generation" icon="file-invoice" url="/results_generation" color="252850" description='Automatically generate 32A Results' />
                    <DashboardOptions title="Parade & Attendance" icon="file" url="/attendance_management" color="252850" description='Manage parades and its attendance' />
                </>}

                <DashboardOptions title="Resources" icon="book" url="/resources" color="1E5945" description='View Resources for Badgeworks' />
                <DashboardOptions title="Parade Notice" icon="file" url="/parade_notice" color="1E5945" description='View upcoming parade notice' />
                <DashboardOptions title="Calendar" icon="calendar" url="/calendar" color="1E5945" description='View current and upcoming events' />
            </div>

            <div className={styles['others']}>
                <div>
                    <p>Welcome back,</p>
                    <h2 translate='no'>{user.rank ?? user.honorific ?? ""} {user.name}</h2>
                </div>

                <PendingTasks accountType={user.type ?? ""} appointment={user.appointment ?? []} userId={userId} paradesAfterToday={paradesAfterToday} styles={styles} />

                <div className={styles['access_levels']}>
                    <div style={{ '--legend': '#D53032' } as CSSProperties}></div>
                    <p>Officers, Primers and Volunteers</p>
                    <div style={{ '--legend': '#252850' } as CSSProperties}></div>
                    <p>Boys with Appointment(s) and Above</p>
                    <div style={{ '--legend': '#C1876B' } as CSSProperties}></div>
                    <p>Boys Only</p>
                    <div style={{ '--legend': '#1E5945' } as CSSProperties}></div>
                    <p>All Users</p>
                </div>
            </div>
        </div>
    )
}

export default DashboardPage