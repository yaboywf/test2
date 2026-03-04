"use client";

import { useEffect } from "react";
import { api } from "@/lib/api";
import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";
import { firebaseConfig } from "@/lib/firebase";

export default function Notifications() {
    useEffect(() => {
        async function init() {
            const permission = await Notification.requestPermission();
            if (permission !== "granted") return;

            const registration = await navigator.serviceWorker
                .register("/notifications.js")
                .catch(err => console.error("SW failed", err));

            if (!registration) return;

            await navigator.serviceWorker.ready;

            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);

            const token = await getToken(messaging, {
                vapidKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
                serviceWorkerRegistration: registration
            });

            let deviceId = localStorage.getItem("device_id");

            if (!deviceId) {
                deviceId = crypto.randomUUID();
                localStorage.setItem("device_id", deviceId);
            }

            if (!token) return;

            await api("post", "/api/notifications", { token, deviceId });
            console.log("Notifications registered");
        }

        init();
    }, []);

    return null;
}