/** O que as telas pedem à navegação do app: abrir o perfil de uma placa, em qual análise e com quais fatos. */

/** A análise aberta no perfil da placa. */
export type PlateProfileAnalysis = 'correlations' | 'trends'

export interface OpenPlateOptions {
  /** Correlações (o padrão) ou tendências de circulação. */
  analysis?: PlateProfileAnalysis
  /** Abre com "Ver todos os fatos", sem o recorte global (a busca de placas olha o grafo inteiro). */
  allFacts?: boolean
}

/** Abre o perfil da placa; "Voltar" volta para a tela de onde ele foi aberto. */
export type OpenPlate = (plate: string, options?: OpenPlateOptions) => void
