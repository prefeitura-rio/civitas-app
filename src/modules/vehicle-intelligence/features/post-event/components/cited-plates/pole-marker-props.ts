/** O que os marcadores de polo recebem: o polo aberto, os ligados a ele e a escala. */
export type PoleMarkerProps = {
  selectedId: string | undefined
  hasSelection: boolean
  relatedIds: Set<string>
  maximum: number
  onOpen: (key: string) => void
}
