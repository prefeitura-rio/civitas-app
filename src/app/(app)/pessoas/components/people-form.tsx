'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { formatCNPJ, formatCPF } from '@/utils/string-formatters'
import { validateCNPJ } from '@/utils/validate-cnpj'
import { validateCPF } from '@/utils/validate-cpf'

export function PeopleForm() {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const router = useRouter()

  function handleValueChange(value: string) {
    if (value.length <= 14) {
      const formattedCPF = formatCPF(value)
      if (formattedCPF.length === 14 && validateCPF(value)) setError(null)
      setValue(formattedCPF)
      return
    }

    const formattedCNPJ = formatCNPJ(value)
    if (formattedCNPJ.length === 18 && validateCNPJ(value)) setError(null)
    setValue(formattedCNPJ)
  }

  function handleSubmit() {
    if (value.length <= 14) {
      if (!validateCPF(value)) {
        setError('CPF inválido')
        return
      }
      router.push(`/pessoas/cpf/${value.replace(/\W/g, '')}`)
    } else {
      if (!validateCNPJ(value)) {
        setError('CNPJ inválido')
        return
      }
      router.push(`/pessoas/cnpj/${value.replace(/\W/g, '')}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Busca por pessoa física ou jurídica</CardTitle>
      </CardHeader>
      <CardContent className="flex gap-2">
        <div>
          <Input
            className="w-40"
            placeholder="CPF/CNPJ"
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
          />
          {error && <span className="text-sm text-destructive">{error}</span>}
        </div>
        <Button onClick={handleSubmit}>Pesquisar</Button>
      </CardContent>
    </Card>
  )
}
