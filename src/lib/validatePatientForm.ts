
export type PatientDraft = {
  firstName: string
  middleName: string
  lastName: string
  birthDate: string
  gender: string
  phone: string
  email: string
  address: string
  language: string
  nationality: string
  emergencyContact: string
  religion: string
}

export const emptyPatientDraft: PatientDraft = {
  firstName: '',
  middleName: '',
  lastName: '',
  birthDate: '',
  gender: '',
  phone: '',
  email: '',
  address: '',
  language: '',
  nationality: '',
  emergencyContact: '',
  religion: '',
}

/** เอาเฉพาะตัวเลข */
function digitsOnly(s: string): string {
  return s.replace(/\D/g, '')
}


export function normalizeThaiPhone(raw: string): string {
  let d = digitsOnly(raw)
  if (d.startsWith('66') && d.length >= 11) {
    d = '0' + d.slice(2)
  }
  return d
}


function isValidThaiPhone10(digits: string): boolean {
  return /^0\d{9}$/.test(digits)
}

/**
 * (กันค่าว่าง, ไม่มี @, โดเมนไม่มีจุด, จุดติดกัน)
 */
function isValidEmail(s: string): boolean {
  const t = s.trim()
  if (t.length === 0) return false
  if (t.includes('..')) return false
  const at = t.indexOf('@')
  if (at <= 0 || at !== t.lastIndexOf('@')) return false
  const local = t.slice(0, at)
  const domain = t.slice(at + 1)
  if (local.length === 0 || domain.length === 0) return false
  if (domain.startsWith('.') || domain.endsWith('.') || !domain.includes('.')) return false
  const tld = domain.slice(domain.lastIndexOf('.') + 1)
  if (tld.length < 2) return false
  return /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/.test(t)
}


export function validatePatientForm(form: PatientDraft): Record<string, string> {
  const err: Record<string, string> = {}

  if (form.firstName.trim().length < 2) {
    err.firstName = 'ชื่อต้องมีอย่างน้อย 2 ตัวอักษร'
  }

  if (form.lastName.trim().length < 2) {
    err.lastName = 'นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร'
  }

  if (form.birthDate.trim() === '') {
    err.birthDate = 'กรุณาระบุวันเกิด'
  }

  if (form.gender !== 'male' && form.gender !== 'female' && form.gender !== 'other') {
    err.gender = 'กรุณาเลือกเพศ'
  }

  const phone = normalizeThaiPhone(form.phone)
  if (!isValidThaiPhone10(phone)) {
    err.phone =
      'เบอร์โทรศัพท์ไม่ถูกต้อง ต้องเป็น 10 หลักขึ้นต้นด้วย 0 (เช่น 0812345678) ใส่ขีดหรือเว้นวรรคได้'
  }

  if (!isValidEmail(form.email)) {
    err.email = 'อีเมลไม่ถูกต้อง ตัวอย่าง: name@example.com'
  }

  if (form.address.trim() === '') {
    err.address = 'กรุณากรอกที่อยู่'
  }

  return err
}

export function patientFormIsValid(form: PatientDraft): boolean {
  return Object.keys(validatePatientForm(form)).length === 0
}
