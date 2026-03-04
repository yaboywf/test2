'use client'

import styles from './targetResource.module.scss'

type Appointments = {
    name: string,
    appointment: string
};

type BBAppointmentsProps = {
    appointments: Appointments[]
}

export default function BBAppointments({ appointments }: BBAppointmentsProps) {
    return (
        <div className={styles.table} data-nomobile>
            <div>
                <p>Name</p>
                <p>Appointment</p>
            </div>
            {appointments.map((appointment, index) => (
                <div key={index}>
                    <p translate='no'>{appointment.name}</p>
                    <p>{appointment.appointment}</p>
                </div>
            ))}
        </div>
    )
}