'use client'

import { ClipboardList, Phone, User } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabase'
import {
  emptyPatientDraft,
  normalizeThaiPhone,
  validatePatientForm,
  type PatientDraft,
} from '@/lib/validatePatientForm'
import type { PatientFormData } from '@/types'
import { FormSection } from './FormSection'

const roomName = 'patient-room'
const patientId = 'patient-1'

const inputClass =
  'w-full min-h-[44px] rounded-lg border border-gray-300 px-3 py-2 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500 sm:px-4 sm:py-3'

const inputErrorRing = ' border-red-500 focus:border-red-500 focus:ring-red-400'

export function PatientForm() {
  const [form, setForm] = useState(emptyPatientDraft)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const formRef = useRef(form)
  formRef.current = form

 
  function onBlurField(field: keyof PatientDraft) {
    const errs = validatePatientForm(formRef.current)
    setErrors((prev) => {
      const next = { ...prev }
      if (errs[field] != null) {
        next[field] = errs[field]!
      } else {
        delete next[field]
      }
      return next
    })
  }

 
  function setField(name: keyof PatientDraft, value: string) {
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => {
      if (prev[name] == null) return prev
      const next = { ...prev }
      delete next[name]
      return next
    })
  }

  function classForField(name: keyof PatientDraft) {
    return errors[name] != null ? inputClass + inputErrorRing : inputClass
  }

  const [channel, setChannel] = useState<ReturnType<typeof supabase.channel> | null>(null)
  const [isActive, setIsActive] = useState(false)
  const [lastActivity, setLastActivity] = useState(Date.now())

  // debounce: พิมพ์เสร็จรอ 0.5 วิ ค่อยถือว่าเป็นค่าล่าสุด
  const formJson = JSON.stringify(form)
  const [debouncedJson, setDebouncedJson] = useState(formJson)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedJson(formJson)
    }, 500)
    return () => clearTimeout(timer)
  }, [formJson])

  const lastSentJson = useRef<string | null>(null)

  // --- ต่อ Supabase ---
  useEffect(() => {
    const ch = supabase.channel(roomName, {
      config: { broadcast: { ack: false } },
    })

    ch.subscribe(async (status) => {
      console.log('patient: channel', status)
      if (status === 'SUBSCRIBED') {
        await ch.send({
          type: 'broadcast',
          event: 'patient-status',
          payload: { type: 'status', status: 'active', patientId, timestamp: Date.now() },
        })
      }
    })

    setChannel(ch)
    return () => {
      void ch.unsubscribe()
    }
  }, [])

  useEffect(() => {
    lastSentJson.current = null
  }, [channel])

  useEffect(() => {
    if (channel == null) return
    if (debouncedJson === lastSentJson.current) return
    lastSentJson.current = debouncedJson

    const data = JSON.parse(debouncedJson) as PatientDraft

    console.log('patient: ส่ง patient-update')

    channel.send({
      type: 'broadcast',
      event: 'patient-update',
      payload: {
        type: 'form-update',
        patientId,
        data,
        timestamp: Date.now(),
      },
    })
  }, [channel, debouncedJson])

  useEffect(() => {
    function onMove() {
      setIsActive(true)
      setLastActivity(Date.now())
      if (channel != null) {
        channel.send({
          type: 'broadcast',
          event: 'patient-activity',
          payload: { type: 'activity', patientId, timestamp: Date.now() },
        })
      }
    }

    window.addEventListener('mousedown', onMove)
    window.addEventListener('keydown', onMove)
    window.addEventListener('scroll', onMove)
    window.addEventListener('touchstart', onMove)

    return () => {
      window.removeEventListener('mousedown', onMove)
      window.removeEventListener('keydown', onMove)
      window.removeEventListener('scroll', onMove)
      window.removeEventListener('touchstart', onMove)
    }
  }, [channel])

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now()
      if (now - lastActivity > 30000 && isActive) {
        setIsActive(false)
        if (channel != null) {
          console.log('patient: ส่ง inactive')
          channel.send({
            type: 'broadcast',
            event: 'patient-status',
            payload: { type: 'status', status: 'inactive', patientId, timestamp: now },
          })
        }
      }
    }, 5000)
    return () => clearInterval(timer)
  }, [channel, isActive, lastActivity])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()

    const err = validatePatientForm(form)
    setErrors(err)
    if (Object.keys(err).length > 0) {
      return
    }

    const data: PatientFormData = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      birthDate: form.birthDate,
      gender: form.gender as 'male' | 'female' | 'other',
      phone: normalizeThaiPhone(form.phone),
      email: form.email.trim(),
      address: form.address.trim(),
    }
    if (form.middleName.trim() !== '') data.middleName = form.middleName.trim()
    if (form.language.trim() !== '') data.language = form.language.trim()
    if (form.nationality.trim() !== '') data.nationality = form.nationality.trim()
    if (form.emergencyContact.trim() !== '') data.emergencyContact = form.emergencyContact.trim()
    if (form.religion.trim() !== '') data.religion = form.religion.trim()

    console.log('patient: กดส่งฟอร์ม', data)

    if (channel == null) {
      console.log('patient: ยังไม่มี channel')
      return
    }

    await channel.send({
      type: 'broadcast',
      event: 'patient-submit',
      payload: { type: 'submit', patientId, data, timestamp: Date.now() },
    })
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-linear-to-br from-blue-50 via-white to-indigo-50">
      <main className="container mx-auto max-w-3xl px-3 py-6 sm:px-4 sm:py-8">
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="bg-linear-to-r from-blue-500 to-indigo-600 p-4 text-white sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold sm:mb-2 sm:text-3xl">
                  <ClipboardList className="h-7 w-7 shrink-0 text-white/90 sm:h-8 sm:w-8" aria-hidden />
                  <span>ข้อมูลผู้ป่วย</span>
                </h1>
                <p className="text-sm text-blue-100 sm:text-base">กรุณากรอกข้อมูลให้ครบ</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div
                  className={
                    'h-3 w-3 shrink-0 rounded-full ' +
                    (isActive ? 'animate-pulse bg-green-400' : 'bg-yellow-400')
                  }
                />
                <span className="text-xs text-blue-100 sm:text-sm">
                  {isActive ? 'กำลังกรอก' : 'หยุดชั่วคราว'}
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 md:p-8">
            
            <form noValidate onSubmit={onSubmit} className="space-y-6">
              <FormSection
                title="ข้อมูลส่วนตัว"
                icon={<User className="h-5 w-5 text-gray-600" aria-hidden />}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ชื่อ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={classForField('firstName')}
                      value={form.firstName}
                      onChange={(e) => setField('firstName', e.target.value)}
                      onBlur={() => onBlurField('firstName')}
                    />
                    {errors.firstName && <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ชื่อกลาง</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.middleName}
                      onChange={(e) => setField('middleName', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      นามสกุล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      className={classForField('lastName')}
                      value={form.lastName}
                      onChange={(e) => setField('lastName', e.target.value)}
                      onBlur={() => onBlurField('lastName')}
                    />
                    {errors.lastName && <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      วันเกิด <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      className={classForField('birthDate')}
                      value={form.birthDate}
                      onChange={(e) => setField('birthDate', e.target.value)}
                      onBlur={() => onBlurField('birthDate')}
                    />
                    {errors.birthDate && <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เพศ <span className="text-red-500">*</span>
                    </label>
                    <select
                      className={classForField('gender')}
                      value={form.gender}
                      onChange={(e) => setField('gender', e.target.value)}
                      onBlur={() => onBlurField('gender')}
                    >
                      <option value="">เลือกเพศ</option>
                      <option value="female">หญิง</option>
                      <option value="male">ชาย</option>
                      <option value="other">อื่น ๆ</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-sm mt-1">{errors.gender}</p>}
                  </div>
                </div>
              </FormSection>

              <FormSection
                title="ข้อมูลการติดต่อ"
                icon={<Phone className="h-5 w-5 text-gray-600" aria-hidden />}
              >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      เบอร์โทร <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="tel"
                      autoComplete="tel"
                      placeholder="เช่น 0812345678 หรือ 081-234-5678"
                      className={classForField('phone')}
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value)}
                      onBlur={() => onBlurField('phone')}
                    />
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      อีเมล <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      inputMode="email"
                      autoComplete="email"
                      placeholder="เช่น name@example.com"
                      className={classForField('email')}
                      value={form.email}
                      onChange={(e) => setField('email', e.target.value)}
                      onBlur={() => onBlurField('email')}
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ที่อยู่ <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      rows={4}
                      className={classForField('address') + ' resize-none'}
                      value={form.address}
                      onChange={(e) => setField('address', e.target.value)}
                      onBlur={() => onBlurField('address')}
                    />
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>
              </FormSection>

              <FormSection title="ข้อมูลเพิ่มเติม">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ภาษา</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.language}
                      onChange={(e) => setField('language', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">สัญชาติ</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.nationality}
                      onChange={(e) => setField('nationality', e.target.value)}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">ผู้ติดต่อฉุกเฉิน</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.emergencyContact}
                      onChange={(e) => setField('emergencyContact', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">ศาสนา</label>
                    <input
                      type="text"
                      className={inputClass}
                      value={form.religion}
                      onChange={(e) => setField('religion', e.target.value)}
                    />
                  </div>
                </div>
              </FormSection>

              <div className="pt-4 sm:flex sm:justify-end sm:pt-6">
                <button
                  type="submit"
                  className="min-h-[48px] w-full rounded-lg bg-linear-to-r from-blue-500 to-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg sm:w-auto sm:px-8"
                >
                  บันทึกข้อมูล
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
