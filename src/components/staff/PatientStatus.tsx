import React from 'react'

type Props = {
  status: 'active' | 'inactive' | 'submitted'
}

// ป้ายสีบอกว่าคนไข้ทำอะไรอยู่
export function PatientStatus({ status }: Props) {
  let text = 'ไม่ทราบ'
  let color = 'bg-gray-500 text-white'

  if (status === 'active') {
    text = 'กำลังกรอก'
    color = 'bg-green-500 text-white'
  } else if (status === 'inactive') {
    text = 'หยุดชั่วคราว'
    color = 'bg-yellow-500 text-white'
  } else if (status === 'submitted') {
    text = 'ส่งแล้ว'
    color = 'bg-blue-500 text-white'
  }

  return (
    <div className={'max-w-full truncate rounded-full px-2 py-1 text-[11px] font-medium sm:px-3 sm:text-xs ' + color}>
      {text}
    </div>
  )
}
