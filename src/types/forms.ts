export type SubmitResult =
	| { ok: true }
	| {
		ok: false;
		errors: {
			fieldErrors: Record<string, string[]>;
			formErrors: string[];
		};
	};