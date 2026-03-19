import { ProfileAccessProvider } from '@/contexts/profile-access-context'

import { ProfileAccessDialogs } from './components/profile-access-dialogs'
import { ProfileAccessTable } from './components/profile-access-table'
import styles from './perfis.module.css'

export default function CadastroPerfilPage() {
  return (
    <ProfileAccessProvider>
      <div
        className={`${styles.perfisPage} page-content flex min-h-screen flex-col overflow-y-auto px-6 py-6`}
      >
        <ProfileAccessTable />
        <ProfileAccessDialogs />
      </div>
    </ProfileAccessProvider>
  )
}
