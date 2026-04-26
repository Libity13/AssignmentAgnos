'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navbar() {
  const path = usePathname()

  const items = [
    { label: 'หน้าแรก', href: '/' },
    { label: 'Staff', href: '/staff' },
    { label: 'Patient', href: '/patient' },
  ]

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-blue-600 to-indigo-600 text-base font-bold text-white sm:h-11 sm:w-11 sm:text-lg">
            A
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">Agnos Clinic</p>
            <p className="text-xs text-slate-500">demo realtime</p>
          </div>
        </div>

        <nav className="flex flex-wrap gap-1 rounded-full bg-slate-100 p-1 sm:justify-end">
          {items.map((item) => {
            const active = path === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={
                  'rounded-full px-3 py-2 text-xs font-medium sm:px-4 sm:text-sm ' +
                  (active
                    ? 'bg-linear-to-r from-blue-500 to-indigo-600 text-white'
                    : 'text-slate-700 hover:bg-white')
                }
              >
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
