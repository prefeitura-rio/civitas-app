import { useState } from 'react'

export interface UseDisclosureReturn {
  isLoading: boolean
  isOpen: boolean
  onClose: () => void
  onOpen: () => void
  onLoadingStart: () => void
  onLoadingStop: () => void
  onOpenChange: () => void
}

export function useDisclosure() {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setLoading] = useState(false)

  const onOpen = () => setIsOpen(true)
  const onClose = () => setIsOpen(false)
  const onLoadingStart = () => setLoading(true)
  const onLoadingStop = () => setLoading(false)
  const onOpenChange = () => setIsOpen(!isOpen)

  return {
    isLoading,
    isOpen,
    onClose,
    onOpen,
    onLoadingStart,
    onLoadingStop,
    onOpenChange,
  } as UseDisclosureReturn
}
