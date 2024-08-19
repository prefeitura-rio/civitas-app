'use client'
import { AlertTriangle, icons } from 'lucide-react'
import { redirect } from 'next/navigation'
import { useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useFormState } from '@/hooks/use-form-state'

import { signInAction } from './actions'

export default function SignInForm() {
  const [{ errors, message, success }, handleSubmit, isPending] = useFormState(
    signInAction,
    () => {
      redirect('/')
    },
  )
  const [passwordFieldType, setPasswordFieldType] = useState<
    'password' | 'text'
  >('password')

  const LucideIcon = icons[passwordFieldType === 'password' ? 'EyeOff' : 'Eye']

  return (
    <form className="w-full max-w-sm space-y-4" onSubmit={handleSubmit}>
      {success === false && message && (
        <Alert variant="destructive">
          <AlertTriangle className="size-4" />
          <AlertTitle>O login falhou!</AlertTitle>
          <AlertDescription>
            <p>{message}</p>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-1">
        <Label htmlFor="username">Usuário</Label>
        <Input name="username" type="text" id="username" />
        {errors?.username && (
          <span className="ml-2 text-xs text-rose-600">
            {errors.username[0]}
          </span>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            className="pr-8"
            type={passwordFieldType}
            id="password"
            name="password"
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
        {errors?.password && (
          <span className="ml-2 text-xs text-rose-600">
            {errors.password[0]}
          </span>
        )}
      </div>

      <Button className="w-full" type="submit" disabled={isPending}>
        {isPending ? <Spinner /> : 'Login'}
      </Button>
    </form>
  )
}
