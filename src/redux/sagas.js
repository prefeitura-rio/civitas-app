import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { LOAD_ACTIVE_CALLS, requestActiveCalls, requestActiveCallsFailed, requestActiveCallsSuccess } from "./calls/actions";
import { getActiveCalls, getCarsPath, logOut, login } from "../api";
import { LOGIN, LOG_OUT, loginFail, loginRequest, loginSuccess } from "./auth/actions";
import { LOAD_CARS_PATH, requestCarsPath, requestCarsPathFailed, requestCarsPathSuccess } from "./cars/actions";


// -----------------------------------------------------//

// CALLS

function* workerLoadActiveCalls(action) {
  try {
    yield put(requestActiveCalls());
    const data = yield call(getActiveCalls);
    yield put(requestActiveCallsSuccess(data));
  } catch (error) {
    console.error(error);
    yield put(requestActiveCallsFailed());
  }
}

export function* watchLoadActiveCalls() {
  yield takeEvery(LOAD_ACTIVE_CALLS, workerLoadActiveCalls);
}

// -----------------------------------------------------//
// CARS

function* workerLoadCarsPath(action) {
  try {
    yield put(requestCarsPath());
    console.log("action.params",action.params)
    const data = yield call(getCarsPath,action.params);
    yield put(requestCarsPathSuccess(data));
  } catch (error) {
    console.error(error);
    yield put(requestCarsPathFailed());
  }
}

export function* watchLoadCarsPath() {
  yield takeEvery(LOAD_CARS_PATH, workerLoadCarsPath);
}

// -----------------------------------------------------//

// AUTH

function* workerLogin() {
  try {
    yield put(loginRequest());
    const data = yield call(login);
    yield put(loginSuccess(data));
  } catch (error) {
    console.log(error);
    yield put(loginFail());
  }
}

export function* watchLogin() {
  yield takeEvery(LOGIN, workerLogin);
}

function* workerLogOut() {
  try {
    yield call(logOut);
  } catch (error) {
    console.log(error);
  }
}

export function* watchLogOut() {
  yield takeEvery(LOG_OUT, workerLogOut);
}
// -----------------------------------------------------//

// ROOT SAGA

export function* rootSaga() {
  yield all([
   fork(watchLoadActiveCalls),
   fork(watchLoadCarsPath),
   fork(watchLogin),
   fork(watchLogOut),
  ]);
}
