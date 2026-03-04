'use client'

import styles from './targetResource.module.scss'

export default function BBVesper() {
    return (
        <div className={styles.table}>
            <div>
                <p>BB Vesper</p>
                <p>Table Grace</p>
            </div>

            <div>
                <p className={styles.center}>
                    Great God Who knowest all our need,<br />
                    Bless Thou our watch, and guard our sleep;<br />
                    Forgive our sins of thought and deed,<br />
                    And in Thy peace Thy servants keep.<br />
                    <br />
                    We thank Thee for the day that’s done,<br />
                    We trust Thee for the days to be;<br />
                    Thy love we learn in Christ Thy Son,<br />
                    O May we all His glory see!<br />
                </p>

                <p className={styles.center}>
                    Be present at our table Lord<br />
                    Be here and everywhere adored<br />
                    These mercies bless and grant that we<br />
                    May feast in fellowship with Thee<br />
                </p>
            </div>
        </div>
    )
}