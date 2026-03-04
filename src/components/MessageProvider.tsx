"use client"

import { useEffect, useState } from "react";
import { Message, subscribeMessages } from "@/lib/message";
import styles from '@/styles/errorContainer.module.scss'

export default function MessageProvider() {
    const [messages, setMessages] = useState<Message[]>([]);

    useEffect(() => {
        return subscribeMessages(setMessages);
    }, []);

    return (
        <div className={styles.error_container}>
            {messages.map((message) => (
                <div key={message.id} className={`${styles.error} ${styles[message.type]}`}>
                    {message.text}
                </div>
            ))}
        </div>
    )
}