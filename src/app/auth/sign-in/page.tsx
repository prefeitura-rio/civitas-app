'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signIn } from '@/http/auth/sign-in'
import { genericErrorMessage, isValidationError } from '@/utils/error-handlers'

const signInFormSchema = z.object({
  username: z.string().min(1, { message: 'Campo obrigatório' }),
  password: z.string().min(1, { message: 'Campo obrigatório' }),
})

type SignInForm = z.infer<typeof signInFormSchema>

export default function SignInPage() {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInForm>({
    resolver: zodResolver(signInFormSchema),
  })

  async function onSubmit(props: SignInForm) {
    try {
      const response = await signIn({
        username: props.username,
        password: props.password,
      })

      const {
        data: { access_token: accessToken },
      } = response

      sessionStorage.setItem('token', accessToken)
      sessionStorage.setItem('profile', props.username)

      router.push('/')
    } catch (error) {
      if (isValidationError(error)) {
        toast.error('Credenciais inválidas.')
      } else {
        toast.error(genericErrorMessage)
      }
    }
  }

  return (
    <div>
      <div className="flex justify-between">
        <div className="flex gap-2"></div>
        <div className="flex gap-2"></div>
      </div>
      <form
        // action={signIn}
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="space-y-1">
          <Label htmlFor="username">E-mail</Label>
          <Input type="text" id="username" {...register('username')} />
          {errors.username && (
            <span className="ml-2 text-xs text-rose-600">
              {errors.username.message}
            </span>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="password">Password</Label>
          <Input type="password" id="password" {...register('password')} />
          {errors.password && (
            <span className="ml-2 text-xs text-rose-600">
              {errors.password.message}
            </span>
          )}
        </div>

        <Button className="w-full" type="submit">
          Login
        </Button>

        <Link
          href="auth/forgot-password"
          className="block w-full text-center text-xs font-medium text-foreground hover:underline"
        >
          Esqueci minha senha
        </Link>
      </form>
    </div>
  )
}
