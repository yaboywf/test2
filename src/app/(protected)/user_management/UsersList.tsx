'use client'

import { NormalisedAccount } from '@/types/accounts';
import styles from './usersList.module.scss'
import { useRouter } from 'next/navigation';

const UserAccountsList = ({ usersList }: { usersList: NormalisedAccount[] }) => {
	const router = useRouter();

	return (
		<div className={styles.users_container}>
			{usersList.map((user, i) => (
				<div key={`user-${i}`} className={`${styles.user_card} ${styles[user.type]}`}>
					<div className={styles.avatar}>
						<i className="fa-regular fa-user"></i>
					</div>
					<h3 translate='no'>{user.rank ?? user.honorific} {user.name}</h3>
					<div className={styles.tags}>
						{user.class && <span>{user.class}</span>}
						{user.member_id && <span>Member ID: {user.member_id}</span>}
						{user.type === "boy" && user.appointment.length > 0 && user.appointment.map((appt, i) => <span key={`appt-${i}`}>{appt}</span>)}
						{user.type === "boy" && <span>Sec {user.sec}</span>}
						{user.type === "boy" && user.graduated && <span>Graduated</span>}
					</div>
					<div className={styles.actions}>
						<button onClick={() => window.open(`mailto:${user.email}`)}>
							<i className="fa-regular fa-envelope"></i>
						</button>
						<button onClick={() => router.push(`/user_management/edit/${encodeURIComponent(user.name)}`)}>
							<i className="fa-regular fa-pen-to-square"></i>
							Edit
						</button>
					</div>
				</div>
			))}
		</div>
	)
}

export default UserAccountsList