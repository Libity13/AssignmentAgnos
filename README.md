# Patient form — realtime staff monitor

แอป Next.js สำหรับคนไข้กรอกฟอร์มและเจ้าหน้าที่ดูข้อมูลแบบเรียลไทม์ผ่าน **Supabase Realtime (Broadcast)**

## สิ่งที่ต้องมีก่อน

- **Node.js** เวอร์ชันแนะนำ 20 LTS ขึ้นไป (ให้สอดคล้องกับ Next.js 16)
- บัญชี **[Supabase](https://supabase.com)** และโปรเจกต์ที่เปิดใช้ **Realtime** (ใช้สำหรับ broadcast ระหว่างแท็บ)

## ติดตั้ง

```bash
git clone <repository-url>
cd <โฟลเดอร์โปรเจกต์>
npm install
```

## ตั้งค่าตัวแปรสภาพแวดล้อม

สร้างไฟล์ `.env.local` ที่รากโปรเจกต์:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

ค่าทั้งสองดูได้ที่ Supabase Dashboard → **Project Settings** → **APIKeys**

> โปรเจกต์นี้ใช้เฉพาะคีย์ฝั่ง client (`NEXT_PUBLIC_*`) สำหรับ Realtime channel — ไม่ต้องมี service role key ใน repo นี้

## รันในโหมดพัฒนา

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

| เส้นทาง   | ใช้ทำอะไร        |
|-----------|------------------|
| `/`       | เลือกคนไข้ / เจ้าหน้าที่ |
| `/patient`| ฟอร์มคนไข้       |
| `/staff`  | มอนิเตอร์เจ้าหน้าที่ |

ทดสอบเรียลไทม์: เปิด `/patient` กับ `/staff` **คนละแท็บ** (หรือคนละหน้าต่าง) พร้อมกัน

## บิลด์และรันแบบ production (ท้องถิ่น)

```bash
npm run build
npm start
```

## Deploy (เช่น Vercel)

1. ผูก repo กับ Vercel (หรือแพลตฟอร์มที่รองรับ Next.js)
2. ตั้ง **Environment Variables** ให้ตรงกับ `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy แล้วเปิด URL ที่ได้ — หน้า `/patient` กับ `/staff` ใช้งานเหมือนในเครื่อง

## สคริปต์อื่น

```bash
npm run lint
```
