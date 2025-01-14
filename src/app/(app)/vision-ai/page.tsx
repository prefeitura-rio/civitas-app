import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value

  return (
    <iframe
      src={`https://app.dados.rio/vision-ai?token=${token}`}
      className="h-screen w-full"
      title="Vision AI"
    />
  )
}
