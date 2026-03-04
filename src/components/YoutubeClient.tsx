"use client";

import { useState } from "react";
import styles from "./youtubeClient.module.scss";

type Props = {
    videoId: string;
    title?: string;
};

export default function YouTubeClient({ videoId, title }: Props) {
    const [loaded, setLoaded] = useState(false);

    return (
        <div>
            {!loaded ? (
                <div className={styles.thumbnail} style={{ backgroundImage: `url(https://img.youtube.com/vi/${videoId}/hqdefault.jpg)` }} onClick={() => setLoaded(true)}>
                    <div className={styles.playButton}>▶</div>
                </div>
            ) : (
                <iframe
                    className={styles.video}
                    src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3`}
                    title={title ?? "YouTube video"}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            )}
        </div>
    );
}
