import { useRouter } from "next/navigation";
import styles from './dashboardPage.module.scss'

interface DashboardOptionsProps {
    title: string;
    url?: string | null;
    icon?: string | null;
    image?: string | null;
    func?: (() => void) | null;
    color?: string;
    description?: string;
}

const DashboardOptions = ({ title='', url=null, icon=null, image=null, func=null, color="000000", description="" } : DashboardOptionsProps) => {
    const router = useRouter();

    return (
        <div className={styles.route} style={{ '--color': `#${color}` } as React.CSSProperties} onClick={url ? () => router.push(url) : func || undefined}>
            <div>
                {image ? <div /> : <i className={ `fa-regular fa-${icon}` }></i>}
            </div>
            <p>{title}</p>
            <p>{description}</p>
        </div>
    )
}

export default DashboardOptions