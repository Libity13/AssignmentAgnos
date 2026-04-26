import Link from 'next/link'

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-3 py-8 sm:px-4 sm:py-16">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 md:p-10">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">หน้าแรก</h1>
        <p className="mt-2 text-sm text-slate-600 sm:mt-3 sm:text-base">เลือกว่าจะเป็นคนไข้หรือเจ้าหน้าที่</p>

        <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:gap-4">
          <Link
            href="/patient"
            className="min-h-[48px] flex-1 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 px-4 py-3 text-center text-sm font-semibold text-white shadow sm:px-6 sm:py-4 sm:text-base"
          >
            คนไข้ — กรอกฟอร์ม
          </Link>
          <Link
            href="/staff"
            className="min-h-[48px] flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-800 sm:px-6 sm:py-4 sm:text-base"
          >
            เจ้าหน้าที่ — ดูเรียลไทม์
          </Link>
        </div>
      </div>
    </main>
  )
}
