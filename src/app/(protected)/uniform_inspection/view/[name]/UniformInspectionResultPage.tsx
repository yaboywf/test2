'use client'

import { useState, useMemo, Fragment } from 'react'
import styles from './uniformInspectionResultPage.module.scss'
import { UniformCategory } from '@/types/inspection'
import { NormalisedAccount } from '@/types/accounts'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

type UniformInspectionResultPageProps = {
	name: string;
	inspections: Record<string, any[]>;
	users: NormalisedAccount[];
	components: { field_id: string; score: number }[];
	fullComponents: UniformCategory[];
}

const UniformInspectionResultPage = ({ name, inspections, users, components, fullComponents }: UniformInspectionResultPageProps) => {
	const maxScore = components.reduce((acc, component) => acc + component.score, 0);
	const router = useRouter();

	const groupedInspections = useMemo(() => {
		const allInspections = Object.values(inspections).flat();

		return allInspections.reduce((acc: Record<string, any[]>, inspection: any) => {
			const date = new Date(inspection.inspection_date).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' });
			if (!acc[date]) acc[date] = [];

			const score = components.find(component => component.field_id === inspection.field_id)?.score;
			acc[date].push({ ...inspection, score });
			return acc;
		}, {});
	}, [inspections, components])

	const [currentInspection, setCurrentInspection] = useState(Object.keys(groupedInspections)[0]);
	const [currentSection, setCurrentSection] = useState(fullComponents[0].id);
	const { watch } = useForm({ defaultValues: groupedInspections });
	const form = watch();

	return (
		<div className={styles.results}>
			<h2>Uniform Inspection Results of {name}</h2>

			<div className={styles.inspections}>
				<h3>Inspections</h3>
				<button className={styles.back} onClick={() => router.push('/uniform_inspection')}>
					<i className='fa-solid fa-arrow-left'></i>
					Back to List
				</button>
				{!currentInspection && <p>No inspections found</p>}
				{Object.entries(groupedInspections).reverse().map(([date, inspection]) => {
					const assessor = users.find(user => user.email === inspection[0].inspected_by);

					return (
						<Fragment key={date}>
							<input
								type='radio'
								name='inspection-select'
								id={date}
								value={date}
								checked={currentInspection === date}
								onChange={() => setCurrentInspection(date)}
							/>
							<label htmlFor={date}>
								<span>{date}</span>
								<span>{assessor?.rank ?? assessor?.honorific} {assessor?.name}</span>
								<span>{String(inspection.reduce((acc, field) => acc + field.score, 0)).padStart(2, '0')}/{maxScore}</span>
							</label>
						</Fragment>
					)
				})}
			</div>

			<div className={styles.sections}>
				<h3>Sections</h3>
				{!currentInspection && <p>Please select an inspection</p>}
				{currentInspection && fullComponents.map(component => (
					<Fragment key={component.id}>
						<input type='radio' name='section-select' id={component.id} checked={currentSection === component.id} onChange={() => setCurrentSection(component.id)} />
						<label htmlFor={component.id}>
							<span>{component.component_name}</span>
						</label>
					</Fragment>
				))}
			</div>

			<div className={styles.fields}>
				<h3>Fields</h3>
				{!currentSection && <p>Please select a section</p>}
				{currentSection && fullComponents.find(component => component.id === currentSection)?.components_fields.map((field, index) => (
					<Fragment key={`${currentSection}-field${index}`}>
						<input
							type='checkbox'
							readOnly
							className={field.field_description.includes("Missing") || field.field_description.includes("None of the criterias") ? styles.missing : ""}
							id={`${currentSection}-field${index}`}
							checked={form[currentInspection]?.some((f: any) => f.field_id === field.id)}
						/>
						<label htmlFor={`${currentSection}-field${index}`}>{field.field_description}</label>
					</Fragment>
				))}
				{currentSection && <h3>Remarks</h3>}
				{currentSection && <textarea
					value={form[currentInspection]?.find((f: any) => f.section_id === currentSection)?.remarks ?? ''}
					readOnly
					placeholder='No remarks given'
				/>}
			</div>
		</div >
	)
}

export default UniformInspectionResultPage