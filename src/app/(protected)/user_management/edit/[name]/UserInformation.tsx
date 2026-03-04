'use client'

import { useEffect } from 'react'
import { showMessage } from '@/lib/message';
import styles from './userInformation.module.scss'
import { useForm, SubmitHandler } from 'react-hook-form';
import { NormalisedAccount } from '@/types/accounts';
import { useRouter } from 'next/navigation';
import { SubmitResult } from '@/types/forms';

const secs = [1, 2, 3, 4, 5] as const;

type Sec = typeof secs[number];
type SecRankKey = `sec${Sec}_rank`;
type RankBySec = {
	1: "REC" | "PTE" | "LCP";
	2: "REC" | "PTE" | "LCP" | "CPL" | "SGT";
	3: "REC" | "PTE" | "LCP" | "CPL" | "SGT" | "SSG" | "WO";
	4: "REC" | "PTE" | "LCP" | "CPL" | "SGT" | "SSG" | "WO";
	5: "REC" | "PTE" | "LCP" | "CPL" | "SGT" | "SSG" | "WO";
};

const RANK_OPTIONS: { [K in Sec]: RankBySec[K][] } = {
	1: ["REC", "PTE", "LCP"],
	2: ["REC", "PTE", "LCP", "CPL", "SGT"],
	3: ["REC", "PTE", "LCP", "CPL", "SGT", "SSG", "WO"],
	4: ["REC", "PTE", "LCP", "CPL", "SGT", "SSG", "WO"],
	5: ["REC", "PTE", "LCP", "CPL", "SGT", "SSG", "WO"],
};

function pickFormDefaults<T extends NormalisedAccount>(user: T): Partial<T> {
	const { type, name, email, rank, class: cls, member_id, appointment, graduated, sec1_class, sec2_class, sec3_class, sec4_class, sec5_class, sec1_rank, sec2_rank, sec3_rank, sec4_rank, sec5_rank } = user;
	return { type, name, email, rank, class: cls, member_id, appointment, graduated, sec1_class, sec2_class, sec3_class, sec4_class, sec5_class, sec1_rank, sec2_rank, sec3_rank, sec4_rank, sec5_rank } as Partial<T>;
}

// To view users information and delete user accounts
const selectedUserInformation = ({ selectedUserInfo, submitForm, deleteForm }: { selectedUserInfo: NormalisedAccount, submitForm: (data: NormalisedAccount) => Promise<SubmitResult>, deleteForm: () => Promise<SubmitResult> }) => {
	const router = useRouter();
	const { register, handleSubmit, clearErrors, setError, setValue, formState: { errors, isDirty }, watch } = useForm<NormalisedAccount>({
		defaultValues: pickFormDefaults(selectedUserInfo)
	});
	const type = watch("type");
	const name = watch("name");
	const rank = watch("rank");
	const honorific = watch("honorific");
	const classes = watch(["sec1_class", "sec2_class", "sec3_class", "sec4_class", "sec5_class"]);
	const classesKey = (classes ?? []).map(v => v ?? "").join("|");

	useEffect(() => {
		clearErrors();
	}, [type, clearErrors]);

	useEffect(() => {
		secs.forEach((sec, index) => {
			if (!classes?.[index]) setValue(`sec${sec}_rank`, undefined, { shouldDirty: false, shouldTouch: false, shouldValidate: false });
		});
	}, [classesKey, setValue]);

	useEffect(() => {
		const handler = (e: BeforeUnloadEvent) => {
			if (!isDirty) return;
			e.preventDefault();
			e.returnValue = "";
		};

		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [isDirty]);

	const onSubmit: SubmitHandler<NormalisedAccount> = async (data) => {
		const res = await submitForm(data);

		if (!res?.ok && res?.errors) {
			console.error(res.errors);
			Object.entries(res.errors.fieldErrors).forEach(([field, messages]) => {
				if (messages?.[0]) setError(field as keyof NormalisedAccount, { type: "server", message: messages[0] });
			});

			if (res.errors.formErrors[0]) showMessage(res.errors.formErrors[0], "error");
			return;
		}

		showMessage("Account updated successfully", "success");
		router.push("/user_management");
	}

	const deleteAccount = async () => {
		if (prompt("Type 'yes' to confirm account deletion") !== "yes") return;
		await deleteForm();
		showMessage("Account deleted successfully", "success");
		router.push("/user_management");
	}

	const goBack = () => {
		if (isDirty && !confirm("You have unsaved changes. Leave anyway?")) return;
		router.push("/user_management")
	}

	const currentLevel = (() => {
		if (classes[4]) return 5;
		if (classes[3]) return 4;
		if (classes[2]) return 3;
		if (classes[1]) return 2;
		if (classes[0]) return 1;
		return 0;
	})();

	if (!selectedUserInfo) return

	return (
		<form className={styles.user_information} noValidate onSubmit={handleSubmit(onSubmit)}>
			<button type='button' onClick={goBack}>
				<i className="fa-regular fa-arrow-left"></i>
				Back
			</button>
			<h2 translate='no'>{rank ?? honorific} {name}</h2>
			<label htmlFor='account-type-input'>Account Type</label>
			<input id="account-type-input" disabled value={type} />

			<hr />

			<div>
				<label htmlFor='name-input'>Name</label>
				<input id='name-input' placeholder='Enter Name' autoComplete='name' {...register("name", { required: "Name is required" })} />
				{errors.name && <span className={styles.error}>{errors.name.message}</span>}
			</div>

			<div>
				<label htmlFor="email">Email</label>
				<input id="email" autoComplete='email' placeholder='Enter Email' disabled {...register("email", { required: "Email is required" })} />
				{errors.email && <span className={styles.error}>{errors.email.message}</span>}
			</div>

			{type !== 'volunteer' && <div>
				<label htmlFor='rank-input'>Rank</label>
				<select id="rank-input" {...register("rank", { required: "Rank is required" })}>
					{type === "officer" && <>
						<option value="OCT">OCT</option>
						<option value="2LT">2LT</option>
						<option value="LTA">LTA</option>
					</>}
					{type === "primer" && <>
						<option value="CLT">CLT</option>
						<option value="SCL">SCL</option>
					</>}
					{type === "boy" && <>
						<option value="REC">REC</option>
						<option value="PTE">PTE</option>
						<option value="LCP">LCP</option>
						<option value="CPL">CPL</option>
						<option value="SGT">SGT</option>
						<option value="SSG">SSG</option>
						<option value="WO">WO</option>
					</>}
				</select>
			</div>}

			<div>
				<label htmlFor='member_id'>Member ID</label>
				<input id='member_id' placeholder='Enter Member ID' {...register("member_id")} />
				{errors.member_id && <span className={styles.error}>{errors.member_id.message}</span>}
			</div>

			{type === "boy" && <div>
				<label htmlFor='graduated'>Graduated</label>
				<select id="graduated" {...register("graduated", { setValueAs: (v) => v === "true" })}>
					<option value="true">Yes</option>
					<option value="false">No</option>
				</select>
				{errors.graduated && <span className={styles.error}>{errors.graduated.message}</span>}
			</div>}

			{selectedUserInfo.appointment && <div>
				<label htmlFor='appointment-input'>Appointment</label>
				<input type="text" id='appointment-input' disabled value={selectedUserInfo.appointment} />
			</div>}

			{(type === "officer" || type === "volunteer") && <div>
				<label htmlFor='honorific'>Honorifics</label>
				<select id="honorific" {...register("honorific", { required: "Honorific is required" })} >
					<option value="Mr">Mr</option>
					<option value="Ms">Ms</option>
					<option value="Mrs">Mrs</option>
				</select>
				{errors.honorific && <span className='error'>{errors.honorific.message}</span>}
			</div>}

			{type === "officer" && <div>
				<label htmlFor='class'>Class</label>
				<select id="class" {...register("class", { required: "Class is required" })}>
					<option value="" hidden disabled>Select Class</option>
					<option value="VAL">VAL</option>
					<option value="TCH">Teacher</option>
					<option value="CHP">Chaplain</option>
					<option value="A.CHP">Assistant Chaplain</option>
				</select>
				{errors.class && <span className='error'>{errors.class.message}</span>}
			</div>}

			{type === 'boy' && <hr />}

			{type === "boy" && secs.map(i => (
				<div key={`sec-${i}`}>
					<label htmlFor={`sec-${i}-class`}>Sec {i} Class</label>
					<input id={`sec-${i}-class`} placeholder={`Enter Sec ${i} Class`} {...register(`sec${i}_class`)} />
					{errors[`sec${i}_class`] && <span className={styles.error}>{errors[`sec${i}_class`]?.message}</span>}
				</div>
			))}

			{type === "boy" && secs.filter(sec => sec < currentLevel).map(sec => {
				const field: SecRankKey = `sec${sec}_rank`;

				return <div key={sec}>
					<label htmlFor={`sec${sec}_rank`}>End of Sec {sec} Rank:</label>
					<select id={`sec${sec}_rank`} {...register(field)}>
						<option value='' disabled>Select Rank</option>
						{RANK_OPTIONS[sec].map(rank => <option key={rank} value={rank}>{rank}</option>)}
					</select>
					{errors[field] && <span className={styles.error}>{errors[field]?.message}</span>}
				</div>
			})}

			<button type='button' onClick={deleteAccount}>Delete Account</button>
			<button type='submit' disabled={!isDirty}>Save Changes</button>
		</form>
	)
}

export default selectedUserInformation