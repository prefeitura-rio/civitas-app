// This function will validate and return the environment variables
const getConfig = () => {
  const apiUrl = process.env.NEXT_PUBLIC_CIVITAS_API_URL
  if (!apiUrl) {
    throw new Error('NEXT_PUBLIC_CIVITAS_API_URL is not set')
  }

  // Trim any trailing slash from the API URL
  const trimmedApiUrl = apiUrl.replace(/\/+$/, '')

  return {
    apiUrl: trimmedApiUrl,
  }
}

export const config = getConfig()
