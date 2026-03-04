export type BadgeMastery = {
	id: string;
	mastery_name: string;
	mastery_description: string | null;
	mastery_description_hint: string | null;
	recommended_level: number | null;
}

export type SpecialAwards = "ipa" | "spa" | "founders";

export type AwardCategory = "personal" | "service" | SpecialAwards;

export type Badge = {
	id: string;
	badge_name: string;
	badge_categories: AwardCategory[];
	description: string | null;
	masteries: BadgeMastery[];
}

export type Attainment = {
	id: string;
	boy: string;
	badge_id: string;
	mastery_id: string;
	misc: string | null;
}

export type AwardUpdatePayload = {
	boy: string;
	badge_id: string;
	value: string;
	checked: boolean;
}