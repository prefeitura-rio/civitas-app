import {
  REQUEST_ACTIVE_CALLS_SUCCESS,
  REQUEST_ACTIVE_CALLS_FAILED,
  REQUEST_ACTIVE_CALLS,
} from "./actions";

const defaultState = {
  all: null,
  loading: false,
  error: false,
};

const callsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case REQUEST_ACTIVE_CALLS:
      return {
        ...state,
        all: null,
        loading: true,
        error: false,
      };
    case REQUEST_ACTIVE_CALLS_SUCCESS:
      return {
        ...state,
        all: action.payload,
        loading: false,
        error: false,
      };
    case REQUEST_ACTIVE_CALLS_FAILED:
      return {
        ...state,
        all: null,
        loading: false,
        error: true,
      };
  }
  return state;
};

export default callsReducer;
