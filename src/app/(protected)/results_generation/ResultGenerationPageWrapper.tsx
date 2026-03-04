"use client"

import ResultGenerationPage from "./ResultGenerationPage"
import { NormalisedAccount } from "@/types/accounts"
import { Badge } from "@/types/awards"
import { StepType } from "@reactour/tour"
import TourWrapper from "@/components/TourWrapper"

type ResultGenerationPageProps = {
    allUsers: NormalisedAccount[];
    awards: Badge[];
}

const steps: StepType[] = [
    {
        position: "center",
        selector: "body",
        content: "Welcome! This is the results generation page. You can generate 32A results for submission to members portal here."
    },
    {
        selector: "[data-tour='award-select']",
        content: "First, select the award you are generating results for. A mastery field will appear if the award has masteries. Do click on it to select the mastery."
    },
    {
        selector: "[data-tour='instructor-select']",
        content: "Then, select the instructor who conducted the assessment. If the instructor is not in the list, select 'Others' and enter the instructor's name."
    },
    {
        selector: "[data-tour='credentials-input']",
        content: "Enter the necessary credentials for the instructor."
    },
    {
        position: "center",
        selector: "body",
        content: "A default description will appear, but you can customize it according to the badge requirements."
    },
    {
        selector: "[data-tour='boys-list']",
        content: "Search and click on the boys to toggle their Pass/Fail status. Click once to pass the Boy, click again to fail the Boy, and click once more to unselect the Boy. You can also use the search bar to filter the boys."
    },
    {
        position: "center",
        selector: "body",
        content: "Once everything is set, click here to generate and print the results!"
    }
]

export default function ResultGenerationWrapper({ allUsers, awards }: ResultGenerationPageProps) {
    return (
        <TourWrapper steps={steps}>
            <ResultGenerationPage allUsers={allUsers} awards={awards} />
        </TourWrapper>
    )
}
