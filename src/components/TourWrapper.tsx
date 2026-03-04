import { TourProvider, StepType } from "@reactour/tour"

const TourWrapper = ({ children, steps }: { children: React.ReactNode, steps: StepType[] }) => {
    return (
        <TourProvider
            disableInteraction={true}
            steps={steps}
            styles={{
                popover: (base) => ({
                    ...base,
                    borderRadius: "12px",
                    padding: "16px",
                    backgroundColor: "#26284b",
                    color: "white",
                    paddingTop: "40px"
                }),
                badge: (base) => ({
                    ...base,
                    backgroundColor: "#515382ff",
                    color: "white"
                }),
                close: (base) => ({
                    ...base,
                    color: "white"
                }),
                controls: (base) => ({
                    ...base,
                    color: "white"
                })
            }}
        >
            {children}
        </TourProvider>
    )
}

export default TourWrapper