
import "./globals.css"
import { Metadata } from "next"
import { Nunito } from "next/font/google"

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700", "800"] })

export const metadata: Metadata = {
    title: "Pixly",
    description: "Comparte tus fotos y momentos favoritos en familia con Pixly",
    icons: {
        icon: "/favicon.ico",
        shortcut: "/favicon.ico",
        apple: "/favicon.ico",
    },
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="es">
            <body className={nunito.className}>{children}</body>
        </html>
    )
}
