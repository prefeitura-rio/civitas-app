'use client'

import { notFound } from 'next/navigation'
import { useState } from 'react'

import { config } from '@/config'
import { useDisclosure } from '@/hooks/use-disclosure'
import type { UserRoleListItem } from '@/http/user-roles/get-users-with-roles'

import { ProfileAccessDialogs } from './components/profile-access-dialogs'
import { ProfileAccessTable } from './components/profile-access-table'
import styles from './perfis.module.css'

export default function CadastroPerfilPage() {
  if (!config.enableChamados) {
    notFound()
  }

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
