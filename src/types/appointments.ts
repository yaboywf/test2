export type AppointmentInput = {
	appointment_name: string;
	email: string;
};

export type UpdateAppointmentInput = AppointmentInput & { original_email: string };