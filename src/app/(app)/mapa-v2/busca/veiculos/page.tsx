import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const vehicles = [
  {
    plate: 'AAP1053',
    color: 'BRANCA',
    brandAndModel: 'REB/FNV - FRUEHAUF',
    chassis: '9A9H12630KSAC6255',
    modelYear: 1989,
    categoria: 'ALUGUEL',
    grupoVeiculo: 'CAMINHOES',
    especie: 'CARGA',
    tipoVeiculo: 'SEMI-REBOQUE',
  },
  {
    plate: 'AAP1053',
    color: 'PRETA',
    brandAndModel: 'FIAT/UNO S',
    chassis: '9A9H12630KSAC6255',
    modelYear: 1987,
    categoria: 'PARTICULAR',
    grupoVeiculo: 'AUTOS',
    especie: 'PASSAGEIRO',
    tipoVeiculo: 'AUTOMOVEL',
  },
  {
    plate: 'AAP1053',
    color: 'BRANCA',
    brandAndModel: 'REB/FNV - FRUEHAUF',
    chassis: '9A9H12630KSAC6255',
    modelYear: 1989,
    categoria: 'ALUGUEL',
    grupoVeiculo: 'CAMINHOES',
    especie: 'CARGA',
    tipoVeiculo: 'AUTOMOVEL',
  },
  {
    plate: 'AAP1053',
    color: 'PRETA',
    brandAndModel: 'FIAT/UNO S',
    chassis: '9A9H12630KSAC6255',
    modelYear: 1987,
    categoria: 'PARTICULAR',
    grupoVeiculo: 'AUTOS',
    especie: 'PASSAGEIRO',
    tipoVeiculo: 'AUTOMOVEL',
  },
]

export default function Vehicles() {
  return (
    <div>
      <h4>Veículos encontrados</h4>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Placa</TableHead>
            <TableHead>Marca/Modelo</TableHead>
            <TableHead>Ano Modelo</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Grupo</TableHead>
            <TableHead>Espécie</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Cor</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.map((item) => (
            <TableRow key={item.plate}>
              <TableCell className="font-medium">{item.plate}</TableCell>
              <TableCell>{item.brandAndModel}</TableCell>
              <TableCell>{item.modelYear}</TableCell>
              <TableCell>{item.categoria}</TableCell>
              <TableCell>{item.grupoVeiculo}</TableCell>
              <TableCell>{item.especie}</TableCell>
              <TableCell>{item.tipoVeiculo}</TableCell>
              <TableCell className="text-right">{item.color}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
