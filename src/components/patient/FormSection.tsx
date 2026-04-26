import React from 'react'

type Props = {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}

export function FormSection({ title, icon, children }: Props) {
  return (
    <div className="rounded-lg bg-gray-50 p-4 sm:p-6">
      <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900 sm:mb-4 sm:text-xl">
        {icon ? <span className="inline-flex shrink-0">{icon}</span> : null}
        {title}
      </h2>
      {children}
    </div>
  )
}
