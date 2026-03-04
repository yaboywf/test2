"use client"

import { useState, useEffect, useMemo } from 'react'
import ResultPage from './ResultPage'
import styles from './resultGenerationPage.module.scss'
import { BoyAccount, NormalisedAccount } from '@/types/accounts'
import { useForm } from 'react-hook-form'
import Select from '@/components/Select'
import { Badge } from '@/types/awards'
import { useTour } from '@reactour/tour'
import { getSecLvl } from '@/lib/user'

type ResultGenerationPageProps = {
	allUsers: NormalisedAccount[];
	awards: Badge[];
}

type ResultsGenerationForm = {
	badge: string;
	mastery?: string;
	instructor: string;
	boys: {
		email: string;
		result: "pass" | "fail";
	}[];
	description?: string;
	credentials: string;
}

const ResultGenerationPage = ({ allUsers, awards }: ResultGenerationPageProps) => {
	const [search, setSearch] = useState("");
	const [filteredUsers, setFilteredUsers] = useState(allUsers);
	const [currentPage, setCurrentPage] = useState(1);
	const USERS_PER_PAGE = 6;
	const [isOtherInstructor, setIsOtherInstructor] = useState(false);
	const { setIsOpen } = useTour()

	const [selectedAward, setSelectedAward] = useState<Badge | undefined>();
	const { register, setValue, watch, control, formState: { errors } } = useForm<ResultsGenerationForm>({
		defaultValues: {
			boys: []
		}
	});
	const boys = watch("boys");
	const badge = watch("badge");
	const mastery = watch("mastery");
	const instructor = watch("instructor");
	const credentials = watch("credentials");
	const formValues = watch();

	const groupedUsers = useMemo(() => {
		const others: NormalisedAccount[] = [];
		const boys: BoyAccount[] = [];

		for (const u of allUsers) {
			if (u.type === "boy" && !u.graduated) boys.push(u);
			else others.push(u);
		}

		const ROLE_ORDER = ["officer", "primer", "volunteer"];
		const RANK_ORDER = ["LTA", "2LT", "OCT", "SCL", "CLT", "WO", "SSG", "SGT", "CPL", "LCP", "PTE", "REC"];

		others.sort((a, b) => {
			const typeDiff = ROLE_ORDER.indexOf(a.type) - ROLE_ORDER.indexOf(b.type);
			if (typeDiff !== 0) return typeDiff;

			if (a.rank && !b.rank) return -1;
			if (!a.rank && b.rank) return 1;

			if (a.rank && b.rank) {
				const rankDiff = RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank);
				if (rankDiff !== 0) return rankDiff;
			}

			return a.name.localeCompare(b.name);
		});

		boys.sort((a, b) => {
			const classDiff = getSecLvl(b) - getSecLvl(a);
			if (classDiff !== 0) return classDiff;

			const rankDiff = RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank);
			if (rankDiff !== 0) return rankDiff;

			return a.name.localeCompare(b.name);
		});

		return { others, boys };
	}, [allUsers]);

	useEffect(() => {
		const term = search.toLowerCase();

		const filtered = groupedUsers.boys.filter(user =>
			user.name.toLowerCase().includes(term) ||
			(user.rank?.toLowerCase().includes(term))
		);

		setFilteredUsers(filtered);
		setCurrentPage(1);
	}, [search, groupedUsers.boys]);

	useEffect(() => {
		const badgeInfo = awards.find(a => a.badge_name === badge);
		setSelectedAward(badgeInfo);
	}, [badge]);

	useEffect(() => {
		if (!selectedAward || !mastery) return;
		setValue("description", selectedAward?.masteries.find(m => m.mastery_name === mastery)?.mastery_description || selectedAward?.badge_name || "");
	}, [selectedAward, mastery, setValue, badge]);

	useEffect(() => {
		if (instructor === "Others") {
			setIsOtherInstructor(true);
			setValue("instructor", "");
		}
	}, [instructor, setValue]);

	useEffect(() => {
		const isTourDone = localStorage.getItem("results_generation_tour_done")
		if (!isTourDone) {
			setIsOpen(true)
			localStorage.setItem("results_generation_tour_done", "true")
		}
	}, [setIsOpen])

	function toggleBoy(email: string) {
		const current = watch("boys") || [];
		const existing = current.find(b => b.email === email);

		if (!existing) return setValue("boys", [...current, { email, result: "pass" }]);
		if (existing.result === "pass") return setValue("boys", current.map(b => b.email === email ? { ...b, result: "fail" } : b));
		setValue("boys", current.filter(b => b.email !== email));
	}

	const paginatedUsers = useMemo(() => {
		const start = (currentPage - 1) * USERS_PER_PAGE;
		return filteredUsers.slice(start, start + USERS_PER_PAGE);
	}, [filteredUsers, currentPage]);

	const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
	return (
		<div className={styles['result-generation-page']}>
			<h2>Generate Results</h2>

			<form className={styles['generate-results-form']} id='generate-results-form'>
				<div data-tour="award-select">
					<p>Badgework</p>
					<Select
						name="badge"
						control={control}
						placeholder="Select an Award"
						options={awards
							.filter(a => !["swimming", "first aid", "kayaking"].includes(a.badge_name.toLowerCase()))
							.map(a => ({
								value: a.badge_name,
								label: a.badge_name
							}))}
						error={errors.badge?.message}
					/>
					{errors.badge?.message && <p className={styles.error}>{errors.badge.message}</p>}
				</div>

				{selectedAward && selectedAward.masteries.length > 0 && <div>
					<p>Mastery</p>
					<Select
						name="mastery"
						control={control}
						placeholder="Select a Mastery"
						options={selectedAward.masteries.map(m => ({
							value: m.mastery_name,
							label: m.mastery_name
						}))}
						error={errors.mastery?.message}
					/>
					{errors.mastery?.message && <p className={styles.error}>{errors.mastery.message}</p>}
				</div>}

				<div data-tour="instructor-select">
					<p>Badgework Instructor</p>
					{!isOtherInstructor ?
						<Select
							name='instructor'
							placeholder="Select Instructor"
							control={control}
							options={[
								...groupedUsers.others.map(user => ({
									value: user.email,
									label: `${user.rank ?? user.honorific} ${user.name}`
								})),
								{ value: "Others", label: "Others" },
							]}
							error={errors.instructor?.message}
						/> : <div className={styles.other_instructor}>
							<input type="text" {...register("instructor")} placeholder="Enter instructor name" autoFocus />
							<button type="button" onClick={() => { setIsOtherInstructor(false); setValue("instructor", ""); }}>
								<i className="fa-regular fa-rotate-left"></i> Back
							</button>
						</div>}
					{errors.instructor?.message && <p className={styles.error}>{errors.instructor.message}</p>}
				</div>

				<div className={styles.credentials} data-tour="credentials-input">
					<p>Credentials</p>
					<input type="text" {...register("credentials")} placeholder="Enter credentials" />
					{errors.credentials?.message && <p className={styles.error}>{errors.credentials.message}</p>}
				</div>

				{(selectedAward) && <div data-tour="description-input">
					<label htmlFor='description'>Description</label>
					<textarea id='description' {...register("description")} placeholder={selectedAward.masteries.find(m => m.mastery_name === mastery)?.mastery_description_hint || "Enter description of badgework..."}></textarea>
					{errors.description?.message && <p className={styles.error}>{errors.description.message}</p>}
				</div>}

				<p>Boys to include in the results:</p>
				<div className={styles.search_box}>
					<i className="fa-regular fa-search"></i>
					<input type="search" name="search-boys" id="search-boys" placeholder="Search boys..." onChange={(e) => setSearch(e.target.value)} />
				</div>
				<div className={styles.filter} data-tour="filter">
					<p>Legend:</p>

					<div>
						<i className='fa-regular fa-check'></i>
						<p>Passed</p>
					</div>

					<div>
						<i className='fa-regular fa-xmark'></i>
						<p>Failed</p>
					</div>
				</div>
				{errors.boys?.message && <p className={styles.error}>{errors.boys.message}</p>}
				<div className={styles['boy-accounts']} data-tour="boys-list">
					{paginatedUsers.map((user, i) => {
						const selected = boys.find(b => b.email === user.email);

						return (
							<div key={`user-${i}`} className={`${styles.user_card} ${styles[user.type]} ${selected ? styles[selected.result] : ""}`} onClick={() => toggleBoy(user.email)}>
								<div className={styles.avatar}>
									<i className="fa-regular fa-user"></i>
								</div>
								<h3 translate='no'>{user.rank} {user.name}</h3>
								<div className={styles.tags}>
									{user.type === "boy" && user.appointment.length > 0 && user.appointment.map((appt, i) => <span key={`appt-${i}`}>{appt}</span>)}
									{user.type === "boy" && <span>Sec {getSecLvl(user)}</span>}
								</div>
							</div>
						)
					})}
				</div>

				{totalPages > 1 && (
					<div className={styles.pagination}>
						<button
							type="button"
							onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
							disabled={currentPage === 1}
						>
							<i className="fa-regular fa-chevron-left"></i>
						</button>

						{Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
							<button
								key={page}
								type="button"
								onClick={() => setCurrentPage(page)}
								className={currentPage === page ? styles.active_page : ""}
							>
								{page}
							</button>
						))}

						<button
							type="button"
							onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
							disabled={currentPage === totalPages}
						>
							<i className="fa-regular fa-chevron-right"></i>
						</button>
					</div>
				)}
			</form>

			{selectedAward != null && ((selectedAward.masteries.length > 0 && mastery != null) || (selectedAward.masteries.length === 0)) && instructor && credentials && boys.length > 0 && (
				<div data-tour="print-button">
					<button className={styles.print_button} onClick={() => window.print()}>
						<i className="fa-regular fa-file-export"></i> Generate
					</button>
					<ResultPage {...formValues} allUsers={allUsers} />
				</div>
			)}
		</div>
	);
}

export default ResultGenerationPage