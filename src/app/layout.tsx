import type { Metadata } from "next";
import Script from "next/script";
// import MessageProvider from "@/components/MessageProvider";
import "@/styles/globals.scss";
import "@/styles/icons.scss";
import "@/styles/googleTranslate.scss";
// import CookieBanner from "@/components/CookieBanner";

const structuredData = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: "BB 21st Portal",
	url: "https://bb21coy-v3.dylanyeowf.workers.dev",
	logo: "https://bb21coy-v3.dylanyeowf.workers.dev/favicon.ico",
	sameAs: [
		"https://github.com/bb21coy",
		"https://github.com/The-Boys-Brigade-21st-Company/",
		"https://www.instagram.com/bb21coy/",
		"https://www.geylangmethodistsec.moe.edu.sg/cca/ugs/boys-brigade/"
	]
}

export const metadata: Metadata = {
	title: "BB 21st Portal",
	description: "BB 21st Portal is a platform for Officers, Primers, and Boys of the Boys’ Brigade 21st Singapore Company. It streamlines tasks like parade notices, attendance, awards tracking, uniform inspections, and generating 32A results, reducing paperwork and improving efficiency.",
	applicationName: "BB 21st Portal",
	metadataBase: new URL("https://bb21coy-v3.dylanyeowf.workers.dev"),
	alternates: {
		canonical: "/",
	},

	openGraph: {
		title: "BB 21st Portal",
		description: "Streamline BB 21st admin with tools for parade notices, attendance, awards, inspections, and 32A results. Built for Officers, Primers, and Boys.",
		url: "https://bb21coy-v3.dylanyeowf.workers.dev",
		siteName: "BB 21st Portal",
		locale: "en_SG",
		type: "website",
		images: [
			{
				url: "/bb-banner-2.webp",
				width: 1200,
				height: 630,
				alt: "BB 21st Portal preview",
			},
		],
	},

	twitter: {
		card: "summary_large_image",
		title: "BB 21st Portal",
		description: "Admin portal for BB 21st: manage parades, attendance, awards, inspections, and 32A results in one place.",
		images: ["/bb-banner-2.webp"],
	},

	icons: {
		icon: "/favicon.ico",
		apple: [
			{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }
		],
	},

	verification: {
		google: "aZvLu8S3x7OBSpS1rCeypfVjZLyTr-MbxXLKM665XIs",
	},

	authors: [
		{ name: "Bryan Lee" },
		{ name: "Geng Yue" },
		{ name: "Dylan Yeo" },
	],

	keywords: [
		"BB 21st Singapore",
		"Boys Brigade 21st Company",
		"BB21coy",
		"Boys Brigade Geylang Methodist",
		"BB 21st Admin System",
		"Parade management system",
		"CCA attendance tracking",
		"Award tracking system",
		"Uniform inspection system",
		"32A report generation",
		"BB admin system",
		"Boys Brigade admin system",
		"BB 21st admin system",
		"Boys Brigade 21st admin system",
	],

	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "BB 21st Portal",
	},
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					type="application/ld+json"
					dangerouslySetInnerHTML={{
						__html: JSON.stringify(structuredData),
					}}
				/>
				<Script
					id="google-translate"
					strategy="afterInteractive"
					src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
				/>
				{/* <Script id="google-translate-init" strategy="afterInteractive">
					{`
						if (typeof window !== 'undefined') {
							window.googleTranslateElementInit = function () {
								if (window.__gt_initialized) return;
								window.__gt_initialized = true;

								new google.translate.TranslateElement(
									{
										pageLanguage: "en",
										includedLanguages: "en,zh-CN,ms,ta",
										autoDisplay: false
									},
									"google_translate_element"
								);
							};
						}
					`}
				</Script> */}
			</head>
			<body className={`antialiased`}>
				{/* <MessageProvider /> */}
				{/* <CookieBanner /> */}
				{children}
			</body>
		</html>
	);
}
