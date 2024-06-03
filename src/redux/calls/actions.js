export const LOAD_ACTIVE_CALLS = "LOAD_ACTIVE_CALLS";
export const REQUEST_ACTIVE_CALLS = "REQUEST_ACTIVE_CALLS";
export const REQUEST_ACTIVE_CALLS_SUCCESS = "REQUEST_ACTIVE_CALLS_SUCCESS";
export const REQUEST_ACTIVE_CALLS_FAILED = "REQUEST_ACTIVE_CALLS_FAILED";

export const loadActiveCalls = () => {
  return {
    type: LOAD_ACTIVE_CALLS,
  };
};

export const requestActiveCalls = () => {
  return {
    type: REQUEST_ACTIVE_CALLS
  };
};

export const requestActiveCallsSuccess = (dataFromApi) => {
  return {
    type: REQUEST_ACTIVE_CALLS_SUCCESS,
    payload: dataFromApi,
  };
};

export const requestActiveCallsFailed = () => {
  return {
    type: REQUEST_ACTIVE_CALLS_FAILED,
  };
};
