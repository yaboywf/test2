import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: "https://bb21coy-v3.dylanyeowf.workers.dev",
            lastModified: new Date(),
            changeFrequency: "monthly",
            priority: 1,
        },
    ];
}