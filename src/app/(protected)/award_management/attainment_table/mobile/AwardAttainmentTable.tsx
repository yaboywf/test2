import { useState, useEffect, useMemo, useRef, Fragment } from 'react'
import styles from './awardAttainmentTable.module.scss'
import { BoyAccount } from '@/types/accounts';
import { Badge, AwardCategory } from '@/types/awards';
import { getSecLvl } from '@/lib/user';

type AwardAttainmentTableProps = {
	awards: Badge[];
	milestone: AwardCategory;
	boys: BoyAccount[];
	toggleAttainment: (e: React.ChangeEvent<HTMLInputElement>) => void;
	attained: string[];
	personalMastery: Badge[];
}

const milestoneOverrides: Record<AwardCategory, Record<string, string[]>> = {
	personal: {
		Adventure: ["Advanced"],
		Drill: ["Advanced"],
	},
	ipa: {
		Adventure: ["Basic"],
		Drill: ["Basic"],
		"Community Spiritedness": ["Advanced"],
		"Global Awareness": ["Basic"],
		Leadership: ["Basic"],
	},
	spa: {
		"Total Defence": ["Silver"],
		"Global Awareness": ["Advanced"],
		Leadership: ["Advanced"],
	},
	founders: {
		"Community Spiritedness": ["Master"],
		"Global Awareness": ["Master"],
		Leadership: ["Master"],
	},
	service: {
		"1 Year Service (First Year)": [],
		"1 Year Service (Second Year)": [],
		"1 Year Service (Third Year)": [],
	},
}

const fixedRequirements = {
	personal: [],
	ipa: ["1 Elective Point"],
	spa: ["4 Elective Points"],
	founders: ["6 Elective Points"],
	service: []
}

// To show attainment status for each special award
const AwardAttainmentTable = ({ awards, milestone, boys, toggleAttainment, attained, personalMastery }: AwardAttainmentTableProps) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [page, setPage] = useState(1);
	const rowsPerPage = 8;
	const [openCards, setOpenCards] = useState<string[]>([]);

	useEffect(() => {
		const el = scrollRef.current
		if (!el) return

		let isDown = false
		let startX = 0
		let scrollLeft = 0

		const mouseDown = (e: MouseEvent) => {
			isDown = true
			startX = e.pageX - el.offsetLeft
			scrollLeft = el.scrollLeft
			el.style.cursor = "grabbing"
			el.style.userSelect = "none"
		}

		const mouseLeave = () => {
			isDown = false
			el.style.cursor = "grab"
			el.style.removeProperty("user-select")
		}

		const mouseUp = () => {
			isDown = false
			el.style.cursor = "grab"
			el.style.removeProperty("user-select")
		}

		const mouseMove = (e: MouseEvent) => {
			if (!isDown) return
			e.preventDefault()
			const x = e.pageX - el.offsetLeft
			const walk = (x - startX) * 1
			el.scrollLeft = scrollLeft - walk
		}

		el.addEventListener("mousedown", mouseDown)
		el.addEventListener("mouseleave", mouseLeave)
		el.addEventListener("mouseup", mouseUp)
		el.addEventListener("mousemove", mouseMove)

		el.style.cursor = "grab"

		return () => {
			el.removeEventListener("mousedown", mouseDown)
			el.removeEventListener("mouseleave", mouseLeave)
			el.removeEventListener("mouseup", mouseUp)
			el.removeEventListener("mousemove", mouseMove)
		}
	}, [milestone])

	const filteredAwards = useMemo(() => {
		const override = milestoneOverrides[milestone]

		return awards.map((award) => {
			const key = award.badge_name.trim()

			const matchedKey = Object.keys(override).find(
				(k) => k.trim().toLowerCase() === key.toLowerCase()
			)

			if (!matchedKey || !award.masteries?.length) return award
			const allowedMasteries = override[matchedKey]

			return {
				...award,
				masteries: award.masteries.filter((m) => allowedMasteries.includes(m.mastery_name)),
			}
		}).filter(Boolean)
	}, [awards, milestone])

	const displayAwards = useMemo(() => {
		if (milestone !== "service") return filteredAwards;

		return filteredAwards.flatMap((award) => {
			if (award.badge_name.trim().toLowerCase() !== "1 year service") {
				return award;
			}

			return [
				{ ...award, id: `${award.id}-BB21-year1`, displayName: "1 Year Service (First Year)" },
				{ ...award, id: `${award.id}-BB21-year2`, displayName: "1 Year Service (Second Year)" },
				{ ...award, id: `${award.id}-BB21-year3`, displayName: "1 Year Service (Third Year)" },
			];
		});
	}, [filteredAwards, milestone]);

	const calculatePoints = useMemo(() => {
		const masteryPoints = new Map<string, number>();

		for (const badge of personalMastery) {
			for (const m of badge.masteries) {
				if (
					(badge.badge_name === "Adventure" && m.mastery_name === "Basic") ||
					(badge.badge_name === "Drill" && m.mastery_name === "Basic")
				) continue;
				masteryPoints.set(m.id, m.mastery_name === "Advanced" ? 2 : 1);
			}
		}

		const grouped: Record<string, number> = {};

		for (const key of attained) {
			const [boy, , value] = key.split("-BB21-");
			if (!boy || !value) continue;

			const pts = masteryPoints.get(value);
			if (pts === undefined) continue;

			grouped[boy] = (grouped[boy] ?? 0) + pts;
		}

		return grouped;
	}, [personalMastery, attained]);

	const paginatedBoys = useMemo(() => {
		const start = (page - 1) * rowsPerPage;
		const end = start + rowsPerPage;
		return boys.slice(start, end);
	}, [boys, page]);

	const totalPages = Math.ceil(boys.length / rowsPerPage) || 1;

	useEffect(() => {
		setPage(1);
	}, [milestone]);

	const attainedSet = useMemo(() => new Set(attained), [attained]);

	const requiredSuffixes = useMemo(() => {
		return displayAwards.flatMap((award) => {
			if (!award.masteries?.length) return [`${award.id}-BB21-null`];;
			return award.masteries.map((m) => `${award.id}-BB21-${m.id ?? 'null'}`);
		});
	}, [displayAwards]);

	const boyMeetsMilestone = (boyEmail: string) => {
		const points = calculatePoints[boyEmail] ?? 0;
		const fixedOk = fixedRequirements[milestone].every((req) => {
			const requiredPoints = parseInt(req.split(" ")[0]);
			return points >= requiredPoints;
		});

		if (!fixedOk) return false;

		for (const suffix of requiredSuffixes) {
			const key = `${boyEmail}-BB21-${suffix}`.trim();
			if (!attainedSet.has(key)) return false;
		}

		return true;
	};

	return (
		<div className={styles.container}>
			<div className={styles.pagination_container}>
				<p>Showing {boys.length === 0 ? 0 : page * rowsPerPage - rowsPerPage + 1} to {Math.min(page * rowsPerPage, boys.length)} of {boys.length} boys</p>
				{totalPages > 1 && (
					<div className={styles.pagination}>
						<button
							type="button"
							onClick={() => setPage(p => Math.max(1, p - 1))}
							disabled={page === 1}
						>
							<i className="fa-regular fa-chevron-left"></i>
						</button>
						{Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
							<button
								key={p}
								type="button"
								onClick={() => setPage(p)}
								className={p === page ? styles.active_page : ""}
							>
								{p}
							</button>
						))}

						<button
							type="button"
							onClick={() => setPage(p => Math.min(totalPages, p + 1))}
							disabled={page === totalPages}
						>
							<i className="fa-regular fa-chevron-right"></i>
						</button>
					</div>
				)}
			</div>

			<div className={styles.attainment_table} ref={scrollRef} key={milestone}>
				{paginatedBoys.map(boy => (
					<div key={boy.email} className={`${styles.boy} ${boyMeetsMilestone(boy.email) ? styles.completed : ""}`}>
						<div>
							<p>{boy.rank} {boy.name}</p>
							<i className='fa-regular fa-chevron-down' style={{ rotate: openCards.includes(boy.name) ? "180deg" : "0deg" }} onClick={() => setOpenCards(prev => prev.includes(boy.name) ? prev.filter(name => name !== boy.name) : [...prev, boy.name])}></i>
							<span className={styles.tag} data-sec={`Sec ${getSecLvl(boy)}`}>Sec {getSecLvl(boy)}</span>
						</div>

						<div className={`${styles.boy_content} ${openCards.includes(boy.name) ? styles.open : ""}`}>
							{fixedRequirements[milestone].map(requirement => {
								const points = calculatePoints[boy.email] ?? 0;
								const requiredPoints = parseInt(requirement.split(" ")[0]);

								return (
									<section className={styles.award} key={`${boy.email}-${requirement}`}>
										<p>{requirement}</p>
										<input
											id={`${boy.email}-BB21-${requirement}`}
											type="checkbox"
											name="fixed_requirement"
											onChange={() => { }}
											style={{ cursor: "default" }}
											checked={points >= requiredPoints}
										/>
										<p className={styles.points}>{points} points achieved</p>
									</section>
								)
							})}

							{displayAwards.map(award => (
								<section className={styles.award} key={`${boy.email}-${award.id}`}>
									<p>{award.badge_name}</p>
									{award.masteries.length === 0 ? (
										<input
											className={styles.fixed_requirement}
											id={`${boy.email}-BB21-${award.id}${!award.badge_name.includes('1 Year Service') ? '-BB21-null' : ''}`}
											type="checkbox"
											name="award"
											onChange={toggleAttainment}
											checked={attained.includes(`${boy.email}-BB21-${award.id}${!award.badge_name.includes('1 Year Service') ? '-BB21-null' : ''}`)}
										/>
									) : (
										award.masteries.map(mastery => (
											<Fragment key={mastery.id}>
												<input id={`${boy.email}-BB21-${award.id}-BB21-${mastery.id}`} type="checkbox" name="award" onChange={toggleAttainment} checked={attained.includes(`${boy.email}-BB21-${award.id}-BB21-${mastery.id}`)} />
												<label htmlFor={`${boy.email}-BB21-${award.id}-BB21-${mastery.id}`}>{mastery.mastery_name}</label>
											</Fragment>
										))
									)}
								</section>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default AwardAttainmentTable