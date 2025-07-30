import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Simulasi AI Otomotif - SMK Negeri 1 Punggelan',
  description: 'Aplikasi simulasi AI untuk pembelajaran teknik otomotif dengan sensor real-time dan deteksi kesalahan berbasis AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
