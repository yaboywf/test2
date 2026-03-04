'use client'

import { useEffect, useState, useMemo, Fragment } from 'react'
import { useRouter } from 'next/navigation'
import styles from './uniformInspectionSummary.module.scss'
import { NormalisedAccount, BoyAccount } from '@/types/accounts'
import SemiCircleProgress from '@/components/SemiCircleProgressBar'
import { UniformCategory } from '@/types/inspection'
import { getSecLvl } from '@/lib/user'

type UniformInspectionPageProps = {
	users: NormalisedAccount[]
	yearlyChange: Record<string, any>[]
	fullComponents: UniformCategory[]
	inspections: Record<string, any[]>
	components: Record<string, any>[]
}

const UniformInspectionPage = ({ users, yearlyChange, fullComponents, inspections, components }: UniformInspectionPageProps) => {
	const router = useRouter();
	const boys = users.filter((user: NormalisedAccount) => user.type === 'boy' && !user.graduated) as BoyAccount[];
	const maxScore = components.reduce((acc, component) => acc + component.score, 0);

	const [search, setSearch] = useState<string>('');
	const [filteredBoys, setFilteredBoys] = useState<BoyAccount[]>(boys);
	const [secFilters, setSecFilters] = useState<string[]>(["sec1", "sec2", "sec3", "sec4", "sec5"])
	const [expandedBoys, setExpandedBoys] = useState<string[]>([]);

	useEffect(() => {
		setFilteredBoys(boys.filter((boy: BoyAccount) => {
			const matchName = boy.name.toLowerCase().includes(search.toLowerCase())
			const matchSec = secFilters.includes(`sec${getSecLvl(boy)}`)

			return matchName && matchSec
		}))
	}, [search, secFilters])

	const scorePerBoy = useMemo(() => {
		const scoreList: Record<string, Record<string, { score: number, assessor: string }>> = {}

		Object.entries(inspections).forEach(([boy, inspection]) => {
			const score = inspection.reduce((acc: number, i: Record<string, any>) => {
				const field = components.find(f => f.field_id === i.field_id);
				return acc + (field?.score || 0)
			}, 0);
			const date = new Date(inspection[0].inspection_date).toLocaleDateString('en-SG', { day: 'numeric', month: 'short', year: 'numeric' });
			const assessor = users.find(user => user.email === inspection[0].inspected_by)?.name || '-';
			if (!scoreList[boy]) scoreList[boy] = {}
			scoreList[boy][date] = { score, assessor };
		})

		return scoreList;
	}, [inspections])

	const avgScore = useMemo(() => {
		const allInspections = Object.values(scorePerBoy).flatMap(boy => Object.values(boy));
		if (allInspections.length === 0) return 0;
		const totalScore = allInspections.reduce((acc, i) => acc + i.score, 0);
		return totalScore / allInspections.length;
	}, [scorePerBoy])

	const topFailed = useMemo(() => {
		const fieldScoreMap = new Map<string, number>();
		components.forEach(c => fieldScoreMap.set(c.field_id, Number(c.score) || 0));

		const sectionInfo = new Map<string, { name: string, max: number }>();
		fullComponents.forEach(c => sectionInfo.set(c.id, { name: c.component_name, max: c.total_score }));

		const sectionStats: Record<string, { totalLost: number, totalMax: number }> = {};
		fullComponents.forEach(c => sectionStats[c.id] = { totalLost: 0, totalMax: 0 });

		const allRows = Object.values(inspections).flat();
		const resultGroup = new Map<string, { sectionId: string, totalEarned: number }>();

		allRows.forEach((row: any) => {
			const key = `${row.inspection_id}-${row.boy}-${row.section_id}`;
			const score = fieldScoreMap.get(row.field_id) || 0;

			if (!resultGroup.has(key)) {
				resultGroup.set(key, { sectionId: row.section_id, totalEarned: 0 });
			}
			resultGroup.get(key)!.totalEarned += score;
		});

		resultGroup.forEach((group) => {
			const info = sectionInfo.get(group.sectionId);
			if (!info) return;

			const max = info.max;
			const lost = Math.max(0, max - group.totalEarned);

			sectionStats[group.sectionId].totalMax += max;
			sectionStats[group.sectionId].totalLost += lost;
		});

		return Object.entries(sectionStats)
			.map(([id, stats]) => ({
				component_name: sectionInfo.get(id)?.name || 'Unknown',
				percentageFailed: stats.totalMax > 0 ? (stats.totalLost / stats.totalMax) : 0
			}))
			.sort((a, b) => b.percentageFailed - a.percentageFailed)
			.slice(0, 3);
	}, [inspections, fullComponents, components]);

	const toggleExpand = (boy: BoyAccount) => {
		if (expandedBoys.includes(boy.email)) {
			setExpandedBoys(expandedBoys.filter(e => e !== boy.email));
		} else {
			setExpandedBoys([...expandedBoys, boy.email]);
		}
	}

	return (
		<div className={styles.uniform_inspection_page}>
			<div className={styles.stats_container}>
				<h2>Company Statistics</h2>
				<div className={`${styles.stats} ${styles.trend}`}>
					<h3>Inspection Yearly Change</h3>
					<div>
						<p className={`${styles.percent_change} ${(yearlyChange[0]?.percent_change ?? 0) > 0 ? styles.positive : (yearlyChange[0]?.percent_change ?? 0) < 0 ? styles.negative : styles.stagnant}`}>{yearlyChange[0]?.percent_change ?? 0}%</p>
						{(yearlyChange[0]?.percent_change ?? 0) > 0 ? (
							<i className={`fa-regular fa-arrow-trend-up ${styles.positive}`}></i>
						) : (yearlyChange[0]?.percent_change ?? 0) < 0 ? (
							<i className={`fa-regular fa-arrow-trend-down ${styles.negative}`}></i>
						) : (
							<i className={`fa-regular fa-arrow-right ${styles.stagnant}`}></i>
						)}
					</div>
				</div>

				<div className={`${styles.stats} ${styles.pass_rate}`}>
					<h3>Average Score</h3>
					<SemiCircleProgress value={avgScore} max={maxScore} />
				</div>

				<div className={`${styles.stats} ${styles.failures}`}>
					<h3>Sections With The Most Faults</h3>
					<div>
						{topFailed.map((failure, i) => (
							<div key={i} className={styles.failure}>
								<p>{failure.component_name}</p>
								<span>{failure.percentageFailed * 100}% Failed</span>
							</div>
						))}
					</div>
				</div>
			</div>

			<h2>Latest Uniform Inspection</h2>

			<div className={styles.filter}>
				<div className={styles.search_box}>
					<label htmlFor="search">
						<i className='fa-regular fa-search'></i>
					</label>
					<input type="search" id="search" autoComplete='off' placeholder="Search Boy" onChange={e => setSearch(e.target.value)} />
				</div>

				<div className={styles.sec_filters}>
					{Array.from({ length: 5 }).map((_, i) => (
						<Fragment key={i}>
							<input
								type="checkbox"
								id={`sec${i + 1}-filter`}
								defaultChecked={secFilters.includes(`sec${i + 1}`)}
								onChange={() => {
									if (secFilters.includes(`sec${i + 1}`)) {
										setSecFilters(secFilters.filter(f => f !== `sec${i + 1}`));
									} else {
										setSecFilters([...secFilters, `sec${i + 1}`]);
									}
								}}
							/>
							<label htmlFor={`sec${i + 1}-filter`}>Sec {i + 1}</label>
						</Fragment>
					))}
					<button className={styles.toggle_all} onClick={() => setExpandedBoys(expandedBoys.length === 0 ? boys.map(boy => boy.email) : [])}>Toggle All</button>
				</div>

				<button onClick={() => router.push('/uniform_inspection/form')} className={styles.button}>
					<i className="fa-regular fa-file-export"></i>
					Conduct Inspection
				</button>
			</div>

			<div className={styles.table}>
				<div className={styles.header}>
					<p>Name</p>
					<p>Score</p>
					<p>Date</p>
					<p>Assessor</p>
					<p>Records</p>
				</div>

				{filteredBoys.map(boy => <Fragment key={boy.email}>
					<div className={styles.row}>
						<div className={styles.row_name}>
							<i className='fa-regular fa-chevron-right' style={{ transform: expandedBoys.includes(boy.email) ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease-in-out' }} onClick={() => toggleExpand(boy)}></i>
							<p onClick={() => toggleExpand(boy)}>{boy.name}</p>
						</div>
						<p className={styles.expand} onClick={() => toggleExpand(boy)}>{scorePerBoy[boy.name] ? "(expand to view)" : "-"}</p>
						<p className={styles.expand} onClick={() => toggleExpand(boy)}>{scorePerBoy[boy.name] ? "(expand to view)" : "-"}</p>
						<p className={styles.expand} onClick={() => toggleExpand(boy)}>{scorePerBoy[boy.name] ? "(expand to view)" : "-"}</p>
						<p aria-label="View Uniform Inspection Record">
							{!scorePerBoy[boy.name] && "-"}
							{scorePerBoy[boy.name] && <i className="fa-regular fa-up-right-from-square" onClick={() => router.push(`/uniform_inspection/view/${encodeURIComponent(boy.name)}`)}></i>}
						</p>
					</div>
					{scorePerBoy[boy.name] && expandedBoys.includes(boy.email) && Object.entries(scorePerBoy[boy.name]).map(([date, inspection]) => <div key={`${boy.email}-${date}`} className={`${styles.row} ${styles.expanded}`}>
						<div className={styles.row_name}></div>
						<div className={styles.score_container}>
							<div className={styles.bar}>
								<div className={styles.progress} style={{ width: `${inspection.score / maxScore * 100}%` }}></div>
							</div>
							<p>{String(inspection.score).padStart(2, '0')}/{maxScore}</p>
						</div>
						<p>{date}</p>
						<p>{inspection.assessor}</p>
						<p></p>
					</div>)}
				</Fragment>)}
			</div>
		</div>
	)
}

export default UniformInspectionPage