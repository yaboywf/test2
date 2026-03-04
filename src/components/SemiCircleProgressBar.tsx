type Props = {
    value: number;     // current score
    max: number;       // max score
    size?: number;     // width
    stroke?: number;   // thickness
};

export default function SemiCircleProgress({
    value,
    max,
    size = 200,
    stroke = 15,
}: Props) {
    const radius = (size - stroke) / 2;
    const circumference = Math.PI * radius;
    const percentage = value / max;
    const dashOffset = circumference * (1 - percentage);

    return (
        <div style={{ width: size }}>
            <svg width={size} height={size / 2}>
                {/* Background */}
                <path
                    d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
                    fill="transparent"
                    stroke="#a0a7edff"
                    strokeWidth={stroke}
                />

                {/* Progress */}
                <path
                    d={`M ${stroke / 2} ${size / 2} A ${radius} ${radius} 0 0 1 ${size - stroke / 2} ${size / 2}`}
                    fill="transparent"
                    stroke="#2563eb"
                    strokeWidth={stroke}
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    strokeLinecap="round"
                />

                {/* Text */}
                <text
                    x="50%"
                    y="90%"
                    textAnchor="middle"
                    fontSize="24"
                    fontWeight="bold"
                    fill="#111827"
                >
                    {`${value}/${max}`}
                </text>
            </svg>
        </div>
    );
}
