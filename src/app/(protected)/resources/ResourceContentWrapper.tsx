'use client'

import { useEffect, useRef, useState } from 'react'

export default function ResourceContentWrapper({ children }: { children: React.ReactNode }) {
    const [visible, setVisible] = useState(false)
    const outerRef = useRef<HTMLDivElement>(null)
    const innerRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState<number | null>(null)
    const [isOnline, setIsOnline] = useState(true)

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                const isVisible = entries[0].isIntersecting

                // If becoming hidden, capture height before unmount
                if (!isVisible && innerRef.current) {
                    setHeight(innerRef.current.offsetHeight)
                }

                setVisible(isVisible)
            },
            { threshold: 0, rootMargin: "200px 0px", }
        )

        if (outerRef.current) observer.observe(outerRef.current)

        return () => observer.disconnect()
    }, [])

    useEffect(() => {
        if (typeof window === "undefined") return;

        const updateStatus = () => setIsOnline(navigator.onLine);

        updateStatus()

        window.addEventListener('online', updateStatus)
        window.addEventListener('offline', updateStatus)

        return () => {
            window.removeEventListener('online', updateStatus)
            window.removeEventListener('offline', updateStatus)
        }
    }, [])

    useEffect(() => {
        if (!innerRef.current) return

        const resizeObserver = new ResizeObserver(() => {
            setHeight(innerRef.current?.offsetHeight ?? null)
        })

        resizeObserver.observe(innerRef.current)

        return () => resizeObserver.disconnect()
    }, [visible])

    return (
        <div ref={outerRef} style={{ height: height ? height : 'auto' }}>
            {visible && isOnline ? (
                <div ref={innerRef}>
                    {children}
                </div>
            ) : <p>Loading...</p>}
        </div>
    )
}
