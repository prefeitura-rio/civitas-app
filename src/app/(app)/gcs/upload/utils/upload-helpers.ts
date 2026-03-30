export interface FileWithProgress {
  id: string
  file: File
  relativePath: string
  progress: number
  status: 'pending' | 'initiating' | 'uploading' | 'success' | 'error'
  error?: string
}

const createFileId = (file: File, relativePath: string) => {
  return `${relativePath}-${file.size}-${file.lastModified}-${Math.random()
    .toString(16)
    .slice(2)}`
}

export const createFileWithProgress = (
  file: File,
  relativePath: string,
): FileWithProgress => ({
  id: createFileId(file, relativePath),
  file,
  relativePath,
  progress: 0,
  status: 'pending',
})
