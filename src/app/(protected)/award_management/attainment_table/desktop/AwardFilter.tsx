import { Fragment, useState, useEffect, useRef, Dispatch, SetStateAction } from 'react'
import styles from './awardFilter.module.scss'

type AwardsFilterProps = {
    search: string;
    rankSelected: string[];
    levelSelected: string[];
    setRankSelected: Dispatch<SetStateAction<string[]>>;
    setLevelSelected: Dispatch<SetStateAction<string[]>>;
    setSearch: (value: string) => void;
}

const levelOptions = ["Sec 1", "Sec 2", "Sec 3", "Sec 4", "Sec 5"];
const rankOptions = ["Recruit (REC)", "Private (PTE)", "Lance Corporal (LCP)", "Corporal (CPL)", "Sergeant (SGT)", "Staff Sergeant (SSG)", "Warrant Officer (WO)"];

const AwardsFilter = ({ search, rankSelected, levelSelected, setRankSelected, setLevelSelected, setSearch }: AwardsFilterProps) => {
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);

    function toggle(value: string, type: string) {
        if (type === "level") {
            setLevelSelected(prev =>
                prev.includes(value)
                    ? prev.filter(v => v !== value)
                    : [...prev, value]
            );
        } else {
            setRankSelected(prev =>
                prev.includes(value)
                    ? prev.filter(v => v !== value)
                    : [...prev, value]
            );
        }
    }

    const clearFilters = () => {
        setRankSelected(rankOptions);
        setLevelSelected(levelOptions);
        setSearch("");
    }

    return (
        <div className={styles['awards-filter']}>
            <div className={styles.search}>
                <label htmlFor="search"><i className="fa-solid fa-search"></i></label>
                <input type="search" id="search" placeholder="Search..." onChange={e => setSearch(e.target.value)} value={search} />
            </div>

            <MultiSelectDropDown label="Rank" options={rankOptions} selected={rankSelected} setSelected={(value) => toggle(value, "rank")} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />
            <MultiSelectDropDown label="Level" options={levelOptions} selected={levelSelected} setSelected={(value) => toggle(value, "level")} openDropdown={openDropdown} setOpenDropdown={setOpenDropdown} />

            <button onClick={clearFilters}>Clear</button>
        </div>
    )
}

type MultiSelectDropDownProps = {
    label: string;
    options: string[];
    selected: string[];
    setSelected: (value: string) => void;
    openDropdown: string | null;
    setOpenDropdown: (value: string | null) => void;
}

const MultiSelectDropDown = ({ label, options, selected, setSelected, openDropdown, setOpenDropdown }: MultiSelectDropDownProps) => {
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const open = openDropdown === label;
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (open && detailsRef.current) {
            const rect = detailsRef.current.getBoundingClientRect();
            setPos({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX, width: rect.width });
        }
    }, [open]);

    const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        setOpenDropdown(openDropdown === label ? null : label);
    }

    return (<>
        <details ref={detailsRef} open={open}>
            <summary onClick={handleToggle}>{label}: {selected.length === options.length ? "All" : `${selected.length} selected`}</summary>
        </details>

        <div className={styles.dropdown} style={{ top: pos.top, left: pos.left, display: open ? "flex" : "none" }}>
            {options.map(o => (
                <Fragment key={o}>
                    <input type="checkbox" checked={!selected.includes(o)} id={o} onChange={() => setSelected(o)} />
                    <label htmlFor={o}>{o}</label>
                </Fragment>
            ))}
        </div>
    </>)
}

export default AwardsFilter