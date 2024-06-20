import { all, call, fork, put, takeEvery } from "redux-saga/effects";
import { LOAD_ACTIVE_CALLS, requestActiveCalls, requestActiveCallsFailed, requestActiveCallsSuccess } from "./calls/actions";
import { api, getActiveCalls, getCarsPath, login } from "../api";
import { LOGIN, LOG_OUT, logOut, loginFail, loginRequest, loginSuccess } from "./auth/actions";
import { LOAD_CARS_PATH, requestCarsPath, requestCarsPathFailed, requestCarsPathSuccess } from "./cars/actions";
import SnackBar from "../utils/SnackBar";
import { showError } from "./error/actions";
import { LOGIN_UNDER_APP_BAR, setActiveUnderAppBar } from "./active/actions";


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
    const data = yield call(getCarsPath, action.params);
    yield put(requestCarsPathSuccess(data));
  } catch (error) {
    yield put(requestCarsPathFailed());
    if (error) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            yield put(showError({ message: "Solicitação inválida. Por favor, verifique os parâmetros da sua solicitação.", status: 400 }));
            break;
          case 401:
            yield put(showError({ message: "Sua sessão expirou. Por favor, entre novamente.", status: 401, severity: "info" }));
            yield put(logOut());
            yield put(setActiveUnderAppBar(LOGIN_UNDER_APP_BAR));
            break;
          case 403:
            yield put(showError({ message: "Acesso proibido. Você não tem permissão para acessar este recurso.", status: 403 }));
            break;
          case 404:
            yield put(showError({ message: "Recurso não encontrado. Por favor, verifique a URL da sua solicitação.", status: 404 }));
            break;
          case 500:
            yield put(showError({ message: "Erro interno do servidor. Por favor, tente novamente mais tarde.", status: 500 }));
            break;
          default:
            yield put(showError({ message: "Um erro desconhecido ocorreu. Por favor, tente novamente mais tarde.", status: error.response.status }));
        }
      } else {
        yield put(showError({ message: "Um erro ocorreu ao tentar se conectar ao servidor. Por favor, verifique sua conexão de rede.", status: "" }));
      }
    }
  }
}

export function* watchLoadCarsPath() {
  yield takeEvery(LOAD_CARS_PATH, workerLoadCarsPath);
}

// -----------------------------------------------------//

// AUTH

function* workerLogin(action) {
  try {
    yield put(loginRequest());
    const data = yield call(login, action.params);
    yield put(loginSuccess(data));
  } catch (error) {
    yield put(loginFail());
    if (error) {
      if (error.response) {
        switch (error.response.status) {
          case 401:
            yield put(showError({ message: "Falha na autenticação. Por favor, verifique suas credenciais e tente novamente.", status: error.response.status, severity: "warning" }));
            break;
          case 403:
            yield put(showError({ message: "Acesso proibido. Você não tem permissão para acessar este recurso.", status: error.response.status }));
            break;
          case 500:
            yield put(showError({ message: "Erro interno do servidor. Por favor, tente novamente mais tarde.", status: error.response.status }));
            break;
          case 400:
            yield put(showError({ message: "Login ou senha inválido(s). Por favor, tente novamente!", status: error.response.status, severity: "warning" }));
            break;
          default:
            yield put(showError({ message: "Um erro desconhecido ocorreu. Por favor, tente novamente mais tarde.", status: error.response.status }));
        }
      } else {
        yield put(showError({ message: "Um erro ocorreu ao tentar se conectar ao servidor. Por favor, verifique sua conexão de rede.", status: "" }));
      }
    }
  }
}

export function* watchLogin() {
  yield takeEvery(LOGIN, workerLogin);
}

// -----------------------------------------------------//

// ROOT SAGA

export function* rootSaga() {
  yield all([
    fork(watchLoadActiveCalls),
    fork(watchLoadCarsPath),
    fork(watchLogin),
  ]);
}
