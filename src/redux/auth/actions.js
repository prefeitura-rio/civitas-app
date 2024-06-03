export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAIL = "LOGIN_FAIL";
export const LOGIN = 'LOGIN'
export const LOG_OUT = "LOG_OUT";

export const loginRequest = () => {
  return {
    type: LOGIN_REQUEST,
  };
}; 

export const loginSuccess = (data) => {
  return {
    type: LOGIN_SUCCESS,
    payload: data,
  };
};

export const loginFail = () => {
  return {
    type: LOGIN_FAIL,
  };
};

export const login = () => {
    return {
      type: LOGIN,
    };
  };

  export const logOut = () => {
    return {
      type: LOG_OUT,
    };
  };


