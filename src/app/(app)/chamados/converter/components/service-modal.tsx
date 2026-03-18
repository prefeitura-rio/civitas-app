'use client'

import { ChevronLeft, Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

import styles from './email-to-ticket-view.module.css'

type ServiceKey =
  | 'busca_por_placa'
  | 'busca_por_radar'
  | 'cerco_eletronico'
  | 'busca_por_imagem'
  | 'placas_correlatas'
  | 'placas_conjuntas'
  | 'reserva_de_imagem'
  | 'analise_de_imagem'
  | 'outros'

const SERVICE_LABELS: Record<ServiceKey, string> = {
  busca_por_placa: 'Busca por placa',
  busca_por_radar: 'Busca por radar',
  cerco_eletronico: 'Cerco eletrônico',
  busca_por_imagem: 'Busca por imagem',
  placas_correlatas: 'Placas correlatas',
  placas_conjuntas: 'Placas conjuntas',
  reserva_de_imagem: 'Reserva de imagem',
  analise_de_imagem: 'Análise de imagem',
  outros: 'Outros',
}

function PeriodFields() {
  return (
    <div className="space-y-1.5">
      <Label className={styles.fieldLabel}>Período da busca</Label>
      <div className="grid grid-cols-2 gap-3">
        <Input
          className={`h-11 ${styles.inputBg}`}
          type="datetime-local"
          placeholder="Início"
        />
        <Input
          className={`h-11 ${styles.inputBg}`}
          type="datetime-local"
          placeholder="Fim"
        />
      </div>
    </div>
  )
}

function ServiceFields({ serviceKey }: { serviceKey: ServiceKey }) {
  switch (serviceKey) {
    case 'busca_por_placa':
      return (
        <div className="space-y-4">
          <PeriodFields />
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input className={`h-11 ${styles.inputBg}`} />
          </div>
        </div>
      )

    case 'busca_por_radar':
      return (
        <div className="space-y-4">
          <PeriodFields />
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input className={`h-11 ${styles.inputBg}`} />
          </div>
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Endereço do radar</Label>
            <Textarea className={`min-h-[80px] ${styles.inputBg}`} />
          </div>
        </div>
      )

    case 'cerco_eletronico':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input className={`h-11 ${styles.inputBg}`} />
          </div>
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Observações do veículo</Label>
            <Textarea className={`min-h-[80px] ${styles.inputBg}`} />
          </div>
        </div>
      )

    case 'busca_por_imagem':
      return (
        <div className="space-y-4">
          <PeriodFields />
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input className={`h-11 ${styles.inputBg}`} />
          </div>
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Endereço</Label>
            <Input className={`h-11 ${styles.inputBg}`} />
          </div>
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Orientação</Label>
            <Textarea className={`min-h-[80px] ${styles.inputBg}`} />
          </div>
        </div>
      )

    case 'placas_correlatas':
    case 'placas_conjuntas':
      return (
        <div className="space-y-4">
          <PeriodFields />
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Placa do veículo</Label>
            <Input className={`h-11 ${styles.inputBg}`} />
          </div>
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>
              Intervalo de interesse (min)
            </Label>
            <Input className={`h-11 ${styles.inputBg}`} type="number" />
          </div>
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Quantidade de detecção</Label>
            <Input className={`h-11 ${styles.inputBg}`} type="number" />
          </div>
        </div>
      )

    case 'reserva_de_imagem':
    case 'analise_de_imagem':
      return (
        <div className="space-y-4">
          <PeriodFields />
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Orientação</Label>
            <Textarea className={`min-h-[80px] ${styles.inputBg}`} />
          </div>
        </div>
      )

    case 'outros':
      return (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label className={styles.fieldLabel}>Orientação</Label>
            <Textarea className={`min-h-[80px] ${styles.inputBg}`} />
          </div>
        </div>
      )
  }
}

interface ServiceModalProps {
  serviceKey: ServiceKey
  onClose: () => void
  onAdd: (serviceKey: ServiceKey) => void
}

export function ServiceModal({
  serviceKey,
  onClose,
  onAdd,
}: ServiceModalProps) {
  return (
    <>
      <div className={styles.serviceModalOverlay} onClick={onClose} />
      <div className={styles.serviceModalContainer}>
        <div className={styles.serviceModalHeader}>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className={styles.closeButton}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className={styles.serviceModalTitle}>
              {SERVICE_LABELS[serviceKey]}
            </span>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className={styles.serviceModalBody}>
          <ServiceFields serviceKey={serviceKey} />
        </div>

        <div className={styles.serviceModalFooter}>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className={styles.cancelButton}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            className={styles.addServiceButton}
            onClick={() => onAdd(serviceKey)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Adicionar
          </Button>
        </div>
      </div>
    </>
  )
}

export type { ServiceKey }
export { SERVICE_LABELS }
