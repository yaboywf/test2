'use client'

import dynamic from 'next/dynamic';
const Map = dynamic(() => import('@/components/Map'), { ssr: false });
import styles from './targetResource.module.scss'

export default function BBInternational() {
    return (
        <>
            <ul>
                <li>Today, the BB in Singapore celebrates over 90 years in Singapore, with about 6,000 members and 1,000 Officers in Singapore</li>
                <li>Internationally, the BB is present in around 60 countries, with 700,000 members worldwide. The BB can be found in all Commonwealth countries, and in many Asian countries such as Singapore, Thailand and Hong Kong. The life of Companies everywhere follows some basic principles, with variations in uniform and activities to suit local conditions and culture</li>
            </ul>
            <Map />

            <h4>BB Day</h4>
            <p>BB members go to school in BB uniform on 12 January, which commemorates our founding in Singapore.</p>

            <h4>BB Handshake</h4>
            <p>A unique hand shake shared by BB members worldwide</p>
            <img src='/others/handshake.png' alt="BB Handshake" className={styles['custom-image-250']} width={0} height={0} sizes="250px" />
        </>
    )
}