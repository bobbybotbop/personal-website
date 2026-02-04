import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import "./globals.css"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
})

export const metadata: Metadata = {
  title: "William Chen | Full-Stack Developer | Cornell University",
  description: "William Chen - Full-stack web developer and Cornell University student based in New York. Specializing in TypeScript, React, Python, and AI integration. Portfolio showcasing full-stack applications, AI automation projects, and innovative web solutions.",
  keywords: [
    "William Chen",
    "williamchenchen",
    "full-stack developer",
    "web developer",
    "Cornell University",
    "TypeScript developer",
    "React developer",
    "Python developer",
    "New York developer",
    "software engineer",
    "AI integration",
    "full-stack applications",
    "portfolio",
    "web development",
    "frontend developer",
    "backend developer"
  ],
  authors: [{ name: "William Chen" }],
  creator: "William Chen",
  openGraph: {
    title: "William Chen | Full-Stack Developer | Cornell University",
    description: "Full-stack web developer and Cornell University student based in New York. Specializing in TypeScript, React, Python, and AI integration.",
    url: "https://yourdomain.com",
    siteName: "William Chen Portfolio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "William Chen | Full-Stack Developer",
    description: "Full-stack web developer and Cornell University student. Specializing in TypeScript, React, Python, and AI integration.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/faviconFiles/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/faviconFiles/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/faviconFiles/favicon.ico", sizes: "any" },
    ],
    apple: [
      { url: "/faviconFiles/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome-192x192",
        url: "/faviconFiles/android-chrome-192x192.png",
      },
      {
        rel: "android-chrome-512x512",
        url: "/faviconFiles/android-chrome-512x512.png",
      },
    ],
  },
  manifest: "/faviconFiles/site.webmanifest",
}

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "William Chen",
  alternateName: "williamchenchen",
  jobTitle: "Full-Stack Web Developer",
  worksFor: {
    "@type": "EducationalOrganization",
    name: "Cornell University"
  },
  alumniOf: {
    "@type": "EducationalOrganization",
    name: "Cornell University"
  },
  address: {
    "@type": "PostalAddress",
    addressLocality: "New York",
    addressRegion: "NY",
    addressCountry: "US"
  },
  email: "williambillychen@gmail.com",
  url: "https://www.linkedin.com/in/williamchenchen",
  sameAs: [
    "https://www.linkedin.com/in/williamchenchen",
    "https://github.com/bobbybotbop"
  ],
  knowsAbout: [
    "TypeScript",
    "React",
    "Python",
    "Full-Stack Development",
    "AI Integration",
    "API Integration",
    "Database Integration"
  ]
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="font-sans antialiased" suppressHydrationWarning>{children}</body>
    </html>
  )
}
