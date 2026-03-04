'use client'

import styles from './targetResource.module.scss'

export default function BBUniform() {
    return (
        <>
            <img src='/others/uniforms.png' width={800} height={600} alt="Uniform" />

            <div className={styles.table} style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <div>
                    <p>Metal Parts</p>
                    <p>Fabric Material</p>
                    <p>Leather Parts</p>
                    <p>Personal Grooming</p>
                </div>

                <div>
                    <ul>
                        <li>Cap badge, badges, haversack loop, slide, button hole and belt buckle should be shiny and free from rust, stains and mould</li>
                    </ul>
                    <ul>
                        <li>Frayed thread should be trimmed.</li>
                        <li>All fabric should be kept clean and free from stains (e.g. field service cap, uniform).</li>
                        <li>Uniform shirt and pants should be ironed and free from creases</li>
                    </ul>
                    <ul>
                        <li>Shoes are to be kept clean and black via the use of shoe shine.</li>
                        <li>Belt and crossbelt can be lightly oiled with mink oil</li>
                    </ul>
                    <ul>
                        <li>Haircut should be neat, should not cover ears and eyebrows, should be above the collar at the back.</li>
                        <li>No artificial colouration of hair is allowed.</li>
                        <li>Fingernails should be kept short and clean.</li>
                        <li>Body ornaments should not be worn.</li>
                    </ul>
                </div>
            </div>

            <div className={styles.tip}>
                Want to know how to wear the uniform? <a href="https://www.youtube.com/watch?v=p8zy-NYHxwQ" target="_blank">Watch this video</a>
            </div>

            <div className={styles.badges}>
                <img src='/others/badges.png' width={800} height={600} alt="Justin's Badges" className={styles['custom-image-250']} />
                <p>Wear badges correctly and in the right order. Place proficiency badges in alphabetical order, with no more than five per row. Put the target badge first in the top line of proficiency badges.</p>
            </div>
        </>
    )
}