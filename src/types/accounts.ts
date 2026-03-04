export type Sec1Class = `F1-${1 | 2 | 3 | 4 | 5 | 6 | 7}`;
export type Sec2Class = `H2-${1 | 2 | 3 | 4 | 5 | 6 | 7}`;
export type Sec3Class = `J3-${1 | 2 | 3 | 4 | 5 | 6 | 7}`;
export type Sec4Class = `P4-${1 | 2 | 3 | 4 | 5 | 6 | 7}`;

export type OfficerRank = "OCT" | "2LT" | "LTA";
export type PrimerRank = "CLT" | "SCL";
export type BoyRank = "REC" | "PTE" | "LCP" | "CPL" | "SGT" | "SSG" | "WO";

export type BaseAccount = {
    name: string
    email: string
}

export type OfficerAccount = BaseAccount & {
    honorific?: "Mr" | "Mrs" | "Ms";
    type: "officer";
    rank: OfficerRank;
    class: "VAL" | "TCH" | "A.CHP" | "CHP";
    member_id: number | null;

    sec1_class?: never;
    sec2_class?: never;
    sec3_class?: never;
    sec4_class?: never;
    sec5_class?: never;
    appointment?: never;
    sec1_rank?: never;
    sec2_rank?: never;
    sec3_rank?: never;
    sec4_rank?: never;
    sec5_rank?: never;
    graduated?: never;
    sec?: never;
}

export type PrimerAccount = BaseAccount & {
    type: "primer";
    rank: PrimerRank;
    member_id: number | null;

    sec1_class?: never;
    sec2_class?: never;
    sec3_class?: never;
    sec4_class?: never;
    sec5_class?: never;
    appointment?: never;
    sec1_rank?: never;
    sec2_rank?: never;
    sec3_rank?: never;
    sec4_rank?: never;
    sec5_rank?: never;
    graduated?: never;
    honorific?: never;
    class?: never;
    sec?: never;
}

export type VolunteerAccount = BaseAccount & {
    type: "volunteer";
    member_id: number | null;

    sec1_class?: never;
    sec2_class?: never;
    sec3_class?: never;
    sec4_class?: never;
    sec5_class?: never;
    appointment?: never;
    sec1_rank?: never;
    sec2_rank?: never;
    sec3_rank?: never;
    sec4_rank?: never;
    sec5_rank?: never;
    graduated?: never;
    honorific?: never;
    class?: never;
    rank?: never;
    sec?: never;
}

export type BoyAccount = BaseAccount & {
    type: "boy";
    rank: BoyRank;
    sec1_class: Sec1Class | null;
    sec2_class: Sec2Class | null;
    sec3_class: Sec3Class | null;
    sec4_class: Sec4Class | null;
    sec5_class: Sec4Class | null;
    appointment: string[]
    sec1_rank: "REC" | "PTE" | "LCP" | null;
    sec2_rank: "REC" | "PTE" | "LCP" | "CPL" | "SGT" | null;
    sec3_rank: "REC" | "PTE" | "LCP" | "CPL" | "SGT" | "SSG" | "WO" | null;
    sec4_rank: "REC" | "PTE" | "LCP" | "CPL" | "SGT" | "SSG" | "WO" | null;
    sec5_rank: "REC" | "PTE" | "LCP" | "CPL" | "SGT" | "SSG" | "WO" | null;
    member_id: string | null;
    graduated: boolean;

    honorific?: never;
    class?: never;
    sec?: number;
}

export type AdminAccount = BaseAccount & {
    type: "admin";

    sec1_class?: never;
    sec2_class?: never;
    sec3_class?: never;
    sec4_class?: never;
    sec5_class?: never;
    appointment?: never;
    sec1_rank?: never;
    sec2_rank?: never;
    sec3_rank?: never;
    sec4_rank?: never;
    sec5_rank?: never;
    graduated?: never;
    honorific?: never;
    class?: never;
    rank?: never;
    member_id?: never;
    sec?: never;
}

export type NonNormalisedAccount = {
    data: OfficerAccount | PrimerAccount | VolunteerAccount | BoyAccount
    role: "officer" | "primer" | "volunteer" | "boy" | "admin";
};

export type NormalisedAccount = OfficerAccount | PrimerAccount | VolunteerAccount | BoyAccount | AdminAccount;
export type AccountType = 'officer' | 'volunteer' | 'primer' | 'boy' | 'admin';

export type ServerSession = (OfficerAccount | PrimerAccount | VolunteerAccount | BoyAccount | AdminAccount) & {
    picture: string | null;
    iat: number;
    exp: number;
};