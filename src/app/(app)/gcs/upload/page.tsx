import { config } from '@/config'

import { GcsUploadForm } from './components/gcs-upload-form'

export default function GcsUploadPage() {
  const bucketName = config.arquivoOperacionalBucketName

  if (!bucketName) {
    throw new Error('Configuração de bucket ausente no servidor')
  }

  return (
    <div className="page-content flex items-center justify-center overflow-y-scroll p-6">
      <GcsUploadForm bucketName={bucketName} />
    </div>
  )
}
