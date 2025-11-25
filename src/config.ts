// This function will validate and return the environment variables
const getConfig = () => {
  const apiUrl = process.env.NEXT_PUBLIC_CIVITAS_API_URL
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_CIVITAS_API_URL is not set')
  }
  // Trim any trailing slash from the API URL
  const trimmedApiUrl = apiUrl.replace(/\/+$/, '')

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
  if (!mapboxAccessToken) {
    throw new Error('NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN is not set')
  }

  const arquivoOperacionalBucketName =
    process.env.ARQUIVO_OPERACIONAL_BUCKET_NAME

  // Only validate server-side variables if running on the server
  if (!arquivoOperacionalBucketName && typeof window === 'undefined') {
    throw new Error('ARQUIVO_OPERACIONAL_BUCKET_NAME is not set')
  }

  return {
    apiUrl: trimmedApiUrl,
    mapboxAccessToken,
    arquivoOperacionalBucketName,
  }
}

export const config = getConfig()
