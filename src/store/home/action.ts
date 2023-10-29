import { ActionTypes } from "../actionTypes";

export const addToAvailableVariables = (item: string) => {
  return <const>{
    type: ActionTypes.ADD_TO_AVAILABLE_VARIABLES,
    payload: item,
  };
};
