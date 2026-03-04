'use client'

import styles from './targetResource.module.scss' 

export default function BBObject() {
    return (
        <>
            <h4>BB Object</h4>
            <p>The advancement of Christ's Kingdom among Boys, and the promotion of habits of Obedience, Reverence, Discipline, Self-respect and all that tends towards a true Christian Manliness.</p>

            <h4>BB Motto</h4>
            <p>Sure and Stedfast</p>
            <p>"which hope we have as an anchor of the soul, both Sure and Stedfast" - <i>Hebrews 6:19</i></p>

            <h4>BB Logo</h4>
            <img src='/others/bb-logo.jpg' width={0} height={0} sizes="150px" alt="BB Logo" className={styles['custom-image-150']} />
        </>
    )
}