import { useContext } from 'react'

import { CamerasCorContext } from '@/contexts/cameras-cor-context'

export function useCamerasCor() {
  const camerasCorContext = useContext(CamerasCorContext)

  return camerasCorContext
}
