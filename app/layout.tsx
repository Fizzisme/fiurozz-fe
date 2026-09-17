import type {Metadata, Viewport} from "next";
import { Lexend_Deca, Geist_Mono } from "next/font/google";
import "./globals.css";
import * as React from "react";
import RouteProgressBar from '@/components/ui/global/route-progress-bar';
import MessageDock from '@/components/ui/messages/message-dock';
import { userService } from '@/services/user-service';
import { AuthHydrator } from '@/components/auth-hydrator';
import { ThemeProvider } from '@/components/ui/global/theme-provider';
import { Toaster } from '@/components/ui/global/sonner';
import {baseUrl} from "@/lib/constanst";



const lexendDeca = Lexend_Deca({
    subsets: ["latin"],
    weight: ["200", "300", "400", "500", "600", "700"],
});

// Backs the `--font-mono` token in globals.css, which the `font-mono` utility
// resolves to. Loaded as a variable font so 400/600/700 all come from one file.
const geistMono = Geist_Mono({
    subsets: ["latin"],
    variable: "--font-geist-mono",
});

export const metadata: Metadata = {
    metadataBase: new URL(baseUrl),

    title: {
        default: "Showcase Developer Projects & Connect Creators | Fiurozz",
        template: "%s | Fiurozz",
    },

    description:
        "Fiurozz is a modern platform to showcase developer projects, discover inspiring work, and connect with developers and designers who love building.",

    keywords: [
        "Fiurozz",
        "web project showcase",
        "developer portfolio platform",
        "web development projects",
        "web developer projects",
        "web developer portfolio",
        "personal web projects",
        "showcase personal web projects",
        "developer community",
        "connect developers and designers",
        "web creators community",
    ],

    authors: [
        {
            name: "Nguyen Le Tuan Phi",
        },
        {
            name: "Phan Dinh Phuc"
        }
    ],

    creator: "Nguyen Le Tuan Phi",

    publisher: "Fiurozz",

    robots: {
        index: true,
        follow: true,
    },

    openGraph: {
        title: "Showcase Developer Projects & Connect Creators | Fiurozz",
        description:
            "Fiurozz is a modern platform to showcase your developer projects, discover inspiring work, and connect with developers and designers who love building.",
        url: baseUrl,
        siteName: "Fiurozz",
        locale: "en_US",
        type: "website",

        images: [
            {
                url: "/og-image.png",
                width: 1200,
                height: 630,
                alt: "Fiurozz",
            },
        ],
    },

    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/apple-touch-icon.png",
    },

    alternates: {
        canonical: baseUrl,
    },
};

export const viewport: Viewport = {
    width: 'device-width',
    initialScale: 1,
};



export default async function RootLayout({
                                       children,
                                   }: Readonly<{
    children: React.ReactNode;
}>) {

    const user = await userService.getMe();

    return (
        <html lang="en" className='mdl-js' suppressHydrationWarning>
        <body
            className={`${lexendDeca.className} ${geistMono.variable} antialiased thin-scrollbar`}
        >

        <ThemeProvider attribute="class" defaultTheme='system' enableSystem>
            <AuthHydrator initialUser={user}/>
            <RouteProgressBar />
            {children}
            <MessageDock />
            <Toaster />
        </ThemeProvider>
        </body>
        </html>
    );
}
