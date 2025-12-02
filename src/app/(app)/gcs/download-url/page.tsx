import { config } from '@/config'

import { GcsDownloadUrlForm } from './components/gcs-download-url-form'

export default function GcsDownloadUrlPage() {
  const bucketName = config.arquivoOperacionalBucketName

  if (!bucketName) {
    throw new Error('Configuração de bucket ausente no servidor')
  }

  return (
    <div className="page-content flex items-center justify-center overflow-y-scroll p-6">
      <GcsDownloadUrlForm bucketName={bucketName} />
    </div>
  )
}
