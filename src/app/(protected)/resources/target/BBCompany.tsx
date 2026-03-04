'use client';

import styles from "./targetResource.module.scss";

export default function BBCompany() {
    const rankCount = [1, 2, 3, 4, 4];
    const rankNames = ["Lance Corporal (LCP)", "Corporal (CPL)", "Sergeant (SGT)", "Staff Sergeant (SSG)", "Warrant Officer (WO)"];

    return (
        <>
            <div className={styles.table} style={{ gridTemplateColumns: "minmax(120px, 200px) 1fr" }} data-nomobile>
                <div>
                    <p>Role</p>
                    <p>Description</p>
                </div>
                <div>
                    <p>Non-Commissioned Officer (NCO)</p>
                    <section data-left>
                        <p>It is a great honour for a Boy to be promoted to the rank of a NCO<br /><br />A NCO should at all time set an example of enthusiasm and right living to other Boys such as through regular attendance, punctuality and orderliness</p>
                        <p>Roles of an NCO:</p>
                        <ul>
                            <li>To assist Officers with the running of company activities</li>
                            <li>Manage a squad of Boys</li>
                            <li>Teach and lead younger Boys</li>
                            <li>Be a role model for younger Boys</li>
                            <li>Improve communication between Officers and younger Boys</li>
                            <li>Look out for the welfare of Boys</li>
                        </ul>
                    </section>
                </div>
                <div>
                    <p>Squads</p>
                    <section data-left>
                        <p>Boys in a Company are divided into squads, the basic units of a BB Company.</p>
                        <p>Each squad has an appointed Squad Leader, who puts welfare of the Squad members before his own, always leading by example in his service and conduct.</p>
                        <ul>
                            <li>Help Officers in running and organizing the Company</li>
                            <li>Look into the welfare, attendance, conduct and smartness of his squad members</li>
                            <li>Pass along information to squad members and channel feedback from the Boys to the Officers</li>
                            <li>Coach and guide his squad members</li>
                            <li>Build up teamwork and friendship among squad members</li>
                            <li>Follow up on absentees to find out how they are doing and encourage them to return</li>
                        </ul>
                    </section>
                </div>
                <div>
                    <p>Squad Members</p>
                    <section data-left>
                        <p>Roles of a Squad Member:</p>
                        <ul>
                            <li>Be supportive of the Squad Leader</li>
                            <li>Be punctual for squad and BB activities</li>
                            <li>Support and participate in squad activities</li>
                            <li>Contribute your time, talents and ideas to your squad</li>
                            <li>Have an attitude of serving and helping other squad members</li>
                            <li>If you know of a squad member who is facing a problem that neither he nor you can solve, share this with your Officer</li>
                        </ul>
                    </section>
                </div>
            </div>

            <h4>Ranks for Boys</h4>
            <div className={styles['ranks-list']}>
                <div className={styles['rank-item']}>Recuit (REC)</div>
                <div className={styles['rank-item']}>Private (PTE)</div>
                {rankCount.map((rank, index) => (
                    <div key={index} className={styles['rank-item']}>
                        <div className={styles.rank}>
                            {Array.from({ length: rank }).map((_, i) => (
                                <img key={i} src="/others/rank-stripe.png" width={100} height={100} alt={`Rank ${index + 1}`} />
                            ))}
                        </div>
                        <p>{rankNames[index]}</p>
                    </div>
                ))}
            </div>

            <h4>Promotion</h4>
            <p>Promotion is affected by attendance, participation, leadership and attitude of a Boy</p>
            <div className={styles['promotion-container']}>
                <div className={styles['promotion-list']}>
                    {["Recuit (REC)", "Private (PTE)"].map((rank, index) => (
                        <div className={styles['promotion-item']} key={index}>
                            <span></span>
                            <p>{rank}</p>
                        </div>
                    ))}
                    {rankNames.map((rank, index) => (
                        <div className={styles['promotion-item']} key={index}>
                            <span></span>
                            <p>{rank}</p>
                        </div>
                    ))}
                </div>

                {Array.from({ length: 4 }).map((_, index) => (
                    <div className={styles[`sec${index + 1}-promotion`]} key={index}></div>
                ))}

                <div className='sec1-promotion'></div>
                <div className='sec2-promotion'></div>
                <div className='sec3-promotion'></div>
                <div className='sec4-promotion'></div>
            </div>

            <h4>Concept of Company</h4>
            <div className={styles.table} style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
                <div>
                    <p>Sponsoring Body</p>
                    <p>Officers' Council</p>
                    <p>NCO Council</p>
                    <p>Squad System</p>
                </div>
                <div>
                    <ul>
                        <li>School</li>
                        <li>Church</li>
                    </ul>
                    <ul>
                        <li>BB Officers</li>
                        <li>BB Teachers in Charge</li>
                    </ul>
                    <ul>
                        <li>Company Sergeant Major (CSM)</li>
                        <li>Boys - NCO</li>
                    </ul>
                    <ul>
                        <li>Squad Leaders</li>
                        <li>All Boys</li>
                    </ul>
                </div>
            </div>
        </>
    )
}