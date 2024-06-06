export const SHOW_ERROR = "SHOW_ERROR";
export const ERASE_ERROR = "ERASE_ERROR";

export const showError = (error) => {
  return {
    type: SHOW_ERROR,
    payload: error,
  };
};

export const eraseError = (error) => {
  return {
    type: ERASE_ERROR
  };
};