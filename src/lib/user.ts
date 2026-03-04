import { BoyAccount } from "@/types/accounts";

export const getSecLvl = (user: BoyAccount): number => {
    if (user.sec5_class) return 5;
    if (user.sec4_class) return 4;
    if (user.sec3_class) return 3;
    if (user.sec2_class) return 2;
    if (user.sec1_class) return 1;
    return 0;
}

export const RANK_ORDER = ["LTA", "2LT", "OCT", "SCL", "CLT", "WO", "SSG", "SGT", "CPL", "LCP", "PTE", "REC"];