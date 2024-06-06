import { ERASE_ERROR, SHOW_ERROR } from "./actions";

const defaultState = {
  error: false,
  message: "",
  status: "",
  severity: "error"
};

export const errorReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SHOW_ERROR:
      return {
        ...state,
        error: true,
        message: action.payload.message,
        status: action.payload.status,
        severity: action.payload.severity
      };
    case ERASE_ERROR:
      return {
        ...state,
        error: false,
        message: "",
        status: "",
        severity: "error"
      };

  }
  return state;
};

export default errorReducer;
