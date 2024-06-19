'use client'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { isAuthenticated } from '@/utils/isAuthenticated'

export default function Home() {
  if (!isAuthenticated()) {
    redirect('/auth/sign-in')
  }
  return (
    <div>
      <h1>Hello World!</h1>
      <Button>Botão</Button>
    </div>
  )
}
