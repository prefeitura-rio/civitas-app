// This function will validate and return the environment variables
const getConfig = () => {
  const isTruthy = (value?: string) => value?.toLowerCase() === 'true'

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

  const enableChamados = isTruthy(process.env.NEXT_PUBLIC_ENABLE_CHAMADOS)
  const enableImpersonation = isTruthy(
    process.env.NEXT_PUBLIC_ENABLE_IMPERSONATION,
  )
  const enablePrivacyPage = isTruthy(
    process.env.NEXT_PUBLIC_ENABLE_PRIVACY_PAGE,
  )

  return {
    apiUrl: trimmedApiUrl,
    mapboxAccessToken,
    enableChamados,
    enableImpersonation,
    enablePrivacyPage,
  }
}

export const config = getConfig()
