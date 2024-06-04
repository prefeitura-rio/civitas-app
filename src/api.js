import axios from 'axios';
import qs from "qs";
import { getConfig } from "./config";

const config = getConfig();

const api = axios.create({
  baseURL: config.apiUrl,
});

api.interceptors.request.use((config) => {
  // Try to get token from session storage
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      alert("Você está deslogado ou sua sessão expirou. Por favor, faça login novamente.")
      logOut();
      // TODO: Redirect to login or show message
    }
    return Promise.reject(error);
  },
);


export async function getActiveCalls(id = 4) {
  // TODO (future): implement this
  return [];
};

export async function getCarsPath(params) {
  const url = `https://staging.api.civitas.dados.rio/cars/path?placa=${params.placa}&start_time=${encodeURIComponent(
    params.startDate
  ).replace("T", "%20")}&end_time=${encodeURIComponent(params.endDate).replace(
    "T",
    "%20"
  )}`

  const response = await api.get(url);
  return (response.data);
};

// Authentication
export async function login(params) {
  try {
    const username = params.username;
    const password = params.password;
    const response = await api.post(
      "/auth/token",
      qs.stringify({
        username,
        password,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );
    const { access_token } = response.data;
    sessionStorage.setItem("token", access_token);
    alert("Logado com sucesso!")
  } catch (error) {
    console.error("Login failed:", error);
    // TODO: Handle error, e.g., show a notification
  }
}

export async function logOut() {
  sessionStorage.removeItem("token");
}
