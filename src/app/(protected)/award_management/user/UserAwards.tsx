'use client';

import { useState, useEffect, useMemo, Fragment } from 'react'
import styles from './userAwardsPage.module.scss'
import { Badge, Attainment, SpecialAwards } from '@/types/awards'
import '@/app/login/logInPage.module.scss'
import SemiCircleProgress from '@/components/SemiCircleProgressBar';

type UserAwardsProps = {
    awards: Badge[]
    attainments: Attainment[]
}

type Section = {
    title: string
    items: string[]
}

type SAProgress = {
    label: string
    achieved: boolean
}[]

const milestoneOverrides = {
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
};

const titleCase = (s: string) => s.replace(/(^|[^a-zA-Z'])[a-z]/g, (c) => c.toUpperCase())

const UserAwards = ({ awards, attainments }: UserAwardsProps) => {
    const normalisedAttainments = useMemo(
        () => attainments.map(a => `${a.badge_id}-BB21-${a.mastery_id || a.misc}`),
        [attainments]
    )

    const specialAwards = useMemo(() => ([
        { match: "founder's award", display: "Founder's Award" },
        { match: "senior proficiency award", display: "Senior Proficiency Award (SPA)" },
        { match: "intermediary proficiency award", display: "Intermediary Proficiency Award (IPA)" },
    ]), [])

    const sections: Section[] = useMemo(() => {
        const chevronHead = [
            "1 year service (first year)",
            "1 year service (second year)",
            "1 year service (third year)",
            "target",
        ];

        const chevronTail = [
            "3 year service",
            "leadership",
            "national event",
        ];

        const pocket = [
            "total defence",
            "link badge",
        ];

        const excludeKeywords = [
            "1 year service",
            "3 year service",
            "leadership",
            "national event",
            "target",
            "link badge",
            "total defence",
        ];

        const otherChevron = awards
            .map(a => a.badge_name)
            .filter(name => {
                const n = name.toLowerCase();
                const excluded = excludeKeywords.some(k => n.includes(k));
                const isSpecial = specialAwards.some(s => n.includes(s.match));
                return !excluded && !isSpecial;
            })
            .sort((a, b) => a.localeCompare(b));

        const chevron = [
            ...chevronHead,
            ...otherChevron,
            ...chevronTail,
        ];

        const special = specialAwards.map(s => s.display);

        return [
            { title: "Chevron", items: chevron },
            { title: "Left breast pocket", items: pocket },
            { title: "Special awards", items: special },
        ];
    }, [awards, specialAwards]);

    const groupedAwards = useMemo(() => {
        const groups: Record<"personal" | SpecialAwards, Badge[]> = {
            personal: [],
            ipa: [],
            spa: [],
            founders: [],
        };

        for (const award of awards) {
            for (const category of award.badge_categories) {
                if (!(category in groups)) continue;
                groups[category as keyof typeof groups].push(award);
            }
        }

        return groups;
    }, [awards])

    const electivePoints = useMemo(() => {
        let total: number = 0;
        const electiveBadgesAttained: Record<string, number> = {};

        for (const attainment of normalisedAttainments) {
            const masteryId = attainment.split("-BB21-")[1];

            for (const badge of groupedAwards.personal) {
                const isFilteredBadge = badge.badge_name === "Adventure" || badge.badge_name === "Drill";

                for (const mastery of badge.masteries) {
                    if (mastery.id !== masteryId) continue;
                    if (isFilteredBadge && mastery.mastery_name === "Basic") continue;

                    total += mastery.mastery_name === "Advanced" ? 2 : 1;
                    electiveBadgesAttained[`${badge.badge_name} (${mastery.mastery_name})`] = mastery.mastery_name === "Advanced" ? 2 : 1;
                }
            }
        }

        const sortedElectiveBadgesAttained = Object.entries(electiveBadgesAttained).sort((a, b) => b[0].localeCompare(a[0]));
        return { total, electiveBadgesAttained: sortedElectiveBadgesAttained };
    }, [awards, groupedAwards]);

    const specialAwardsProgress = useMemo(() => {
        const awardProgress: Record<SpecialAwards, SAProgress> = {
            founders: [],
            spa: [],
            ipa: [],
        }

        const electivePointsRequirement = {
            ipa: 1,
            spa: 4,
            founders: 6,
        };

        for (const category of Object.keys(awardProgress) as SpecialAwards[]) {
            const badges = groupedAwards[category];
            const overrides = milestoneOverrides[category];
            const fixedRequirement = electivePointsRequirement[category];

            awardProgress[category].push({
                label: `${fixedRequirement} Elective Point(s)`,
                achieved: electivePoints.total >= fixedRequirement,
            })

            for (const badge of badges) {
                if (!overrides[badge.badge_name as keyof typeof overrides]) {
                    const achieved = normalisedAttainments.includes(`${badge.id}-BB21-null`)

                    awardProgress[category].push({
                        label: badge.badge_name,
                        achieved,
                    })
                } else {
                    const override = overrides[badge.badge_name as keyof typeof overrides];
                    for (const masteryName of override) {
                        const mastery = badge.masteries.find(m => m.mastery_name === masteryName);
                        if (!mastery) continue;
                        const achieved = normalisedAttainments.includes(`${badge.id}-BB21-${mastery.id}`)

                        awardProgress[category].push({
                            label: `${badge.badge_name} (${masteryName})`,
                            achieved,
                        })
                    }
                }
            }
        }

        return awardProgress;
    }, [awards, groupedAwards, electivePoints])

    const resolveAward = (label: string) => {
        const key = label.toLowerCase().split("(")[0].trim()
        return awards.find(a => a.badge_name.toLowerCase().trim() === key)
    }

    const resolveImageFile = (label: string, award?: Badge) => {
        const lower = label.toLowerCase()

        if (lower.includes("1 year service")) return "1-year-service-badge.webp"
        if (lower.includes("3 year service")) return "3-year-service-badge.webp"
        if (lower.includes("total defence")) return "total-defence-badge.webp"
        if (lower.includes("link badge")) return "link-badge-badge.webp"
        if (lower.includes("proficiency") || lower.includes("founder")) return `${titleCase(label).toLowerCase().replaceAll(" ", "-")}-badge.webp`

        if (award) return `${award.badge_name.toLowerCase().replaceAll(" ", "-")}-badge.webp`
        return "1-year-service-badge.webp"
    }

    return (
        <div className={styles.user_awards}>
            <h2>My Awards</h2>

            <div className={styles.progress_row}>
                <div className={styles.stat_container}>
                    <p className={styles.meta}>Personal Mastery</p>
                    <p className={styles.points}>{electivePoints.total} points earned</p>
                    <div>
                        {electivePoints.electiveBadgesAttained.map(([badge, points]) => (
                            <p key={badge} className={styles.tag}>{badge} | {points} point(s)</p>
                        ))}
                    </div>
                </div>
                {Object.entries(specialAwardsProgress).reverse().map(([key, value]) => {
                    const achieved = value.filter(v => v.achieved).length;

                    return (
                        <div className={styles.stat_container} key={key}>
                            <p className={styles.saTitle}>{key}</p>
                            <SemiCircleProgress value={achieved} max={value.length} size={140} stroke={12} />
                            <div>
                                {value.map((v, i) => <p key={i} className={`${styles.meta} ${v.achieved ? styles.achieved : ''}`}>{v.label}</p>)}
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className={`tip ${styles.tip}`}>The order of the badges here are the same order you should wear them on your uniform</div>

            {sections.map(section => (
                <div key={section.title} className={styles.section}>
                    <h3 className={styles.sectionTitle}>{section.title}</h3>

                    <div className={styles.awards_list}>
                        {section.items.map(o => {
                            const award = resolveAward(o)
                            const awardName = titleCase(o)
                            const imageFile = resolveImageFile(o, award)

                            return (
                                <div key={`${section.title}-${o}`} className={`${styles.award} award`}>
                                    <img src={`/badges/${imageFile}`} alt={o} />

                                    <div>
                                        <h3>{awardName}</h3>

                                        {(award?.masteries?.length ? award.masteries : [{ mastery_name: "", id: null as any, misc: null as any }]).map((mastery, index) => {
                                            let masteryKey = "";
                                            const lower = o.toLowerCase();

                                            if (lower.includes("1 year service")) {
                                                const year = lower.includes("second") ? 2 : lower.includes("third") ? 3 : 1;
                                                masteryKey = `${award?.id}-BB21-year${year}`;
                                            }
                                            else if (!award?.masteries?.length) masteryKey = `${award?.id}-BB21-null`;
                                            else masteryKey = `${award?.id}-BB21-${(mastery as any).id}`;

                                            return (
                                                <Fragment key={`${award?.badge_name || o}-${(mastery as any).mastery_name || "na"}`}>
                                                    <input
                                                        type="checkbox"
                                                        onChange={() => { }}
                                                        checked={award ? normalisedAttainments.includes(masteryKey) : false}
                                                        id={masteryKey}
                                                    />
                                                    <p>{(mastery as any).mastery_name}</p>
                                                </Fragment>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}

export default UserAwards