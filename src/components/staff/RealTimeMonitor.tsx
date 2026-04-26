'use client'

import {
  Cake,
  CheckCircle2,
  ClipboardList,
  Hospital,
  Home,
  Mail,
  PauseCircle,
  PenLine,
  Phone,
  User,
  UserRound,
  Users,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { PatientSession } from '@/types'
import { PatientStatus } from './PatientStatus'


const roomName = 'patient-room'

function formatTime(t: number) {
  return new Date(t).toLocaleTimeString('th-TH')
}

export function RealTimeMonitor() {
  const [patients, setPatients] = useState<Record<string, PatientSession>>({})

  useEffect(() => {
    const channel = supabase.channel(roomName)

    // คนไข้บอกสถานะ เช่น กำลังกรอก / หยุด / ส่งแล้ว
    channel.on('broadcast', { event: 'patient-status' }, ({ payload }) => {
      console.log('staff: ได้ patient-status', payload)

      setPatients((prev) => {
        const id = payload.patientId as string
        let old = prev[id]
        if (!old) {
          old = {
            id,
            status: 'active',
            data: {},
            lastActivity: payload.timestamp,
          }
        }

        const copy = { ...prev }
        copy[id] = {
          ...old,
          status: payload.status,
          lastActivity: payload.timestamp,
        }
        return copy
      })
    })

    // คนไข้ขยับเมาส์ / พิมพ์ ฯลฯ
    channel.on('broadcast', { event: 'patient-activity' }, ({ payload }) => {
      setPatients((prev) => {
        const id = payload.patientId as string
        let old = prev[id]
        if (!old) {
          old = {
            id,
            status: 'active',
            data: {},
            lastActivity: payload.timestamp,
          }
        }

        const copy = { ...prev }
        copy[id] = {
          ...old,
          status: 'active',
          lastActivity: payload.timestamp,
        }
        return copy
      })
    })

    // คนไข้อัปเดตฟอร์ม
    channel.on('broadcast', { event: 'patient-update' }, ({ payload }) => {
      console.log('staff: ได้ patient-update', payload.patientId)

      setPatients((prev) => {
        const id = payload.patientId as string
        let old = prev[id]
        if (!old) {
          old = {
            id,
            status: 'active',
            data: {},
            lastActivity: payload.timestamp,
          }
        }

        const copy = { ...prev }
        copy[id] = {
          ...old,
          data: payload.data,
          lastActivity: payload.timestamp,
        }
        return copy
      })
    })

    // คนไข้กดส่งฟอร์ม
    channel.on('broadcast', { event: 'patient-submit' }, ({ payload }) => {
      console.log('staff: ได้ patient-submit', payload)

      setPatients((prev) => {
        const id = payload.patientId as string
        let old = prev[id]
        if (!old) {
          old = {
            id,
            status: 'active',
            data: {},
            lastActivity: payload.timestamp,
          }
        }

        const copy = { ...prev }
        copy[id] = {
          ...old,
          status: 'submitted',
          data: payload.data,
          submittedAt: payload.timestamp,
          lastActivity: payload.timestamp,
        }
        return copy
      })
    })

    channel.subscribe((status) => {
      console.log('staff: channel', status)
    })

    return () => {
      void channel.unsubscribe()
    }
  }, [])

  const list = Object.values(patients)
  let countActive = 0
  let countInactive = 0
  let countSubmitted = 0
  for (let i = 0; i < list.length; i++) {
    if (list[i].status === 'active') countActive++
    else if (list[i].status === 'inactive') countInactive++
    else if (list[i].status === 'submitted') countSubmitted++
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto max-w-7xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold text-gray-900 sm:mb-2 sm:text-3xl md:text-4xl">
              <Hospital className="h-7 w-7 shrink-0 text-blue-600 sm:h-8 sm:w-8 md:h-9 md:w-9" aria-hidden />
              <span>มอนิเตอร์ข้อมูลผู้ป่วย</span>
            </h1>
            <p className="text-sm text-gray-600 sm:text-base md:text-lg">ดูการกรอกฟอร์มแบบเรียลไทม์</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <div className="h-3 w-3 shrink-0 animate-pulse rounded-full bg-green-500" />
            <span className="text-xs text-gray-600 sm:text-sm">ออนไลน์</span>
          </div>
        </div>


        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-2 sm:p-3">
                <Users className="h-6 w-6 text-blue-700 sm:h-7 sm:w-7" aria-hidden />
              </div>
              <div className="ml-2 min-w-0 sm:ml-4">
                <p className="text-xs font-medium text-gray-600 sm:text-sm">ผู้ป่วยทั้งหมด</p>
                <p className="text-xl font-bold text-gray-900 sm:text-2xl">{list.length}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-green-100 p-2 sm:p-3">
                <PenLine className="h-6 w-6 text-green-700 sm:h-7 sm:w-7" aria-hidden />
              </div>
              <div className="ml-2 min-w-0 sm:ml-4">
                <p className="text-xs font-medium text-gray-600 sm:text-sm">กำลังกรอก</p>
                <p className="text-xl font-bold text-green-600 sm:text-2xl">{countActive}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-yellow-100 p-2 sm:p-3">
                <PauseCircle className="h-6 w-6 text-yellow-700 sm:h-7 sm:w-7" aria-hidden />
              </div>
              <div className="ml-2 min-w-0 sm:ml-4">
                <p className="text-xs font-medium text-gray-600 sm:text-sm">หยุดชั่วคราว</p>
                <p className="text-xl font-bold text-yellow-600 sm:text-2xl">{countInactive}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex items-center">
              <div className="rounded-lg bg-blue-100 p-2 sm:p-3">
                <CheckCircle2 className="h-6 w-6 text-blue-700 sm:h-7 sm:w-7" aria-hidden />
              </div>
              <div className="ml-2 min-w-0 sm:ml-4">
                <p className="text-xs font-medium text-gray-600 sm:text-sm">ส่งแล้ว</p>
                <p className="text-xl font-bold text-blue-600 sm:text-2xl">{countSubmitted}</p>
              </div>
            </div>
          </div>
        </div>

        {list.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8 text-center sm:p-12">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 sm:h-24 sm:w-24">
              <ClipboardList className="h-9 w-9 text-gray-400 sm:h-11 sm:w-11" aria-hidden />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 sm:text-xl">ยังไม่มีข้อมูล</h3>
            <p className="break-words text-sm text-gray-600 sm:text-base">
              ลองเปิด <code className="rounded bg-gray-100 px-2 py-1 text-xs sm:text-sm">/patient</code> อีกแท็บ
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((patient) => (
              <div
                key={patient.id}
                className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:shadow-lg"
              >
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 text-white sm:p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/20 sm:h-10 sm:w-10">
                        <User className="h-5 w-5 text-white sm:h-5 sm:w-5" aria-hidden />
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate text-base font-semibold sm:text-lg">ผู้ป่วย {patient.id}</h3>
                        <p className="truncate text-xs text-blue-100 sm:text-sm">ID: {patient.id}</p>
                      </div>
                    </div>
                    <div className="shrink-0 self-start sm:self-center">
                      <PatientStatus status={patient.status} />
                    </div>
                  </div>
                </div>

                <div className="space-y-3 p-4 sm:p-6">
                  {(patient.data.firstName || patient.data.lastName) && (
                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2">
                      <User className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                      <div>
                        <p className="text-sm text-gray-600">ชื่อ</p>
                        <p className="font-medium">
                          {patient.data.firstName} {patient.data.middleName} {patient.data.lastName}
                        </p>
                      </div>
                    </div>
                  )}

                  {patient.data.birthDate && (
                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2">
                      <Cake className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                      <div>
                        <p className="text-sm text-gray-600">วันเกิด</p>
                        <p className="font-medium">
                          {new Date(patient.data.birthDate).toLocaleDateString('th-TH')}
                        </p>
                      </div>
                    </div>
                  )}

                  {patient.data.gender && (
                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2">
                      <UserRound className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                      <div>
                        <p className="text-sm text-gray-600">เพศ</p>
                        <p className="font-medium">
                          {patient.data.gender === 'male'
                            ? 'ชาย'
                            : patient.data.gender === 'female'
                              ? 'หญิง'
                              : 'อื่น ๆ'}
                        </p>
                      </div>
                    </div>
                  )}

                  {patient.data.phone && (
                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2">
                      <Phone className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                      <div>
                        <p className="text-sm text-gray-600">เบอร์</p>
                        <p className="font-medium">{patient.data.phone}</p>
                      </div>
                    </div>
                  )}

                  {patient.data.email && (
                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2">
                      <Mail className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                      <div>
                        <p className="text-sm text-gray-600">อีเมล</p>
                        <p className="font-medium break-all">{patient.data.email}</p>
                      </div>
                    </div>
                  )}

                  {patient.data.address && (
                    <div className="flex items-center space-x-3 rounded-lg bg-gray-50 p-2">
                      <Home className="h-4 w-4 shrink-0 text-gray-500" aria-hidden />
                      <div>
                        <p className="text-sm text-gray-600">ที่อยู่</p>
                        <p className="font-medium text-sm">{patient.data.address}</p>
                      </div>
                    </div>
                  )}

                  {(patient.data.language ||
                    patient.data.nationality ||
                    patient.data.emergencyContact ||
                    patient.data.religion) && (
                    <div className="border-t pt-3 mt-2">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">เพิ่มเติม</h4>
                      {patient.data.language && (
                        <p className="text-sm">
                          <span className="text-gray-500">ภาษา:</span> {patient.data.language}
                        </p>
                      )}
                      {patient.data.nationality && (
                        <p className="text-sm">
                          <span className="text-gray-500">สัญชาติ:</span> {patient.data.nationality}
                        </p>
                      )}
                      {patient.data.emergencyContact && (
                        <p className="text-sm">
                          <span className="text-gray-500">ฉุกเฉิน:</span> {patient.data.emergencyContact}
                        </p>
                      )}
                      {patient.data.religion && (
                        <p className="text-sm">
                          <span className="text-gray-500">ศาสนา:</span> {patient.data.religion}
                        </p>
                      )}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t text-xs text-gray-500">
                    <p>กิจกรรมล่าสุด: {formatTime(patient.lastActivity)}</p>
                    {patient.submittedAt != null && (
                      <p className="mt-1">ส่งเมื่อ: {formatTime(patient.submittedAt)}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 sm:mt-8 sm:p-6">
          <h3 className="mb-3 text-base font-semibold text-gray-900 sm:mb-4 sm:text-lg">ความหมายสถานะ</h3>
          <div className="grid grid-cols-1 gap-3 text-sm sm:gap-4 md:grid-cols-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="font-medium text-green-800">กำลังกรอก</p>
              <p className="text-green-700">ยังกรอกฟอร์มอยู่</p>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="font-medium text-yellow-800">หยุดชั่วคราว</p>
              <p className="text-yellow-700">ไม่ขยับนาน ~30 วินาที</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="font-medium text-blue-800">ส่งแล้ว</p>
              <p className="text-blue-700">กดส่งฟอร์มแล้ว</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
