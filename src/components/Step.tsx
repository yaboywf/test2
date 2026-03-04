import styles from './step.module.scss'

type StepIndicatorProps = {
    step: number;
    currentStep: number;
}

type StepConnectorProps = {
    isComplete: boolean;
}

export const StepIndicator = ({ step, currentStep }: StepIndicatorProps) => {
    const status =
        currentStep === step
            ? "active"
            : currentStep < step
                ? "inactive"
                : "complete";

    return (
        <div className={`${styles.step_indicator} ${styles[status]}`}>
            <div className={styles.step_indicator_inner}>
                {status === "complete" ? (
                    <svg
                        className={styles.check_icon}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                        viewBox="0 0 24 24"
                    >
                        <path
                            className={styles.check_path}
                            d="M5 13l4 4L19 7"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                ) : status === "active" ? (
                    <div className={styles.active_dot} />
                ) : (
                    <span className="step-number">{step}</span>
                )}
            </div>
        </div>
    );
}

export const StepConnector = ({ isComplete }: StepConnectorProps) => {
    return (
        <div className={styles.step_connector}>
            <div
                className={`${styles.step_connector_inner} ${isComplete ? styles.complete : ""}`}
            />
        </div>
    );
}