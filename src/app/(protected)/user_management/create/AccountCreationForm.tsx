'use client'

import { useEffect } from 'react'
import { showMessage } from '@/lib/message';
import { useRouter } from 'next/navigation';
import styles from './accountCreationForm.module.scss'
import "@/app/login/logInPage.module.scss";
import { useForm, SubmitHandler } from 'react-hook-form';
import { SubmitResult } from '@/types/forms';
import { NormalisedAccount } from '@/types/accounts';

type Sec1Class = `F1-${1 | 2 | 3 | 4 | 5 | 6 | 7}`;
type FormData = {
	type: "officer" | "primer" | "boy" | "volunteer";
	rank?: string;
	name: string;
	email: string;
	member_id: string;
	honorific?: "Mr" | "Mrs" | "Ms";
	class?: "VAL" | "TCH" | "A.CHP" | "CHP";
	sec1_class?: Sec1Class;
};

const AccountCreationForm = ({ user, submitForm }: { user: NormalisedAccount, submitForm: (data: FormData) => Promise<SubmitResult> }) => {
	const router = useRouter();

	const { register, handleSubmit, clearErrors, setError, formState: { errors }, watch } = useForm<FormData>({
		defaultValues: {
			type: 'boy',
		},
	});
	const type = watch("type");

	useEffect(() => {
		clearErrors();
	}, [type, clearErrors]);

	const onSubmit: SubmitHandler<FormData> = async (data) => {
		const res = await submitForm(data);

		if (!res?.ok && res?.errors) {
			console.error(res.errors);
			Object.entries(res.errors.fieldErrors).forEach(([field, messages]) => {
				if (messages?.[0]) setError(field as keyof FormData, { type: "server", message: messages[0] });
			});

			if (res.errors.formErrors[0]) showMessage(res.errors.formErrors[0], "error");
			return;
		} else {
			showMessage("Account created successfully", "success");
			router.push("/user_management");
		}
	}

	return (
		<form className={styles.account_creation} noValidate onSubmit={handleSubmit(onSubmit)}>
			<h2>Account Creation</h2>
			{type === "boy" && <p className={`${styles.tip} tip`}>It is assumed that this Boy is a Sec 1. To change this, go to this user's profile after account creation</p>}

			<label htmlFor='account-type-input'>Account Type</label>
			<select id="account-type-input" {...register("type", { required: true })} defaultValue={"boy"}>
				{["admin", "officer"].includes(user.type) && <option value="officer">Officer</option>}
				{["admin", "officer", "primer", "volunteer"].includes(user.type) && <option value="volunteer">Volunteer</option>}
				{["admin", "officer", "primer", "volunteer"].includes(user.type) && <option value="primer">Primer</option>}
				<option value="boy">Boy</option>
			</select>

			<hr />

			<div>
				<label htmlFor='name-input'>Name</label>
				<input placeholder='Enter Full Name' id='name-input' autoComplete='name' {...register("name", { required: "Name is required" })} />
				{errors.name && <p className={styles.error}>{errors.name.message}</p>}
			</div>

			<div>
				<label htmlFor='email-input'>Email</label>
				<input placeholder='Enter Email' id='email-input' autoComplete='email' type='email'
					{...register("email", {
						required: "Email is required",
						pattern: {
							value:
								type === "boy"
									? /^[A-Z0-9._%+-]+@students\.edu\.sg$/i
									: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
							message:
								type === "boy"
									? "Must be a students.edu.sg email"
									: "Invalid email address"
						}
					})}
				/>
				{errors.email && <p className={styles.error}>{errors.email.message}</p>}
			</div>

			{type !== "volunteer" && <div>
				<label htmlFor="rank-input">Rank</label>
				<select id="rank-input" {...register("rank", { validate: (value) => value !== "" || "Rank is required" })} defaultValue={""}>
					<option value="" disabled hidden>Select Rank</option>
					{type === "officer" && (<>
						<option value="OCT">OCT</option>
						<option value="2LT">2LT</option>
						<option value="LTA">LTA</option>
					</>)}
					{type === "primer" && (<>
						<option value="CLT">CLT</option>
						<option value="SCL">SCL</option>
					</>)}
					{type === "boy" && (<>
						<option value="REC">REC</option>
						<option value="PTE">PTE</option>
						<option value="LCP">LCP</option>
					</>)}
				</select>
				{errors.rank && <p className={styles.error}>{errors.rank.message}</p>}
			</div>}

			{type === "boy" && <div>
				<label htmlFor='sec1-input'>Sec 1 Class</label>
				<input id="sec1-input" placeholder='Enter Sec 1 Class' {...register("sec1_class", {
					required: "Class is required",
					pattern: {
						value: /^F1-[1-7]$/,
						message: "Class must be in the format F1-1 to F1-7"
					}
				})} defaultValue={""} />
				{errors.sec1_class && <p className={styles.error}>{errors.sec1_class.message}</p>}
			</div>}

			{(type !== "boy" && type !== "primer") && <div>
				<label htmlFor='honorific-input'>Honorific</label>
				<select id="honorific-input" {...register("honorific", { validate: value => !!value || "Honorific is required" })} defaultValue={""}>
					<option value="" disabled hidden>Select Honorific</option>
					<option value="Mr">Mr</option>
					<option value="Ms">Ms</option>
					<option value="Mrs">Mrs</option>
				</select>
				{errors.honorific && <p className={styles.error}>{errors.honorific.message}</p>}
			</div>}

			{type === "officer" && <div>
				<label htmlFor='class-input'>Class</label>
				<select id="class-input" defaultValue="" {...register("class", { validate: value => !!value || "Class is required" })}>
					<option value="" disabled hidden>Select Class</option>
					<option value="VAL">VAL</option>
					<option value="TCH">Teacher</option>
					<option value="CHP">Chaplain</option>
					<option value="A.CHP">Assistant Chaplain</option>
				</select>
				{errors.class && <p className={styles.error}>{errors.class.message}</p>}
			</div>}

			<div>
				<label htmlFor="member_id">Member ID</label>
				<input id="member_id" type={type !== "boy" ? "number" : "text"} {...register("member_id")} placeholder="Enter Member ID (Optional)" />
			</div>

			{type === 'boy' && <div></div>}

			<button type='button' onClick={() => router.back()}>
				<i className="fa-regular fa-arrow-left"></i>
				Back
			</button>

			<button>
				<i className="fa-regular fa-user-plus"></i>
				Create
			</button>
		</form>
	)
}

export default AccountCreationForm