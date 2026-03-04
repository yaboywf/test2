"use client";

import { useEffect, useRef } from "react";

export default function IntroVideo({ className }: { className?: string }) {
    const ref = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        if (typeof window === "undefined") return;
        if (!ref.current) return;

        const src = "/intro_vid/index.m3u8";

        if (ref.current.canPlayType("application/vnd.apple.mpegurl")) {
            ref.current.src = src;
            return;
        }

        import("hls.js/dist/hls.light.js").then((mod: any) => {
            const Hls = mod.default ?? mod;
            if (!Hls.isSupported()) return;
            const hls = new Hls();
            hls.loadSource(src);
            hls.attachMedia(ref.current!);
        });
    }, []);

    return (
        <video
            ref={ref}
            autoPlay
            muted
            loop
            playsInline
            className={className}
        />
    );
}