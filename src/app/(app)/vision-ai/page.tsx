import { cookies } from 'next/headers'

import { ACCESS_TOKEN_COOKIE } from '@/lib/api'

export default async function Page() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  return (
    <iframe
      src={`https://app.dados.rio/vision-ai?token=${token}`}
      className="h-screen w-full"
      title="Vision AI"
    />
  )
}
