'use client';

import dynamic from 'next/dynamic';

const Notifications = dynamic(() => import('./NotificationProvider'), { ssr: false });

export default function DynamicNotifications() {
    return <Notifications />;
}
