'use client'

import styles from './targetResource.module.scss'

export default function BBSingapore() {
    return (
        <article>
            <div className={styles.section}>
                To understand the history of the BB in Singapore, we have to begin by looking at two cities: Aberdeen and Swatow.
                <br /><br />
                BB was established in both of these cities, with Aberdeen being one of the earliest cities to adopt The Boys’ Brigade. The 1st Swatow Company in China was also a mammoth company 300 strong which saw many of its members flee to Nanyang due to the communist regime. So, what does this have to do with the BB in Singapore?
            </div>
            <br />
            The link lies in these two individuals. One was James Milner Fraser, who was a member of the 23rd Aberdeen Company and an Officer in the 23rd London Company. He came to Singapore as a young architect, and was a town planner by profession. He was recognized by his BB buttonhole badge by Sergeant Quek Eng Moh, a Swatow Old Boy, who then told Fraser that the ex-Swatow stalwarts wanted to start a Boys’ Brigade Company in Singapore.
            <br /><br />
            This led to the founding of the 1st Singapore Company at Prinsep Street Presbyterian Church on 12th January 1930. When the Company was officially enrolled in August 1930 by Brigade Headquarters in London, the membership stood at 40. By 1936, the Singapore Battalion was 200 strong. However, BB activities were suspended during World War 2, which was a trying time for the Boys Brigade as some Officers and Boys lost their lives under the Japanese Occupation. Fraser himself was a prisoner of war and worked on construction of the infamous Burma railway.
            <br /><br />
            After the war, S P Chua – captain of the 1st Singapore Company – revived the Company the was joined immediately by Fraser. The Singapore Battalion continued to grow and the Brigade was also honoured to have the President of the Republic of Singapore as its Patron in 1971.
            <div className={styles.tip}>
                Want to Learn More? <a href="https://timeline.bb.org.sg/" target="_blank">Visit the BB Timeline</a>
            </div>
        </article>
    )
}