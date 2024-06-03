import axios from 'axios';
import { REACT_APP_API_KEY } from './config';


export async function getActiveCalls(id = 4) {
  const url = `https://api.rg.dados.rio/api/v${id}/Calls/GetActiveCalls`;
  const config = {
    headers: { Authorization: `Bearer ${REACT_APP_API_KEY}` }
  };
  const response = await axios.get(url, config);
  return (response.data);
};

export async function getCarsPath(params) {
  const url = `https://staging.api.civitas.dados.rio/cars/path?placa=${params.placa}&start_time=${encodeURIComponent(
    params.startDate
  ).replace("T", "%20")}&end_time=${encodeURIComponent(params.endDate).replace(
    "T",
    "%20"
  )}`

  const config = {
    headers: { Authorization: `Bearer ${REACT_APP_API_KEY}` }
  };
  const response = await axios.get(url, config);
  return (response.data);
};

// -----------------------------------------------------//

// @Gabriel
// Authentication
export async function login(username, password) {
  //TODO: ADD ENDPOINT TO ENV
  const response = await fetch('Endpoint_aqui', {
    method: 'POST',
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: JSON.stringify({ username, password })
  });

  const data = await response.json();
  const { access_token } = data;
  sessionStorage.setItem("token", access_token);

const profile = {
  username: data.username,
}
  return profile;
}

export async function logOut() {
  sessionStorage.removeItem("token");
}

// -----------------------------------------------------//