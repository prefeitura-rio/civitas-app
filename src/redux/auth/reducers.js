import { LOGIN_FAIL, LOGIN_REQUEST, LOGIN_SUCCESS, LOG_OUT } from "./actions";

const defaultState = {
  profile: sessionStorage.getItem("gmc-user")
    ? JSON.parse(sessionStorage.getItem("gmc-user"))
    : null,
  loading: false,
  error: false,
};

const authReducer = (state = defaultState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        profile: null,
        loading: true,
        error: false,
      };
    case LOGIN_SUCCESS:
      return {
        ...state,
        profile: action.payload,
        loading: false,
        error: false,
      };
    case LOGIN_FAIL:
      return {
        ...state,
        profile: null,
        loading: false,
        error: true,
      };
    case LOG_OUT:
      return {
        ...state,
        profile: null,
        loading: false,
        error: false,
      };
  }
  return state;
};

export default authReducer;
