import type { ReactNode } from 'react'
import Navbar from '@/components/navbar/navbar'
import './globals.css'

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-900">
        <Navbar />
        {children}
      </body>
    </html>
  )
}
