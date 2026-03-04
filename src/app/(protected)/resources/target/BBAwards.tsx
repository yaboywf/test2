'use client'

import styles from './targetResource.module.scss'
import BadgeRequirements from './badgeRequirements.json'
import { Fragment } from 'react'

export default function BBAwards() {
    return (
        <>
            <p>Each badgework has three levels – Basic, Advanced, and Master, and they are categorized within 4 domains which highlight the desired qualities a Seniors Programme Boy should attain through their BB Journey</p>
            <h4>Personal Mastery</h4>
            <ul>
                <li>Core: Adventure and Drill</li>
                <li>Modular: Choose from different electives</li>
                <li>Point system:</li>
            </ul>
            <div className={styles.section}>
                <p>Basic: 1 point</p>
                <p>Advanced: 2 points</p>
                <p>Master: 3 points</p>
            </div>
            <div className={styles.table} style={{ gridTemplateColumns: "1fr" }}>
                <div>
                    <p>Personal Mastery Badges</p>
                </div>
                <div>
                    <section className={styles.badge_list}>
                        {['target', 'drummer', 'arts-&-crafts', 'athletics', 'bandsman', 'bugler', 'adventure', 'first-aid', 'gym', 'hobbies', 'kayaking', 'drill', 'piper', 'musketry', 'sailing', 'sportsman', 'swimming'].map((badge, index) => (
                            <section key={index}>
                                <img key={index} src={`/badges/${badge}-badge.webp`} width={100} height={100} alt={badge} className='custom-image-100' />
                                <p>{badge.replaceAll('-', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</p>
                            </section>
                        ))}
                    </section>
                </div>
            </div>

            {Object.entries(BadgeRequirements).map(([badge, value], index) => (
                <Fragment key={index}>
                    <h4>{badge}</h4>
                    <div className={styles.table} style={{ gridTemplateColumns: "150px 1fr" }}>
                        <div>
                            <p>Image</p>
                            <p>Attainment Criteria</p>
                        </div>
                        <div>
                            <section>
                                <img src={`/badges/${badge.replaceAll(" ", "-").toLowerCase()}-badge.webp`} width={100} height={100} alt={badge} className='custom-image-100' />
                            </section>
                            <ul>
                                {value.map((requirement, index) => (
                                    <li key={index}>{requirement}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </Fragment>
            ))}
        </>
    )
}