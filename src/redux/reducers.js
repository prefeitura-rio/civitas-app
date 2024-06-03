import { combineReducers } from "redux";
import callsReducer from "./calls/reducers";
import activeReducer from "./active/reducers";
import authReducer from "./auth/reducers";
import carsReducer from "./cars/reducers";

export default combineReducers({
calls: callsReducer,
active: activeReducer,
auth: authReducer,
cars: carsReducer,
});
