// รูปแบบข้อมูลตอนกดส่งฟอร์ม (ครบตามที่บังคับ)
export type PatientFormData = {
  firstName: string
  middleName?: string
  lastName: string
  birthDate: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
  address: string
  language?: string
  nationality?: string
  emergencyContact?: string
  religion?: string
}


export type PatientData = Partial<PatientFormData>

export type PatientSession = {
  id: string
  status: 'active' | 'inactive' | 'submitted'
  data: PatientData
  lastActivity: number
  submittedAt?: number
}
