import { Fragment, useState } from "react";
import styles from "./uploadFile.module.scss";
import styles1 from "../attainment_table/mobile/awardAttainmentTable.module.scss"

type SummaryProps = {
    data: Record<string, Record<string, Record<string, boolean>>>;
    setData: React.Dispatch<React.SetStateAction<Record<string, Record<string, Record<string, boolean>>>>>;
    checkMergeIssues: () => void;
    setCurrentStep: React.Dispatch<React.SetStateAction<number>>;
}

const Summary = ({ data, setData, checkMergeIssues, setCurrentStep }: SummaryProps) => {
    const [openCards, setOpenCards] = useState<string[]>([]);

    return (
        <div className={styles.summary}>
            <div className={styles.header}>
                <h3>Uploaded Data:</h3>
                <button onClick={() => { setData({}); setCurrentStep(1); }} className={styles.button}>
                    <i className="fa-regular fa-arrow-left"></i>
                    Back
                </button>
            </div>

            {Object.entries(data).map(([boy, badgeMap]) => (
                <div key={boy} className={styles1.boy}>
                    <div>
                        <p>{boy}</p>
                        <i className="fa-regular fa-chevron-down" style={{ rotate: openCards.includes(boy) ? "180deg" : "0deg" }} onClick={() => setOpenCards(prev => prev.includes(boy) ? prev.filter(b => b !== boy) : [...prev, boy])}></i>
                    </div>
                    <div className={`${styles1.boy_content} ${styles.boy_content} ${openCards.includes(boy) ? styles.open : ""}`}>
                        {Object.entries(badgeMap).map(([badge, masteryMap]) => (
                            <Fragment key={`${boy}-${badge}`}>
                                <section className={`${styles1.award} ${styles.award}`} key={`${boy}-${badge}`}>
									<p>{badge}</p>
									{Object.keys(masteryMap).length === 1 ? (
										<input
											className={styles.fixed_requirement}
											id={`${boy}-${badge}-null`}
											type="checkbox"
											name="award"
											onChange={() => {}}
											checked={Object.values(masteryMap)[0]}
										/>
									) : (
										Object.entries(masteryMap).map(([mastery, attained]) => (
											<Fragment key={mastery}>
												<input id={`${boy}-${badge}-${mastery}`} type="checkbox" name="award" onChange={() => {}} checked={attained} />
												<label htmlFor={`${boy}-${badge}-${mastery}`}>{mastery}</label>
											</Fragment>
										))
									)}
								</section>
                            </Fragment>
                        ))}
                    </div>
                </div>
            ))}

            <button onClick={checkMergeIssues} className={styles.button}>Upload</button>
        </div>
    );
};

export default Summary;