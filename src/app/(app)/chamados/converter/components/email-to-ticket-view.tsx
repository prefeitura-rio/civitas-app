'use client'

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  FileText,
  Plus,
  Upload,
  X,
} from 'lucide-react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

import styles from './email-to-ticket-view.module.css'
import { SERVICE_LABELS, type ServiceKey, ServiceModal } from './service-modal'

const MOCK_EMAIL = {
  subject: 'Demonstração de integração de anexos',
  senderName: 'Marcus Vinícius Rocha',
  senderEmail: 'marcus.rocha90@gmail.com',
  date: '07/02/2026 às 01:51',
  body: 'Demonstração de integração de anexos - texto completo do email',
  attachments: [
    { name: 'ia-mirai.pdf', type: 'pdf' as const, url: '/ia-mirai.pdf' },
    { name: 'Relatório final.pdf', type: 'pdf' as const, url: '/ia-mirai.pdf' },
  ],
}

const MOCK_TICKET_TYPES = [
  { id: '1', name: 'Requisição' },
  { id: '2', name: 'Incidente' },
  { id: '3', name: 'Solicitação' },
]

const MOCK_PRIORITIES = [
  { id: 'baixa', name: 'Baixa' },
  { id: 'media', name: 'Média' },
  { id: 'alta', name: 'Alta' },
  { id: 'urgente', name: 'Urgente' },
]

const SERVICE_KEYS: ServiceKey[] = [
  'busca_por_placa',
  'busca_por_radar',
  'cerco_eletronico',
  'busca_por_imagem',
  'placas_correlatas',
  'placas_conjuntas',
  'reserva_de_imagem',
  'analise_de_imagem',
  'outros',
]

type AddedService = {
  id: string
  key: ServiceKey
}

let serviceIdCounter = 0

export function EmailToTicketView() {
  const [currentAttachment, setCurrentAttachment] = useState(0)
  const [serviceModalKey, setServiceModalKey] = useState<ServiceKey | null>(
    null,
  )
  const [addedServices, setAddedServices] = useState<AddedService[]>([])
  const [emailInfoCollapsed, setEmailInfoCollapsed] = useState(false)

  const attachments = MOCK_EMAIL.attachments
  const attachment = attachments[currentAttachment]

  function handleAddService(key: ServiceKey) {
    serviceIdCounter += 1
    setAddedServices((prev) => [
      ...prev,
      { id: `svc-${serviceIdCounter}`, key },
    ])
    setServiceModalKey(null)
  }

  function handleRemoveService(id: string) {
    setAddedServices((prev) => prev.filter((s) => s.id !== id))
  }

  return (
    <div className={styles.root}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <span className={styles.topBarTitle}>Converter em Chamado</span>
        <button className={styles.closeButton}>
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Main split layout */}
      <div className={styles.mainLayout}>
        {/* Left panel – email + PDF */}
        <div className={styles.leftPanel}>
          {/* Collapsible email info */}
          <div
            className={`${styles.emailInfoSection} ${
              emailInfoCollapsed
                ? styles.emailInfoSectionClosed
                : styles.emailInfoSectionOpen
            }`}
          >
            {/* Email header */}
            <div className={styles.emailHeader}>
              <h2 className={styles.emailSubject}>{MOCK_EMAIL.subject}</h2>
              <div className={styles.emailMeta}>
                <div className={styles.avatar}>
                  {MOCK_EMAIL.senderName.charAt(0)}
                </div>
                <div className={styles.senderInfo}>
                  <p className={styles.senderName}>{MOCK_EMAIL.senderName}</p>
                  <p className={styles.senderEmail}>
                    &lt;{MOCK_EMAIL.senderEmail}&gt;
                  </p>
                </div>
                <span className={styles.emailDate}>{MOCK_EMAIL.date}</span>
              </div>
            </div>

            {/* Email body */}
            <div className={styles.emailBody}>
              <p className={styles.emailBodyText}>{MOCK_EMAIL.body}</p>
            </div>
          </div>

          {/* Collapse toggle */}
          <button
            type="button"
            className={styles.collapseBar}
            onClick={() => setEmailInfoCollapsed((prev) => !prev)}
          >
            {emailInfoCollapsed ? (
              <>
                <ChevronDown className="h-3.5 w-3.5" />
                Mostrar detalhes do email
              </>
            ) : (
              <>
                <ChevronUp className="h-3.5 w-3.5" />
                Ocultar detalhes do email
              </>
            )}
          </button>

          {/* Attachment bar */}
          {attachments.length > 0 && (
            <div className={styles.attachmentBar}>
              <div className={styles.attachmentName}>
                <FileText className="h-4 w-4" />
                <span>{attachment?.name}</span>
              </div>
              <div className={styles.attachmentNav}>
                <button
                  className={styles.attachmentNavButton}
                  disabled={currentAttachment === 0}
                  onClick={() =>
                    setCurrentAttachment((i) => Math.max(0, i - 1))
                  }
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className={styles.attachmentNavText}>
                  {currentAttachment + 1} / {attachments.length}
                </span>
                <button
                  className={styles.attachmentNavButton}
                  disabled={currentAttachment >= attachments.length - 1}
                  onClick={() =>
                    setCurrentAttachment((i) =>
                      Math.min(attachments.length - 1, i + 1),
                    )
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* PDF viewer */}
          <div className={styles.pdfViewer}>
            {attachment?.url ? (
              <iframe
                key={attachment.url + currentAttachment}
                src={attachment.url}
                title={attachment.name}
                className="h-full w-full border-0"
              />
            ) : (
              <div className={styles.pdfPlaceholder}>
                <FileText className="h-16 w-16 opacity-30" />
                <span>Nenhum PDF para exibir</span>
              </div>
            )}
          </div>
        </div>

        {/* Right panel – form */}
        <div className={styles.rightPanel}>
          <div className={styles.rightPanelScroll}>
            <h3 className={styles.rightPanelTitle}>Dados do Chamado</h3>

            <div className="space-y-4">
              {/* Tipo de chamado */}
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Tipo de chamado</Label>
                <Select>
                  <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent className={styles.selectContentForm}>
                    {MOCK_TICKET_TYPES.map((type) => (
                      <SelectItem
                        key={type.id}
                        value={type.id}
                        className={styles.selectItemForm}
                      >
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Prioridade */}
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Prioridade</Label>
                <Select defaultValue="media">
                  <SelectTrigger className={`h-11 ${styles.inputBg}`}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className={styles.selectContentForm}>
                    {MOCK_PRIORITIES.map((p) => (
                      <SelectItem
                        key={p.id}
                        value={p.id}
                        className={styles.selectItemForm}
                      >
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Solicitante */}
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Solicitante</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  defaultValue={MOCK_EMAIL.senderName}
                />
              </div>

              {/* Email do solicitante */}
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>
                  Email do solicitante
                </Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  defaultValue={MOCK_EMAIL.senderEmail}
                />
              </div>

              {/* Assunto */}
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Assunto</Label>
                <Input
                  className={`h-11 ${styles.inputBg}`}
                  defaultValue={MOCK_EMAIL.subject}
                />
              </div>

              {/* Descrição */}
              <div className="space-y-1.5">
                <Label className={styles.fieldLabel}>Descrição</Label>
                <Textarea
                  className={`min-h-[80px] ${styles.inputBg}`}
                  defaultValue={MOCK_EMAIL.body}
                />
              </div>

              {/* Serviços */}
              <div>
                <div className={styles.sectionDivider}>
                  <span className={styles.sectionBadge}>Serviços</span>
                  <div className={styles.sectionLine} />
                </div>

                <div className={styles.serviceGrid}>
                  {SERVICE_KEYS.map((key) => (
                    <button
                      key={key}
                      type="button"
                      className={styles.serviceCard}
                      onClick={() => setServiceModalKey(key)}
                    >
                      <span className={styles.serviceCardTitle}>
                        {SERVICE_LABELS[key]}
                      </span>
                      <span className={styles.plusBox}>
                        <Plus className="h-3 w-3" />
                      </span>
                    </button>
                  ))}
                </div>

                {addedServices.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {addedServices.map((svc) => (
                      <div key={svc.id} className={styles.addedServiceTag}>
                        <span>{SERVICE_LABELS[svc.key]}</span>
                        <button
                          type="button"
                          className={styles.addedServiceRemove}
                          onClick={() => handleRemoveService(svc.id)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Anexar ofício */}
              <div>
                <div className={styles.sectionDivider}>
                  <span className={styles.sectionBadge}>Anexar ofício</span>
                  <div className={styles.sectionLine} />
                </div>

                <label className={styles.uploadBox}>
                  <input
                    className="hidden"
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx"
                  />
                  <Upload className="h-5 w-5 text-[var(--tc-icon-subtle)]" />
                  <span className={styles.uploadBoxText}>
                    Clique para fazer upload ou arraste o arquivo
                  </span>
                  <span className={styles.uploadBoxHint}>
                    PDF, DOC, DOCX (máx. 10MB)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Form footer */}
          <div className={styles.formFooter}>
            <Button
              type="button"
              variant="secondary"
              className={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button type="button" className={styles.saveButton}>
              Converter
            </Button>
          </div>
        </div>
      </div>

      {/* Service modal */}
      {serviceModalKey && (
        <ServiceModal
          serviceKey={serviceModalKey}
          onClose={() => setServiceModalKey(null)}
          onAdd={handleAddService}
        />
      )}
    </div>
  )
}
