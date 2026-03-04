'use client'

import { useEffect, useState, useMemo } from 'react'
import AwardAttainmentTableDesktop from './attainment_table/desktop/AwardAttainmentTable'
import AwardAttainmentTableMobile from './attainment_table/mobile/AwardAttainmentTable'
import getPusherClient from '@/lib/pusher-client';
import UploadFile from './upload_file/UploadFile';
import styles from './awardManagementPage.module.scss'
import { Badge, AwardCategory, AwardUpdatePayload } from '@/types/awards';
import { BoyAccount } from '@/types/accounts';
import { showMessage } from '@/lib/message';
import { Attainment } from '@/types/awards';
import { api } from '@/lib/api';

type AwardManagementPageProps = {
	awards: Badge[];
	boys: BoyAccount[];
	attainments: Attainment[];
}

const buttons: { name: string; category: AwardCategory }[] = [
	{ name: "Personal Mastery", category: "personal" },
	{ name: "IPA", category: "ipa" },
	{ name: "SPA", category: "spa" },
	{ name: "Founders", category: "founders" },
	{ name: "Service", category: "service" },
]

// To show boys progression towards IPA/SPA/Founders
const AwardManagementPage = ({ awards, boys, attainments }: AwardManagementPageProps) => {
	const [attained, setAttained] = useState<string[]>(attainments.map(a => `${a.boy}-BB21-${a.badge_id}-BB21-${a.mastery_id ?? a.misc ?? 'null'}`))
	const [category, setCategory] = useState<AwardCategory | "upload">("upload");

	const [isMobile, setIsMobile] = useState<boolean>(false);
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

	const groupedAwards = useMemo(() => {
		return awards.reduce<Record<AwardCategory, Badge[]>>((acc, award) => {
			award.badge_categories.forEach(category => {
				if (!acc[category]) {
					acc[category] = [];
				}
				acc[category].push(award);
			})
			return acc;
		}, {} as Record<AwardCategory, Badge[]>);
	}, [awards])

	useEffect(() => {
		const pusherClient = getPusherClient();
		const channel = pusherClient.subscribe("awards");

		channel.bind("award-update", (data: AwardUpdatePayload) => {
			const masteryId = `${data.boy}-BB21-${data.badge_id}-BB21-${data.value ?? 'null'}`;
			setAttained(prev => {
				if (data.checked) {
					if (!prev.includes(masteryId)) return [...prev, masteryId];
					return prev;
				} else {
					return prev.filter(id => id !== masteryId);
				}
			});
		});

		return () => {
			channel.unbind("award-update");
			channel.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (typeof window === "undefined") return;
		const checkMobile = () => setIsMobile(window.innerWidth < 800);

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	async function toggleAttainment(e: React.ChangeEvent<HTMLInputElement>): Promise<void> {
		const checked = e.target.checked;
		const id = e.target.id;
		const [boy, badgeId, value] = id.split("-BB21-");

		setAttained(prev => checked ? [...prev, id] : prev.filter(a => a !== id));

		try {
			await api("post", "/api/awards", { boy, badge_id: badgeId, value: value === 'null' ? null : value, checked });
		} catch (err) {
			console.error(err);
			setAttained(prev => !checked ? [...prev, id] : prev.filter(a => a !== id));
			showMessage("Failed to toggle attainment", 'error');
		}
	}

	return (
		<div className={styles['award-tracker']}>
			<div className={styles.sidebar} data-open={mobileSidebarOpen}>
				{isMobile && <button onClick={() => setMobileSidebarOpen(prev => !prev)}>
					<i className="fa-regular fa-chevrons-right" style={{ rotate: mobileSidebarOpen ? "180deg" : "0deg" }}></i>
				</button>}
				<button className={category === 'upload' ? styles.selected : ''} onClick={() => setCategory('upload')}>
					<i className="fa-regular fa-upload"></i>
					<span>Upload Tracker</span>
				</button>
				<button onClick={() => window.open("https://1drv.ms/w/c/3203de19ba2d6dd7/IQBJE06bY0LMS4W0HPxdqVBuAZdHsCaNVFcDzsNj6R4gOHo", "_blank")}>
					<i className="fa-regular fa-file-lines"></i>
					<span>Requirements</span>
					<i className={`fa-regular fa-arrow-up-right-from-square ${styles.link}`}></i>
				</button>
				<p onClick={() => setMobileSidebarOpen(prev => !prev)}>
					<i className="fa-regular fa-bullseye"></i>
					<span>Milestones</span>
				</p>
				{buttons.map((button) => (
					<button key={button.category} className={category == button.category ? styles.selected : ''} onClick={() => { setMobileSidebarOpen(false); setCategory(button.category) }}>{button.name}</button>
				))}
			</div>

			{category === 'upload' ? <UploadFile attained={attained} boys={boys} /> : (
				<div className={styles.content}>
					{isMobile ?
						<AwardAttainmentTableMobile awards={groupedAwards[category]} milestone={category} boys={boys} toggleAttainment={toggleAttainment} attained={attained} personalMastery={groupedAwards.personal} />
						:
						<AwardAttainmentTableDesktop awards={groupedAwards[category]} milestone={category} boys={boys} toggleAttainment={toggleAttainment} attained={attained} personalMastery={groupedAwards.personal} />
					}
				</div>
			)}
		</div>
	)
}

export default AwardManagementPage