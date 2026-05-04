'use client'

import { useState } from 'react'

import { Spinner } from '@/components/custom/spinner'
import { useDisclosure } from '@/hooks/use-disclosure'
import { useTicketScreenPermissionGate } from '@/hooks/useTicketScreenPermissionGate'
import type { UserRoleListItem } from '@/http/user-roles/get-users-with-roles'

import { ProfileAccessDialogs } from './components/profile-access-dialogs'
import { ProfileAccessTable } from './components/profile-access-table'
import styles from './perfis.module.css'

const PROFILE_SCREEN_CODE = 'profile'

function CadastroPerfilPageContent() {
  const formDialogDisclosure = useDisclosure()
  const [dialogInitialData, setDialogInitialData] =
    useState<UserRoleListItem | null>(null)

  function handleEditUser(user: UserRoleListItem) {
    setDialogInitialData(user)
    formDialogDisclosure.onOpen()
  }

  return (
    <div className={`${styles.perfisPage} flex flex-col px-6 py-6`}>
      <div className="content">
        <ProfileAccessTable onEditUser={handleEditUser} />

        <ProfileAccessDialogs
          isOpen={formDialogDisclosure.isOpen}
          onOpen={formDialogDisclosure.onOpen}
          onClose={formDialogDisclosure.onClose}
          dialogInitialData={dialogInitialData}
          setDialogInitialData={setDialogInitialData}
        />
      </div>
    </div>
  )
}

export default function CadastroPerfilPage() {
  const { allowed, resolved } =
    useTicketScreenPermissionGate(PROFILE_SCREEN_CODE)

  if (!resolved || !allowed) {
    return (
      <div
        className={`${styles.perfisPage} flex min-h-screen flex-col items-center justify-center px-6 py-6`}
      >
        <Spinner />
      </div>
    )
  }

  return <CadastroPerfilPageContent />
}
