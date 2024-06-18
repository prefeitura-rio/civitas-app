'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { signIn } from '@/api/auth/sign-in'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const signInFormSchema = z.object({
  username: z.string().min(1, { message: 'Campo obrigatório' }),
  password: z.string().min(1, { message: 'Campo obrigatório' }),
})

type SignInForm = z.infer<typeof signInFormSchema>

export default function SignInPage() {
  const { register, handleSubmit } = useForm<SignInForm>({
    resolver: zodResolver(signInFormSchema),
  })

  async function onSubmit(props: SignInForm) {
    const response = await signIn({
      username: props.username,
      password: props.password,
    })
    console.log({ response })
  }

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-2"></div>
        <div className="flex gap-2"></div>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1">
          <Label htmlFor="username">E-mail</Label>
          <Input type="text" id="username" {...register('username')} />
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" {...register('password')} />

          <Link
            href="auth/forgot-password"
            className="text-foreground text-xs font-medium hover:underline"
          >
            Esqueci minha senha
          </Link>
        </div>

        <Button className="w-full" type="submit">
          Login
        </Button>
      </form>
    </div>
  )
}
