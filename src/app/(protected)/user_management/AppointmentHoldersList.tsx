import { useEffect } from 'react'
import { showMessage } from '@/lib/message';
import styles from './appointmentHoldersList.module.scss'
import { NormalisedAccount, AccountType, BoyAccount } from '@/types/accounts';
import { useForm } from 'react-hook-form';
import Select from '@/components/Select';
import { AppointmentInput, UpdateAppointmentInput } from '@/types/appointments';
import { SubmitResult } from '@/types/forms'
import { useRouter } from 'next/navigation';

type AppointmentHoldersListProps = {
	account_type: AccountType,
	usersList: NormalisedAccount[],
	createAppointment: (data: AppointmentInput) => Promise<SubmitResult>
	deleteAppointment: (data: AppointmentInput) => Promise<SubmitResult>
	updateAppointment: (data: AppointmentInput) => Promise<SubmitResult>
}

const AppointmentHoldersList = ({ account_type, usersList, createAppointment, deleteAppointment, updateAppointment }: AppointmentHoldersListProps) => {
	const router = useRouter();
	const coreAppointments = ['CSM', 'DY CSM', 'Sec 4 & 5 PS', 'Sec 3 PS', 'Sec 2 PS', 'Sec 1 PS'];
	const boys = usersList.filter(user => user.type === "boy") as BoyAccount[];

	const { control, formState: { errors }, getValues, reset } = useForm();

	const {
		register: register2,
		handleSubmit: handleSubmit2,
		reset: reset2,
		control: control2,
		formState: { errors: errors2 }
	} = useForm<AppointmentInput>();

	const options = boys.map(boy => ({
		value: boy.email,
		label: `${boy.rank} ${boy.name}`
	}));

	const extraAppointments = boys
		.flatMap(b => b.appointment ?? [])
		.filter(appt => !coreAppointments.includes(appt));

	const allAppointments = [...coreAppointments, ...Array.from(new Set(extraAppointments))];

	useEffect(() => {
		const defaults = allAppointments.reduce<Record<string, string>>(
			(acc, appt) => {
				const holder = boys.find(b =>
					b.appointment?.includes(appt)
				);
				acc[appt] = holder ? holder.email : "";
				return acc;
			},
			{}
		);

		reset(defaults);
	}, [usersList, reset]);

	async function onAddSubmit(data: AppointmentInput) {
		try {
			await createAppointment(data);
			showMessage("Appointment created", "success");
			reset2({});
			router.refresh();
		} catch {
			showMessage("Failed to create appointment");
		}
	}

	async function onUpdateSubmit(appointment_name: string, new_email: string) {
		try {
			const originalEmail = boys.find(b => b.appointment?.includes(appointment_name))?.email ?? "";
			const data = { original_email: originalEmail, email: new_email, appointment_name } as UpdateAppointmentInput;

			await updateAppointment(data);
			showMessage("Appointment updated", "success");
			router.refresh();
		} catch {
			showMessage("Failed to update appointment");
		}
	}

	async function onDeleteSubmit(appointment_name: string) {
		if (prompt("Type 'yes' to confirm deletion") !== "yes") return;

		try {
			const email = boys.find(b => b.appointment?.includes(appointment_name))?.email ?? "";
			const data = { email, appointment_name } as AppointmentInput;

			await deleteAppointment(data);
			showMessage("Appointment deleted", "success");
			router.refresh();
		} catch {
			showMessage("Failed to delete appointment");
		}
	}

	return (
		<div className={styles['appointment-holders-list']}>

			<form className={styles['appointment-holders-users']}>
				<h3>Existing Appointments</h3>

				{allAppointments.map(appt => (
					<div key={appt}>
						<p>{appt}</p>

						<div className={styles.holder}>
							<Select
								name={appt}
								control={control}
								options={options}
								placeholder="Select appointment holder"
								error={typeof errors[appt]?.message === "string"
									? errors[appt]?.message
									: undefined}
							/>

							{["officer", "admin"].includes(account_type) && <button className={styles.update} type='button' onClick={() => onUpdateSubmit(appt, getValues(appt))}>
								<i className="fa-regular fa-check"></i>
								Update
							</button>}
							{["officer", "admin"].includes(account_type) && !(coreAppointments.includes(appt)) && <button className={styles.remove} type='button' onClick={() => onDeleteSubmit(appt)}>
								<i className="fa-regular fa-trash"></i>
								Delete
							</button>}
						</div>
					</div>
				))}
			</form>

			{["admin", "officer"].includes(account_type) && (
				<form onSubmit={handleSubmit2(onAddSubmit)} noValidate>

					<h3>New Appointment</h3>

					<div>
						<label htmlFor='name'>Name</label>
						<input placeholder='Enter Appointment Name' type='text' id='name' autoComplete='off' {...register2("appointment_name", { required: "Please enter an appointment name" })} />
						{errors2.appointment_name && <span className={styles.error}>{errors2.appointment_name.message}</span>}
					</div>

					<div>
						<p>Holder</p>
						<Select
							name="email"
							control={control2}
							options={options}
							placeholder="Select holder"
							error={errors2.email?.message}
						/>
					</div>

					<button>Add</button>
				</form>
			)}

		</div>
	);
};

export default AppointmentHoldersList