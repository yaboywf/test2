'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { showMessage } from '@/lib/message'
import styles from './uniformInspectionForm.module.scss'
import { StepIndicator, StepConnector } from '@/components/Step'
import stepStyles from '@/components/step.module.scss'
import { NormalisedAccount, BoyAccount } from '@/types/accounts'
import BoySelector from './BoySelector'
import Form from './Form'
import { UniformCategory, UniformInspectionFormValues } from '@/types/inspection'

type UniformInspectionFormProps = {
	users: NormalisedAccount[]
	components: UniformCategory[]
	onSubmit: (data: UniformInspectionFormValues) => Promise<void>
}

type Step = 1 | 2 | 3;

const UniformInspectionForm = ({ users, components, onSubmit }: UniformInspectionFormProps) => {
	const router = useRouter();
	const [boys, setBoys] = useState<BoyAccount[]>([]);
	const [inspectionData, setInspectionData] = useState<UniformInspectionFormValues | null>(null);
	const [currentStep, setCurrentStep] = useState<Step>(1);

	const onBoysSelected = (selected: BoyAccount[]) => {
		if (selected.length === 0) return showMessage("Please select at least one boy");
		setBoys(selected);
		setCurrentStep(2);
	}

	const submitInspection = async (data: UniformInspectionFormValues) => {
		await onSubmit(data);
		setInspectionData(data);
		setCurrentStep(3);
	}

	const back = () => {
		if (window.confirm("Are you sure you want to go back? You will lose all your progress.")) {
			setInspectionData(null)
			setCurrentStep(prev => (prev - 1) as Step)
		}
	};

	return (
		<div className={styles['uniform-inspection-form']}>
			<div className={stepStyles.step_indicators}>
				<StepIndicator step={1} currentStep={currentStep} />
				<StepConnector isComplete={currentStep > 1} />
				<StepIndicator step={2} currentStep={currentStep} />
				<StepConnector isComplete={currentStep > 2} />
				<StepIndicator step={3} currentStep={currentStep} />
			</div>

			{currentStep === 1 && <BoySelector users={users} onConfirm={onBoysSelected} />}
			{currentStep === 2 && <Form boys={boys} components={components} inspectionData={inspectionData} back={back} submitInspection={submitInspection} />}
			{currentStep === 3 && <div className={styles.success}>
				<i className="fa-regular fa-check"></i>
				<p>Inspection submitted successfully</p>
				<button onClick={() => router.push('/uniform_inspection')}>Back to List</button>
			</div>}
		</div>
	)
}

export default UniformInspectionForm