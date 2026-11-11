import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/modules/vehicle-intelligence/components/ui/select'

/** Lista longa demais para botões lado a lado no trilho. */
export function SelectChoice<T extends string | number>({
  id,
  value,
  choices,
  onChange,
}: {
  id: string
  value: T
  choices: Array<[T, string]>
  onChange: (value: T) => void
}) {
  return (
    <Select
      value={String(value)}
      onValueChange={(next) => {
        const choice = choices.find(([item]) => String(item) === next)
        if (choice) onChange(choice[0])
      }}
    >
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {choices.map(([item, label]) => (
          <SelectItem key={item} value={String(item)}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
