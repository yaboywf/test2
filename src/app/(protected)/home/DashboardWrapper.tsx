"use client"

import TourWrapper from "@/components/TourWrapper";
import { StepType } from "@reactour/tour";
import DashboardPage from "./Dashboard";
import { NormalisedAccount } from "@/types/accounts";

type DashboardPageWrapperProps = {
    user: Partial<NormalisedAccount>
}

const steps: StepType[] = [
    {
        position: "center",
        selector: "body",
        content: "Welcome to BB 21st Portal! This is the dashboard."
    },
    {
        position: "center",
        selector: "[data-tour='routes']",
        content: "Here are all the pages of the website that you have access to. Click on any of these to navigate to the respective pages."
    },
    {
        position: "center",
        selector: "[data-tour='pending-tasks']",
        content: "Here are the pending tasks that you need to complete."
    }
]

export default function DashboardPageWrapper({ user }: DashboardPageWrapperProps) {
    return (
        <TourWrapper steps={steps}>
            <DashboardPage user={user} />
        </TourWrapper>
    )
}