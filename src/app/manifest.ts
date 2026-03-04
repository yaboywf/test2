import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "The Boys' Brigade 21st Singapore Company Portal",
		short_name: "BB 21st Portal",
		start_url: "/",
		display: "fullscreen",
		background_color: "#ffffff",
		theme_color: "#ffffff",
		icons: [
			{
				src: "/bb-crest-192.png",
				sizes: "192x192",
				type: "image/png"
			},
			{
				src: "/bb-crest-512.png",
				sizes: "512x512",
				type: "image/png"
			}
		]
	}
}