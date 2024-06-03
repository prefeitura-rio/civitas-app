import { SET_ACTIVE_UNDER_APP_BAR } from "./actions";
import { HOME_UNDER_APP_BAR } from "./actions";

const defaultState = {
  activeUnderAppBar: HOME_UNDER_APP_BAR,
};

export const activeReducer = (state = defaultState, action) => {
  switch (action.type) {
    case SET_ACTIVE_UNDER_APP_BAR:
      return {
        ...state,
        activeUnderAppBar: action.payload,
      };

  }
  return state;
};

export default activeReducer;
