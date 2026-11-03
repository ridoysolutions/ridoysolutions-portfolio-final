import RealtimeRefresh from "@/components/realtime-refresh";
import ScrollAnimation from "@/components/scroll-animation";
import ScrollRestoration from "@/components/scroll-restoration";
import WhatsAppChat from "@/components/whatsapp-chat";
import { getProfile, getSiteSettings } from "@/lib/content";
import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import { ReactNode } from "react";
// Next.js processes this stylesheet import; TypeScript may not resolve CSS declarations.
// @ts-ignore
import "./globals.css";

const ubuntu = Ubuntu({ weight: ["400", "500", "700"], subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

  return {
    metadataBase: siteUrl ? new URL(siteUrl) : undefined,
    title: {
      default: settings.site_title,
      template: `%s | ${settings.site_title.split("|")[0].trim()}`,
    },
    description: settings.site_description,
    keywords: [
      "Ridoy Ahmed",
      "Digital Marketer",
      "Digital Marketing Specialist",
      "Google Ads",
      "Meta Ads",
      "SEO",
      "YouTube Ads",
      "Social Media Marketing",
      "Digital Marketing Portfolio",
    ],
    applicationName: "Ridoy Ahmed Portfolio",
    alternates: siteUrl ? { canonical: siteUrl } : undefined,
    authors: [{ name: "Ridoy Ahmed" }],
    creator: "Ridoy Ahmed",
    publisher: "Ridoy Ahmed",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      siteName: "Ridoy Ahmed Portfolio",
      title: settings.site_title,
      description: settings.site_description,
      ...(siteUrl ? { url: siteUrl } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: settings.site_title,
      description: settings.site_description,
    },
    icons: {
      icon: "/favicon.ico",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const profile = await getProfile();
  return (
    <html lang="en">
      <body
        className={`${ubuntu.className} bg-background text-foreground antialiased`}
      >
        <ScrollRestoration />
        <ScrollAnimation />
        <RealtimeRefresh />
        {/* <BackToTop /> */}
        {children}
        <WhatsAppChat
          name={profile.name}
          image={profile.profile_image}
          phone={profile.whatsapp}
        />
      </body>
    </html>
  );
}
