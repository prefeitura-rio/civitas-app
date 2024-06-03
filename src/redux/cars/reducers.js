import {
  REQUEST_CARS_PATH_SUCCESS,
  REQUEST_CARS_PATH_FAILED,
  REQUEST_CARS_PATH,
} from "./actions";

const defaultState = {
  all: null,
  loading: false,
  error: false,
};

const carsReducer = (state = defaultState, action) => {
  switch (action.type) {
    case REQUEST_CARS_PATH:
      return {
        ...state,
        all: null,
        loading: true,
        error: false,
      };
    case REQUEST_CARS_PATH_SUCCESS:
      return {
        ...state,
        all: action.payload,
        loading: false,
        error: false,
      };
    case REQUEST_CARS_PATH_FAILED:
      return {
        ...state,
        all: null,
        loading: false,
        error: true,
      };
  }
  return state;
};

export default carsReducer;
