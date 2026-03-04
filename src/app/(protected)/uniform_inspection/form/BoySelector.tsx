"use client"

import { NormalisedAccount, BoyAccount } from "@/types/accounts"
import styles from "./boySelector.module.scss"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { getSecLvl } from "@/lib/user"

type BoySelectorProps = {
    users: NormalisedAccount[]
    onConfirm: (selected: BoyAccount[]) => void
}

const RANK_ORDER = ["LTA", "2LT", "OCT", "SCL", "CLT", "WO", "SSG", "SGT", "CPL", "LCP", "PTE", "REC"];

const BoySelector = ({ users, onConfirm }: BoySelectorProps) => {
    const router = useRouter();
    const boys = users.filter(user => user.type === "boy" && !user.graduated) as BoyAccount[];
    const [selected, setSelected] = useState<BoyAccount[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [search, setSearch] = useState("");
    const MAX_CARDS = 6;

    const toggleBoy = (email: string) => {
        setSelected(prev => {
            if (prev.some(e => e.email === email)) {
                return prev.filter(e => e.email !== email);
            } else {
                return [...prev, boys.find(b => b.email === email)!];
            }
        });
    }

    const sortedBoys = useMemo(() => {
        return boys.sort((a, b) => {
            const classDiff = getSecLvl(b) - getSecLvl(a);
            if (classDiff !== 0) return classDiff;

            const rankDiff = RANK_ORDER.indexOf(a.rank) - RANK_ORDER.indexOf(b.rank);
            if (rankDiff !== 0) return rankDiff;

            return a.name.localeCompare(b.name);
        });
    }, [boys])

    const startIndex = (currentPage - 1) * MAX_CARDS;

    const filteredBoys = useMemo(() => {
        return sortedBoys.filter(boy => {
            const fields: (keyof BoyAccount)[] = ["name", "email", "rank", "appointment", "sec1_class", "sec2_class", "sec3_class", "sec4_class", "sec5_class"]

            return fields.some(field => {
                const value = boy[field]
                if (value === null || value === undefined) return false
                if (Array.isArray(value)) {
                    return value.some(v => v.toLowerCase().includes(search.toLowerCase()))
                }
                return value.toString().toLowerCase().includes(search.toLowerCase())
            })
        })
    }, [sortedBoys, search])

    const totalPages = Math.ceil(filteredBoys.length / MAX_CARDS);
    const currentBoys = filteredBoys.slice(startIndex, startIndex + MAX_CARDS);

    useMemo(() => {
        setCurrentPage(1);
    }, [search]);

    return (
        <div className={styles.container}>
            <h2>Select Boys to Inspect</h2>

            <div className={styles.search_container}>
                <i className="fa-regular fa-search"></i>
                <input type="text" onChange={e => setSearch(e.target.value)} placeholder="Search Boy..." />
            </div>

            {currentBoys.map(user => (
                <div key={`user-${user.email}`} className={`${styles.user_card} ${styles[user.type]} ${selected.some(e => e.email === user.email) ? styles.selected : ""}`} onClick={() => toggleBoy(user.email)}>
                    <div className={styles.avatar}>
                        <i className="fa-regular fa-user"></i>
                    </div>
                    <h3 translate='no'>{user.rank} {user.name}</h3>
                    <div className={styles.tags}>
                        {user.type === "boy" && user.appointment.length > 0 && user.appointment.map((appt, i) => <span key={`appt-${i}`}>{appt}</span>)}
                        {user.type === "boy" && <span>Sec {getSecLvl(user)}</span>}
                    </div>
                </div>
            ))}

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

            <div className={styles.button_container}>
                <button className={styles.confirm_button} onClick={() => router.push('/uniform_inspection')}>
                    <i className="fa-regular fa-arrow-left"></i>
                    <span>Back to List</span>
                </button>

                <button className={styles.confirm_button} onClick={() => onConfirm(selected)}>
                    <i className="fa-regular fa-check"></i>
                    <span>Confirm Selection</span>
                </button>
            </div>
        </div>
    )
}

export default BoySelector