
import "./globals.css"
import { Metadata, Viewport } from "next"
import { Nunito } from "next/font/google"
import RegisterSW from "@/components/RegisterSW"

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"] })

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
    themeColor: "#7EB5A8",
}

export const metadata: Metadata = {
    title: "Pixly",
    description: "Comparte tus fotos y momentos favoritos en familia con Pixly",
    manifest: "/manifest.json",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/icons/icon-192x192.png",
    },
    appleWebApp: {
        capable: true,
        statusBarStyle: "black-translucent",
        title: "Pixly",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={nunito.className}>
                <RegisterSW />
                {children}
            </body>
        </html>
    )
}
