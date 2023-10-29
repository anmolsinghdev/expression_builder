import { ActionTypes } from "../actionTypes";
import { HomePageAction, HomePageState } from "./type";

const homePageInitialState: HomePageState = {
  availableVariables: [],
};

const HomePageReducer = (
  state: HomePageState = homePageInitialState,
  action: HomePageAction
): HomePageState => {
  switch (action.type) {
    case ActionTypes.ADD_TO_AVAILABLE_VARIABLES: {
      const newVariable = action.payload;
      const availableVariables = [...state.availableVariables, newVariable];
      return {
        ...state,
        availableVariables,
      };
    }
    default: {
      return { ...state };
    }
  }
};

export default HomePageReducer;
