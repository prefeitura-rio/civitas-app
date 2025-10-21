import { type FormEvent, useCallback } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

type SelectedRadarsHeaderProps = {
  searchValue: string
  onSearchChange: (value: string) => void
  onSubmit: () => void
}

export function SelectedRadarsHeader({
  searchValue,
  onSearchChange,
  onSubmit,
}: SelectedRadarsHeaderProps) {
  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault()
      onSubmit()
    },
    [onSubmit],
  )

  return (
    <form className="flex space-x-2" onSubmit={handleSubmit}>
      <Input
        value={searchValue}
        placeholder="Código CET-RIO"
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Button type="submit">Adicionar</Button>
    </form>
  )
}
