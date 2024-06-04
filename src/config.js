// This function will validate and return the environment variables
export const getConfig = () => {
  const apiUrl = process.env.REACT_APP_CIVITAS_API_URL;
  if (!apiUrl) {
    throw new Error("REACT_APP_CIVITAS_API_URL is not set");
  }

  // Trim any trailing slash from the API URL
  const trimmedApiUrl = apiUrl.replace(/\/+$/, "");

  return {
    apiUrl: trimmedApiUrl,
  };
};
