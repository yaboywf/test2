'use client'

import { useState } from 'react'
import AppointmentHoldersList from './AppointmentHoldersList'
import UserAccountsList from './UsersList'
import styles from "./userManagementPage.module.scss"
import { useRouter } from 'next/navigation'
import { AccountType, NormalisedAccount, } from '@/types/accounts'
import { AppointmentInput } from '@/types/appointments'
import { SubmitResult } from '@/types/forms'

type UserManagementPageProps = {
	user: NormalisedAccount,
	usersList: NormalisedAccount[],
	createAppointment: (data: AppointmentInput) => Promise<SubmitResult>,
	deleteAppointment: (data: AppointmentInput) => Promise<SubmitResult>,
	updateAppointment: (data: AppointmentInput) => Promise<SubmitResult>
}

const UserManagementPage = ({ user, usersList, createAppointment, deleteAppointment, updateAppointment }: UserManagementPageProps) => {
	const router = useRouter();
	const [pageState, setPageState] = useState<"users" | "appointments" | "create">("users");
	const [filterOpen, setFilterOpen] = useState<boolean>(false);
	const [filters, setFilters] = useState<AccountType[]>(["officer", "primer", "volunteer", "boy"]);
	const [search, setSearch] = useState<string | null>('');

	function getSearchableFields(u: NormalisedAccount): string[] {
		return [u.name, u.type, u.rank, u.honorific, u.class, u.member_id, u.email, u.appointment].filter((v): v is string => typeof v === "string");
	}

	const filteredUsers = usersList.filter(u => {
		const searchText = search?.toLowerCase() ?? "";
		const matchesRole = filters.length === 4 || filters.includes(u.type);
		const matchesSearch = search === null || getSearchableFields(u).some(value => value.toString().toLowerCase().includes(searchText));

		return (matchesSearch || search === null) && matchesRole;
	});

	return (
		<div className={styles['user-management-page']}>
			<div className={styles['toggle-buttons']}>
				<input type="radio" name="toggle-buttons" id="users" onChange={() => setPageState("users")} checked={pageState === "users"} />
				<label htmlFor="users">Users</label>
				<input type="radio" name="toggle-buttons" id="appt" onChange={() => setPageState("appointments")} checked={pageState === "appointments"} />
				<label htmlFor="appt">Appts</label>
			</div>

			<div className={styles.users}>
				{pageState !== "appointments" && <>
					<div className={styles.users_list} data-class='usersList'>
						<div className={styles.filter_bar}>
							<div className={styles.search_box}>
								<i className='fa-regular fa-search'></i>
								<input type="search" id="search" placeholder='Find someone' value={search ?? ""} onChange={(e) => setSearch(e.target.value)} />
							</div>
							<div className={styles.advanced_filters}>
								<span onClick={() => setFilterOpen(!filterOpen)}>{filters.length === 0 ? "None" : filters.length === 4 ? "All" : filters.map(f => f.charAt(0).toUpperCase() + f.slice(1)).join(", ")}</span>
								<div className={styles.filters} data-open={filterOpen}>
									{["officer", "admin"].includes(user.type) && <>
										<input type="checkbox" id="officer" onChange={() => setFilters(filters.includes("officer") ? filters.filter(f => f !== "officer") : [...filters, "officer"])} />
										<label htmlFor="officer">Officers</label>
									</>}

									{["officer", "admin", "primer"].includes(user.type) && <>
										<input type="checkbox" id="volunteer" onChange={() => setFilters(filters.includes("volunteer") ? filters.filter(f => f !== "volunteer") : [...filters, "volunteer"])} />
										<label htmlFor="volunteer">Volunteers</label>
										<input type="checkbox" id="primer" onChange={() => setFilters(filters.includes("primer") ? filters.filter(f => f !== "primer") : [...filters, "primer"])} />
										<label htmlFor="primer">Primers</label>
									</>}

									<input type="checkbox" id="boy" onChange={() => setFilters(filters.includes("boy") ? filters.filter(f => f !== "boy") : [...filters, "boy"])} />
									<label htmlFor="boy">Boy</label>
								</div>
							</div>
							<i onClick={() => router.push("/user_management/create")} className={`fa-regular fa-user-plus ${styles.add_user}`}></i>
						</div>

						<p className={styles.subtitle}>Showing {filteredUsers.length} of {usersList.length} users</p>
						<UserAccountsList usersList={filteredUsers} />
					</div>
				</>}

				{pageState === "appointments" && <AppointmentHoldersList account_type={user.type} usersList={usersList} createAppointment={createAppointment} deleteAppointment={deleteAppointment} updateAppointment={updateAppointment} />}
			</div>
		</div>
	)
}

export default UserManagementPage