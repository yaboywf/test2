"use client";

import { useEffect } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import { getApp } from "firebase/app";
import { showMessage } from "@/lib/message";

export default function NotificationContainer() {
    useEffect(() => {
        const messaging = getMessaging(getApp());

        const unsubscribe = onMessage(messaging, (payload) => {
            console.log("Foreground message:", payload);
            showMessage(`${payload.data?.title}: ${payload.data?.body}`, 'success')
        });

        return () => unsubscribe();
    }, []);

    return null;
}