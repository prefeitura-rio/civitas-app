import { Fragment } from 'react'

import styles from '../ticket-detail.module.css'

export interface TicketAssignee {
  user_id: string
  user_name: string
  is_active?: boolean
}

interface TicketAssigneesLabelProps {
  assignees?: TicketAssignee[]
}

function firstName(name: string) {
  return (name.trim().split(/\s+/)[0] ?? '').toLocaleUpperCase('pt-BR')
}

/** Responsáveis do chamado pelo primeiro nome; desativados ganham o selo "Inativo". */
export function TicketAssigneesLabel({ assignees }: TicketAssigneesLabelProps) {
  const named = (assignees ?? []).filter((a) => a.user_name?.trim())

  if (!named.length) return <>—</>

  return (
    <>
      {named.map((assignee, index) => {
        const inactive = assignee.is_active === false
        return (
          <Fragment key={assignee.user_id}>
            {index > 0 && ', '}
            <span
              data-assignee
              title={
                inactive
                  ? `${assignee.user_name} (usuário inativo)`
                  : assignee.user_name
              }
            >
              {firstName(assignee.user_name)}
              {inactive && (
                <span className={styles.assigneeInactiveBadge}>Inativo</span>
              )}
            </span>
          </Fragment>
        )
      })}
    </>
  )
}
