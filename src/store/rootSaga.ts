import { all, put, takeEvery, call } from "redux-saga/effects";
import { camelCase } from "lodash";
import { Action, PayloadAction } from "@reduxjs/toolkit";
import * as api from "./api";
import { Song } from "../usersPages/songsList/types";
import { fetchFinishedAction, fetchStartAction } from "./fetchActions";
import { addSongSuccessAction } from "../adminPages/songs/admin_songs.actions";
import { getSongsAction } from "../usersPages/songsList/actions";

type ResultType = Song | Song[];
type ApiType = { [key: string]: any };

const FAILED = "_FAILED";
const SUCCESS = "_SUCCESS";
const REQUEST = "_REQUEST";
const REQUEST_FUNCTIONS: ApiType = api;

const funcNameFromReqAction = (type: string): string => {
  return camelCase(type.replace(REQUEST, ""));
};
const actionsTypeFixed = (type: string, newValue: string): string => {
  return type.replace(REQUEST, newValue);
};

function* requestSagaWorker(action: PayloadAction<any>) {
  try {
    yield put(fetchStartAction(action.type));
    const funcName: string = funcNameFromReqAction(action.type);
    const result: ResultType = yield call(
      REQUEST_FUNCTIONS[funcName],
      action.payload
    );
    const successType: string = actionsTypeFixed(action.type, SUCCESS);
    yield put({ type: successType, payload: result });
  } catch (err) {
    console.log("Error: ", (err as Error).message);
    const failedType: string = actionsTypeFixed(action.type, FAILED);
    yield put({ type: failedType, payload: err });
  } finally {
    yield put(fetchFinishedAction(action.type));
  }
}

function* addSongWorker() {
  yield put({ type: getSongsAction.type });
}

export function* rootSagaWatcher() {
  yield all([
    takeEvery(
      (action: Action) => /REQUEST$/.test(action.type),
      requestSagaWorker
    ),
    takeEvery(addSongSuccessAction, addSongWorker),
  ]);
}

export default function* rootSaga() {
  yield rootSagaWatcher();
}
