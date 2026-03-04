import React from "react";
import styles from "./resultPage.module.scss";
import { BoyAccount, NormalisedAccount } from "@/types/accounts";
import { getSecLvl } from "@/lib/user";

type ResultPageProps = {
	badge: string;
	mastery?: string;
	instructor: string;
	boys: {
		email: string;
		result: "pass" | "fail";
	}[];
	description?: string;
	credentials?: string;
	allUsers: NormalisedAccount[];
}

const generatePDF = ({ badge, mastery, boys, instructor, description, allUsers, credentials }: ResultPageProps) => {
	const date = new Date();
	const formattedDate = date.toLocaleDateString('en-GB');
	const instructorInfo = allUsers.find(u => u.email === instructor);

	return (
		<div id={styles.template}>
			<header className={styles.header}>
				<img src="bb-crest.png" alt="Logo" width={50} height={50} />
				<div>
					<p><b>THE BOYS' BRIGADE</b></p>
					<p><b>21st SINGAPORE COMPANY</b></p>
					<p>GEYLANG METHODIST SCHOOL (SECONDARY)</p>
				</div>
				<div>
					<p>This hope we have as an anchor of the soul, a hope both</p>
					<p><strong>sure and stedfast</strong> and one which enters within the veil</p>
					<p>where Jesus has entered as a forerunner for us...</p>
					<p>Hebrews 6:19-20a</p>
				</div>
			</header>

			<p className={styles.title} style={{ textAlign: 'center', marginTop: '2%' }}>RESULTS</p>

			<div className={styles.results}>
				<p>BADGE:</p>
				<p>{badge} {mastery}</p>
				<p>DATE:</p>
				<p>{formattedDate}</p>
				<p>DESCRIPTION:</p>
				<p>{description}</p>
			</div>

			<div className={styles.table}>
				<p>No.</p>
				<p>Name</p>
				<p>Level</p>
				<p>Pass/Fail</p>

				{boys.map((account, index) => {
					const user = allUsers.find(u => u.email === account.email);
					if (!user) return null;
					return (
						<React.Fragment key={account.email}>
							<p>{index + 1}</p>
							<p>{user?.name}</p>
							<p>Sec {getSecLvl(user as BoyAccount)}</p>
							<p style={{ textTransform: "capitalize" }}>{account.result}</p>
						</React.Fragment>
					)
				})}
			</div>

			<div className={styles.signature}>
				<p>Chief Instructor/Assessor&apos;s Signature</p>
				<p>Name: {instructorInfo?.rank ?? instructorInfo?.honorific} {instructorInfo?.name}</p>
				<p>Credentials: {credentials}</p>
			</div>

			<footer>
				<p>Page | 1 of 1</p>
				<p>For 32A Submission | 2022 v1</p>
			</footer>
		</div>
	);
}

export default generatePDF