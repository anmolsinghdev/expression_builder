import { combineReducers } from "redux";
import HomePageReducer from "./home/reducer";

const allReducer = combineReducers({
  home: HomePageReducer,
});

export default allReducer;
