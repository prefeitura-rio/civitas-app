export const LOAD_CARS_PATH = "LOAD_CARS_PATH";
export const REQUEST_CARS_PATH = "REQUEST_CARS_PATH";
export const REQUEST_CARS_PATH_SUCCESS = "REQUEST_CARS_PATH_SUCCESS";
export const REQUEST_CARS_PATH_FAILED = "REQUEST_CARS_PATH_FAILED";

export const loadCarsPath = (params) => {
  return {
    type: LOAD_CARS_PATH,
    params: params
  };
};

export const requestCarsPath = () => {
  return {
    type: REQUEST_CARS_PATH
  };
};

export const requestCarsPathSuccess = (dataFromApi) => {
  return {
    type: REQUEST_CARS_PATH_SUCCESS,
    payload: dataFromApi,
  };
};

export const requestCarsPathFailed = () => {
  return {
    type: REQUEST_CARS_PATH_FAILED,
  };
};
