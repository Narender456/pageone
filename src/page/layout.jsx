import React from "react"
import { Inter } from "next/font/google"
import "./index.css"
import { ThemeProvider } from "../../theme-provider"
import { AuthProvider } from "./lib/auth-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Admin Dashboard",
  description: "A modern admin dashboard built with Next.js and shadcn/ui",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
