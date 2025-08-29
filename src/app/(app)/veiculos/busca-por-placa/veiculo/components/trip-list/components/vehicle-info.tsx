import { getErrorMessage } from '@/app/(app)/pessoas/components/get-error-message'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Label } from '@/components/ui/label'
import { useVehicle } from '@/hooks/useQueries/useVehicle'

interface VehicleInfoProps {
  plate: string
}
export function VehicleInfo({ plate }: VehicleInfoProps) {
  const { data, error } = useVehicle(plate)

  // If there is an error or no data, return null to render nothing
  if (error || !data) {
    return null
  }

  const mainInfo = {
    'Marca/Modelo': data?.marcaModelo,
    Cor: data?.cor,
    'Ano do Modelo': data?.anoModelo,
    Restrições: data?.restricao.length || 0,
  }
  const simpleFields = {
    UF: data?.ufEmplacamento,
    'Município de Emplacamento': data?.municipioPlaca,
    'Último Licenciamento': data?.anoUltimoLicenciamnento,
    'Ano de Fabricação': data?.anoFabricacao,
    'Tipo de Veículo': data?.tipoVeiculo,
    Categoria: data?.categoria,
    Carroceria: data?.carroceria,
    Possuidor: data?.possuidor.nomePossuidor,
    Proprietário: data?.proprietario.nomeProprietario,
    Espécie: data?.especie,
    'Grupo de Veículo': data?.grupoVeiculo,
  }

  const arrendatario = {
    id: data?.arrendatario.id,
    Nome: data?.arrendatario.nomeArrendatario,
    Endereço: data?.arrendatario.enderecoArrendatario,
    'Número do Documento': data?.arrendatario.numeroDocumentoArrendatario,
    Placa: data?.arrendatario.placa,
    'Tipo de Documento': data?.arrendatario.tipoDocumentoArrendatario,
  }

  const restricoes = data?.restricao.map((item) => ({
    Data: item.dataOcorrencia,
    Histórico: item.historico,
    Natureza: item.naturezaOcorrencia,
    'Nome do Declarante': item.nomeDeclarante,
    'Número do BO': item.numeroBO,
    Placa: item.placa,
    'Telefone para Contato': item.telefoneContato,
    UF: item.ufBO,
    'Unidade Policial': item.unidadePolicial,
  }))

  const indiceNacionalVeiculos = {
    'BIN Roubo/Furto': data?.indiceNacionalVeiculos.at(0)?.qtd,
    BOPC: data?.indiceNacionalVeiculos.at(1)?.qtd,
    'Histórico de Transferência de Município':
      data?.indiceNacionalVeiculos.at(2)?.qtd,
    'Histórico de Transferência de Proprietário':
      data?.indiceNacionalVeiculos.at(3)?.qtd,
    Ocorrências: data?.indiceNacionalVeiculos.at(5)?.qtd,
    RENAJUD: data?.indiceNacionalVeiculos.at(6)?.qtd,
    'Restrições Administrativas': data?.indiceNacionalVeiculos.at(7)?.qtd,
  }

  const proprietario = {
    Nome: data?.proprietario.nomeProprietario,
    [data?.proprietario.tipoDocumentoProprietario || 'Documento']:
      data?.proprietario.numeroDocumentoProprietario,
    Endereço: data?.proprietario.enderecoProprietario,
  }

  const possuidor = {
    Nome: data?.possuidor.nomePossuidor,
    [data?.possuidor.tipoDocumentoPossuidor || 'Documento']:
      data?.possuidor.numeroDocumentoPossuidor,
    Endereço: data?.possuidor.enderecoPossuidor,
  }

  return (
    <Collapsible>
      <div>
        <h4 className="my-4 mb-2">
          <span>Informações do Veículo</span>
        </h4>
        {data && (
          <div className="mb-3 flex flex-col gap-0.5 text-sm">
            {Object.entries(mainInfo).map(([key, value], index) => (
              <div key={index}>
                <span className="text-sm font-medium">{key}: </span>
                <span className="text-sm text-muted-foreground">{value}</span>
              </div>
            ))}
          </div>
        )}
        {error && (
          <div className="flex justify-center rounded-lg border-l-2 border-rose-500 bg-secondary px-3 py-2">
            <span className="pl-6 -indent-6 text-sm text-muted-foreground">
              {`⚠️ Não foi possível retornar informações a respeito desse veículo. ${getErrorMessage(error)}`}
            </span>
          </div>
        )}
      </div>
      {data && (
        <>
          <CollapsibleTrigger className="group mb-2 flex items-center gap-2">
            <span className="text-muted-foreground group-data-[state='open']:hidden">
              Ver mais...
            </span>
            <span className="text-muted-foreground group-data-[state='closed']:hidden">
              Ver menos...
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="CollapsibleContent">
            <div className="space-y-6">
              <div>
                <span className="mb-1 block text-lg font-medium">
                  Informações básicas
                </span>
                <div className="space-y-1 pl-4">
                  {Object.entries(simpleFields).map(
                    ([key, value], index) =>
                      value && (
                        <div key={index} className="flex gap-2">
                          <Label className="text-sm font-medium leading-4">
                            {key}:
                          </Label>
                          <span className="text-sm leading-4 text-muted-foreground">
                            {value}
                          </span>
                        </div>
                      ),
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="mb-1 block text-lg font-medium">
                    Proprietário
                  </span>
                  <div className="space-y-1 pl-4">
                    {Object.entries(proprietario).map(
                      ([key, value], index) =>
                        value && (
                          <div key={index} className="flex gap-2">
                            <Label className="text-sm font-medium leading-4">
                              {key}:
                            </Label>
                            <span className="text-sm leading-4 text-muted-foreground">
                              {value}
                            </span>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="mb-1 block text-lg font-medium">
                    Possuidor
                  </span>
                  <div className="space-y-1 pl-4">
                    {Object.entries(possuidor).map(
                      ([key, value], index) =>
                        value && (
                          <div key={index} className="flex gap-2">
                            <Label className="text-sm font-medium leading-4">
                              {key}:
                            </Label>
                            <span className="text-sm leading-4 text-muted-foreground">
                              {value}
                            </span>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <span className="mb-1 block text-lg font-medium">
                    Índice Nacional de Veículos
                  </span>
                  <div className="space-y-1 pl-4">
                    {Object.entries(indiceNacionalVeiculos).map(
                      ([key, value], index) =>
                        (value || value === 0) && (
                          <div key={index} className="flex gap-2">
                            <Label className="text-sm font-medium leading-4">
                              {key}:
                            </Label>
                            <span className="text-sm leading-4 text-muted-foreground">
                              {value}
                            </span>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              </div>

              {data?.arrendatario && data.arrendatario.nomeArrendatario && (
                <div>
                  <span className="mb-1 block text-lg font-medium">
                    Arrendatário
                  </span>
                  <div className="space-y-1 pl-4">
                    {Object.entries(arrendatario).map(
                      ([key, value], index) =>
                        value && (
                          <div key={index} className="flex gap-2">
                            <Label className="text-sm font-medium leading-4">
                              {key}:
                            </Label>
                            <span className="text-sm leading-4 text-muted-foreground">
                              {value}
                            </span>
                          </div>
                        ),
                    )}
                  </div>
                </div>
              )}
              {!restricoes ||
                (restricoes?.length > 0 && (
                  <div>
                    <span className="mb-1 block text-lg font-medium">{`Restrições (${restricoes?.length}):`}</span>
                    <div className="space-y-2 pl-4">
                      {restricoes.map((victim, index) => (
                        <div key={index}>
                          <div>{`Restrição ${index + 1}:`}</div>
                          {Object.entries(victim).map(
                            ([key, value], index) =>
                              value && (
                                <div key={index} className="flex gap-2 pl-4">
                                  <Label className="text-sm font-medium leading-4">
                                    {key}:
                                  </Label>
                                  <span className="text-sm leading-4 text-muted-foreground">
                                    {value}
                                  </span>
                                </div>
                              ),
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          </CollapsibleContent>
        </>
      )}
    </Collapsible>
  )
}
