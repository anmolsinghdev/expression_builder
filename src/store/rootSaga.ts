import { all,  ForkEffect } from "redux-saga/effects";

const task: ForkEffect<never>[] = [];

const rootSaga = function* rootSaga() {
  yield all(task);
};

export default rootSaga;
