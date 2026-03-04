'use client'

import { useEffect, useState, useRef } from 'react'
import styles from './targetResource.module.scss'
import dynamic from 'next/dynamic'
import ResourceContentWrapper from '../ResourceContentWrapper'

type Appointments = {
    name: string,
    appointment: string
};

type ResourcePageProps = {
    appointments: Appointments[]
}

const BBHistory = dynamic(() => import('./BBHistory'))
const BBSingapore = dynamic(() => import('./BBSingapore'))
const BBInternational = dynamic(() => import('./BBInternational'))
const BBVesper = dynamic(() => import('./BBVesper'))
const BBSongs = dynamic(() => import('./BBSongs'))
const BBObject = dynamic(() => import('./BBObject'))
const BBUniform = dynamic(() => import('./BBUniform'))
const BBAwards = dynamic(() => import('./BBAwards'))
const BBCompany = dynamic(() => import('./BBCompany'))
const BBLife = dynamic(() => import('./BBLife'))
const BBAppointments = dynamic(() => import('./BBAppointments'))

function ResourcesPage({ appointments }: ResourcePageProps) {
    const [selectedSection, setSelectedSection] = useState('bb-history');
    const sectionIds = ['bb-history', 'bb-singapore-story', 'bb-international-and-asia', 'bb-vesper-&-table-grace', 'bb-songs', 'bb-object,-motto-and-logo', 'bb-uniform', 'award-scheme', 'company-organisation-and-ranks', 'company-life-and-history', 'company-appointments'];
    const contentRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const sections = sectionIds
            .map(id => document.getElementById(id))
            .filter(Boolean) as HTMLElement[];

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter(entry => entry.isIntersecting)
                    .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

                if (visible.length > 0) setSelectedSection(visible[0].target.id);
            },
            {
                root: null,
                rootMargin: "-30% 0px -60% 0px",
                threshold: 0
            }
        );

        sections.forEach(section => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    const scrollToSection = (id: string) => {
        setSelectedSection(id);
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    return (
        <div className={styles.resource}>
            <div className={styles.content} ref={contentRef}>
                <div className={styles.title}>
                    <h2>Target</h2>
                </div>

                <h3 id="bb-history">BB History</h3>
                <ResourceContentWrapper>
                    <BBHistory />
                </ResourceContentWrapper>

                <h3 id="bb-singapore-story">The BB Singapore Story</h3>
                <ResourceContentWrapper>
                    <BBSingapore />
                </ResourceContentWrapper>

                <h3 id="bb-international-and-asia">BB International and BB Asia</h3>
                <ResourceContentWrapper>
                    <BBInternational />
                </ResourceContentWrapper>

                <h3 id="bb-vesper-&-table-grace">BB Vesper & Table Grace</h3>
                <ResourceContentWrapper>
                    <BBVesper />
                </ResourceContentWrapper>

                <h3 id="bb-songs">BB Songs</h3>
                <ResourceContentWrapper>
                    <BBSongs />
                </ResourceContentWrapper>

                <h3 id="bb-object,-motto-and-logo">BB Object, Motto and Logo</h3>
                <ResourceContentWrapper>
                    <BBObject />
                </ResourceContentWrapper>

                <h3 id="bb-uniform">BB Uniform</h3>
                <ResourceContentWrapper>
                    <BBUniform />
                </ResourceContentWrapper>

                <h3 id="award-scheme">Award Scheme</h3>
                <ResourceContentWrapper>
                    <BBAwards />
                </ResourceContentWrapper>

                <h3 id="company-organisation-and-ranks">Company Organisation and Ranks</h3>
                <ResourceContentWrapper>
                    <BBCompany />
                </ResourceContentWrapper>

                <h3 id="company-life-and-history">Company Life and History</h3>
                <ResourceContentWrapper>
                    <BBLife />
                </ResourceContentWrapper>

                <h3 id="company-appointments">Company Appointments</h3>
                <ResourceContentWrapper>
                    <BBAppointments appointments={appointments} />
                </ResourceContentWrapper>
            </div>

            <div className={styles.overview}>
                <div className={styles.line} style={{ top: `${sectionIds.indexOf(selectedSection) * (100 / sectionIds.length)}%` }}></div>
                {sectionIds.map((id) => (
                    <p
                        key={id}
                        onClick={() => scrollToSection(id)}
                        className={selectedSection === id ? styles.selected : ""}
                    >
                        {id.replaceAll("-", " ")}
                    </p>
                ))}
            </div>
        </div>
    )
}

export default ResourcesPage