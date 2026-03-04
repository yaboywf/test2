"use client"

import { useState, useEffect, Fragment } from 'react'
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { CSSProperties } from 'react';
import styles from './header.module.scss'
import '@/styles/globals.scss';
import { api } from '@/lib/api';
import { ServerSession } from '@/types/accounts';

interface Tabs {
	[key: string]: {
		[key: string]: [string, string];
	};
}

const baseTabs: Tabs = {
	"statistics": {
		"My Attendance": ["/user_attendance", "'\\f4fd'"],
		"My Awards": ["/user_awards", "'\\f559'"],
		"My Inspection Results": ["/user_inspections", "'\\e3c7'"]
	},
	"management": {
		"User Management": ["/user_management", "'\\f0c0'"],
		"Parades & Attendance": ["/attendance_management", "'\\f15b'"],
		"Award Management": ["/award_management", "'\\f5f3'"],
		"Result Generation": ["/generate_result", "'\\f570'"],
		"Uniform Inspection": ["/uniform_inspection", "'\\e3c7'"]
	},
	"others": {
		"Resources": ["/resources", "'\\f02d'"],
		"Help": ["/help", "'\\003f'"],
		"Parade Notice": ["/parade_notice", "'\\f15b'"],
		"Calendar": ["/calendar", "'\\f133'"]
	}
};

const Header = ({ user }: { user: ServerSession | null }) => {
	const router = useRouter();
	const pathname = usePathname();
	const [currentPage, setCurrentPage] = useState(pathname);

	const [navigationViewable, setNavigationViewable] = useState(false);
	const [submenuPos, setSubmenuPos] = useState({ x: 0, y: 0 });
	const [activeMenu, setActiveMenu] = useState<string | null>(null);
	const [tabs, setTabs] = useState(baseTabs);

	useEffect(() => {
		if (!user || typeof user !== 'object' || !('type' in user)) return;

		const tabs = structuredClone(baseTabs);
		if (!["boy", "admin"].includes(user.type) && tabs.statistics) {
			delete tabs.statistics["My Awards"]
			delete tabs.statistics["My Inspection Results"]
		}

		if (user.type === "boy" && user.appointment && tabs.management) delete tabs.management["Uniform Inspection"]
		if (user.type === "boy" && !user.appointment && tabs.management) delete tabs.management;
		setTabs(tabs);

		setCurrentPage(pathname);
	}, [pathname]);

	useEffect(() => {
		console.log(acsiiArt);
	}, [])

	const logout = async (): Promise<void> => {
		try {
			await api('post', '/api/auth/logout', { deviceId: localStorage.getItem('deviceId') });
			localStorage.removeItem('deviceId');
			router.replace('/login');
		} catch (err) {
			console.error("Error logging out:", err);
		}
	}

	const handleSubmenuClick = (e: React.MouseEvent, menuKey: string) => {
		if (activeMenu === menuKey) return setActiveMenu(null);

		const rect = e.currentTarget.getBoundingClientRect();
		setSubmenuPos({ x: rect.left, y: rect.bottom });
		setActiveMenu(menuKey);
	};

	return (
		<>
			<header className={styles.header}>
				<div className="logo" translate='no' onClick={() => router.push(user ? '/home' : '/login')}>
					<img src="/bb-crest.png" alt='BB Logo' width={"60"} height={"60"} />
					<div>
						<p>The boys' brigade</p>
						<span>21st Singapore Company</span>
					</div>
				</div>

				<div className={styles.topbar}>
					{!user ? <>
						<div onClick={() => router.push('/calendar')}>Calendar</div>
						<div onClick={() => router.push('/parade_notice')}>Parade Notice</div>
						<div onClick={() => router.push('/login')}>Login</div>
					</> : <>
						<div data-home onClick={() => { router.push('/home'); setActiveMenu(null) }}>Dashboard</div>
						{Object.keys(tabs).map((menuKey) => (
							<div key={menuKey} data-submenu onClick={(e) => handleSubmenuClick(e, menuKey)}>
								{menuKey.charAt(0).toUpperCase() + menuKey.slice(1)}
							</div>
						))}

						<div data-image={user?.picture || false} style={{ background: `url(${user?.picture}) center/cover no-repeat` }}></div>
						<div data-logout onClick={logout}>Logout</div>
					</>}
					<i className='fa-regular fa-bars' onClick={() => setNavigationViewable(prevState => !prevState)}></i>
				</div>
			</header>

			{activeMenu && <div className={styles.sub_menu} style={{ left: submenuPos.x, top: submenuPos.y + 10, height: `${4 + (Object.keys(tabs[activeMenu]).length * 10) + (Object.keys(tabs[activeMenu]).length * 30)}px` }}>
				{Object.keys(tabs[activeMenu]).map((tab, index) => <button key={index} style={{ "--icon": tabs[activeMenu][tab][1] } as CSSProperties} onClick={() => router.push(tabs[activeMenu][tab][0])}>{tab}</button>)}
			</div>}

			<div className={styles.sidebar_background} style={{ opacity: navigationViewable ? "1" : "0" }}></div>
			<div className={styles.sidebar} style={{ right: navigationViewable ? '0' : "-110vw" }}>
				<div>
					{user && <div data-image={user?.picture || false} style={{ background: `url('${user?.picture}') center/cover no-repeat` }} onClick={() => router.push("/user_profile")}></div>}
					<i className='fa-regular fa-xmark' onClick={() => setNavigationViewable(prevState => !prevState)}></i>
				</div>

				<div>
					{!user ? <>
						<button onClick={() => router.push('/parade_notice')} style={{ "--icon": '"\\f15b"' } as CSSProperties}>Parade Notice</button>
						<button onClick={() => router.push('/calendar')} style={{ "--icon": '"\\f133"' } as CSSProperties}>Calendar</button>
						<hr />
						<button data-main-button onClick={() => router.push('/login')}>Login</button>
					</> : <>
						<button onClick={() => router.push('/home')} style={{ "--icon": '"\\f015"' } as CSSProperties} className={currentPage === '/home' ? styles.active : ''}>Dashboard</button>

						{Object.keys(tabs).map((tab, index) => (
							<Fragment key={index}>
								<p>{tab.charAt(0).toUpperCase() + tab.slice(1)}</p>
								{Object.keys(tabs[tab]).map((t, index) => <button data-sub-button className={currentPage === tabs[tab][t][0] ? styles.active : ''} style={{ "--icon": tabs[tab][t][1] } as CSSProperties} key={index} onClick={() => router.push(tabs[tab][t][0])}>{t}</button>)}
							</Fragment>
						))}

						<hr />
						<button data-main-button onClick={logout}>Logout</button>
					</>}
				</div>
			</div>
		</>
	)
}

const acsiiArt = `
 mmmmmm    mmmmmm     mmmmm      mmm    
 ##""""##  ##""""##  #""""##m   #"##    
 ##    ##  ##    ##        ##     ##    
 #######   #######       m#"      ##    
 ##    ##  ##    ##    m#"        ##    
 ##mmmm##  ##mmmm##  m##mmmmm  mmm##mmm 
 """""""   """""""   """"""""  """""""" 
`

export default Header
