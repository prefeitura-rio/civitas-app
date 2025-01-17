'use client'
import { AlertTriangle, icons } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormState } from '@/hooks/use-form-state'

import { signInAction } from './actions'

export default function SignInForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const usernameInputRef = useRef<HTMLInputElement>(null)
  const passwordInputRef = useRef<HTMLInputElement>(null)

  const [response, handleSubmit, isPending] = useFormState(signInAction, () => {
    redirect('/')
  })

  useEffect(() => {
    if (response.success === false && 'errors' in response) {
      if (response.errors?.username) {
        usernameInputRef.current?.focus()
      } else if (response.errors?.password) {
        passwordInputRef.current?.focus()
      } else if (response.errors?.captchaToken) {
        //
      }
    }
  }, [response])

  const [passwordFieldType, setPasswordFieldType] = useState<
    'password' | 'text'
  >('password')

  const LucideIcon = icons[passwordFieldType === 'password' ? 'EyeOff' : 'Eye']

  return (
    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-1">
        <Label htmlFor="username">Usuário</Label>
        <Input
          id="username"
          ref={usernameInputRef}
          name="username"
          placeholder="123.456.789-00"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            className="pr-8"
            ref={passwordInputRef}
            name="password"
            type={passwordFieldType}
            placeholder="**********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <LucideIcon
            className="absolute bottom-[50%] right-1.5 top-[50%] size-5 translate-y-[-50%] cursor-pointer select-none text-muted-foreground"
            onClick={(e) => {
              e.stopPropagation()
              setPasswordFieldType(
                passwordFieldType === 'password' ? 'text' : 'password',
              )
            }}
          />
        </div>
      </div>

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? <Spinner /> : 'Login'}
      </Button>

      <div className="relative">
        {response.success === false &&
          'message' in response &&
          response.message && (
            <Alert variant="destructive" className="absolute top-0 w-full">
              <AlertTriangle className="size-4 shrink-0" />
              <AlertTitle>{response.message.title}</AlertTitle>
              <AlertDescription>
                {response.message.description}
              </AlertDescription>
            </Alert>
          )}
      </div>
    </form>
  )
}
