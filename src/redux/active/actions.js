export const SET_ACTIVE_UNDER_APP_BAR = "SET_ACTIVE_UNDER_APP_BAR";
export const HOME_UNDER_APP_BAR = "HOME_UNDER_APP_BAR";
export const CAMERAS_UNDER_APP_BAR = "CAMERAS_UNDER_APP_BAR";
export const MAPAS_UNDER_APP_BAR = "MAPAS_UNDER_APP_BAR";
export const PROTOCOLOS_UNDER_APP_BAR = "PROTOCOLOS_UNDER_APP_BAR";
export const CERCO_DIGITAL_UNDER_APP_BAR = "CERCO_DIGITAL_UNDER_APP_BAR";
export const LOGIN_UNDER_APP_BAR = "LOGIN_UNDER_APP_BAR";

export const setActiveUnderAppBar = (activeUnderAppBar) => {
  return {
    type: SET_ACTIVE_UNDER_APP_BAR,
    payload: activeUnderAppBar,
  };
};