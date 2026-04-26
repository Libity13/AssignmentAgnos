'use client'

import dynamic from 'next/dynamic'

// ไม่ SSR ฟอร์ม — กันส่วนขยายเบราว์เซอร์ฉีด attribute (เช่น fdprocessedid) ก่อน hydrate
const PatientForm = dynamic(
  () => import('@/components/patient/PatientForm').then((m) => ({ default: m.PatientForm })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-blue-50 via-white to-indigo-50 text-slate-600">
        <p className="text-sm sm:text-base">กำลังโหลดฟอร์ม…</p>
      </div>
    ),
  },
)

export function PatientFormClient() {
  return <PatientForm />
}
