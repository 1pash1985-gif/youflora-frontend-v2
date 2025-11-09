import type { Metadata } from "next"
import "./globals.css"
import Header from "@/components/Header"

export const metadata: Metadata = {
  title: "YouFlora B2B",
  description: "Маркетплейс цветов для юрлиц: от 1 коробки",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <Header />
        <main className="container-app py-6">{children}</main>
      </body>
    </html>
  )
}
