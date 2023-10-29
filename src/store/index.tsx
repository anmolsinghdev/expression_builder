import logger from "redux-logger";
import createSagaMiddleware from "redux-saga";

import { applyMiddleware, createStore } from "redux";

import rootSaga from "./rootSaga";
import reducers from "./combinedReducer";
import { HomePageState } from "./home/type";

const middlewares = [];
if (process.env.NODE_ENV === `development`) {
  middlewares.push(logger);
}

export interface StoreState {
  home: HomePageState;
}

const sagaMiddleware = createSagaMiddleware();

middlewares.push(sagaMiddleware);

const store = () => {
  let store = createStore(reducers, applyMiddleware(logger, sagaMiddleware));
  sagaMiddleware.run(rootSaga);
  return { store };
};

export default store;
