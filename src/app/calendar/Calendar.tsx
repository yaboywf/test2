'use client';

import { useState, useEffect, useRef } from "react";
import styles from './calendar.module.scss'

type CalendarEvent = {
    date: string;
    activity: string;
};

type Month = "January" | "February" | "March" | "April" | "May" | "June" | "July" | "August" | "September" | "October" | "November" | "December";
type CalendarEvents = Record<Month, CalendarEvent[]>;

const Calendar = ({ events }: { events: CalendarEvents }) => {
    const [selected, setSelected] = useState(0);
    const [search, setSearch] = useState("");
    const [matches, setMatches] = useState<{ month: Month; index: number }[]>([]);
    const rowRefs = useRef<Record<string, HTMLElement | null>>({});

    useEffect(() => {
        if (!search) {
            setMatches([]);
            setSelected(0);
            return;
        }

        const lower = search.toLowerCase();
        const found: { month: Month; index: number }[] = [];

        (Object.entries(events) as [Month, CalendarEvent[]][]).forEach(([month, monthEvents]) => {
            monthEvents.forEach((event, index) => {
                if (event.activity.toLowerCase().includes(lower) || event.date.includes(lower)) {
                    found.push({ month, index });
                }
            });
        });

        setMatches(found);
        setSelected(0);
    }, [search]);

    useEffect(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let closest: { month: Month; index: number; diff: number } | null = null;

        for (const [month, monthEvents] of Object.entries(events) as [Month, CalendarEvent[]][]) {
            for (let index = 0; index < monthEvents.length; index++) {
                const event = monthEvents[index];
                const eventDate = new Date(event.date);
                eventDate.setHours(0, 0, 0, 0);

                const diff = Math.abs(eventDate.getTime() - today.getTime());

                if (!closest || diff < closest.diff) {
                    closest = { month, index, diff };
                }
            }
        }

        if (!closest) return;

        const key = `${closest.month}-${closest.index}`;
        const el = rowRefs.current[key];

        if (!el) return;
        if (typeof window === "undefined") return;

        const top = window.scrollY + el.getBoundingClientRect().top + 150;

        window.scrollTo({ top, behavior: "smooth" });
    }, []);

    const scrollToIndex = (i: number) => {
        if (i < 0 || i >= matches.length) return;

        setSelected(i);
        const { month, index } = matches[i];
        const key = `${month}-${index}`;
        const el = rowRefs.current[key];

        if (!el) return;
        if (typeof window === "undefined") return;

        const offset = -200;
        const top = window.scrollY + el.getBoundingClientRect().top + offset;

        window.scrollTo({ top, behavior: "smooth" });
    };

    return (
        <div className={`${styles.container} box`}>
            <div className={styles.search_container}>
                <div className={styles.search}>
                    <i className="fa-regular fa-search"></i>
                    <input type="search" id="search" value={search} placeholder="Search an Event" onChange={e => setSearch(e.target.value)} />
                    <i className="fa-regular fa-arrow-left" title="Previous" onClick={() => scrollToIndex(selected - 1)}></i>
                    <i className="fa-regular fa-arrow-right" title="Next" onClick={() => scrollToIndex(selected + 1)}></i>
                </div>
                <div className={styles.matches}>
                    {matches.map((m, i) => (
                        <button
                            key={`${m.month}-${m.index}`}
                            onClick={() => scrollToIndex(i)}
                            className={selected === i ? styles.selected : ""}
                        >
                            {events[m.month][m.index].activity}
                        </button>
                    ))}
                </div>
            </div>
            <div className={styles.content}>
                {(Object.entries(events) as [Month, CalendarEvent[]][]).map(([month, monthEvents]) => (
                    <div className={styles.table} key={month}>
                        <div>
                            <section>Date</section>
                            <section>Activity</section>
                        </div>
                        <div>
                            {monthEvents.map((event, index) => {
                                const key = `${month}-${index}`;
                                const isMatch = matches.some(m => m.month === month && m.index === index);
                                const isSelected = matches[selected]?.month === month && matches[selected]?.index === index;

                                const eventDate = new Date(event.date);
                                const today = new Date();

                                eventDate.setHours(0, 0, 0, 0);
                                today.setHours(0, 0, 0, 0);

                                const isOver = eventDate.getTime() < today.getTime();

                                return (
                                    <section
                                        key={index}
                                        ref={el => { rowRefs.current[key] = el }}
                                        className={`
                                                ${isMatch ? styles.highlight : ""}
                                                ${isSelected ? styles.selected : ""}
                                                ${isOver ? styles.over : ""}
                                            `}
                                    >
                                        <p>{eventDate.toDateString()}</p>
                                        <p>{event.activity}</p>
                                    </section>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Calendar