import { addToAvailableVariables } from "./action";

export interface HomePageState {
  availableVariables: string[];
}

export type HomePageAction = ReturnType<typeof addToAvailableVariables>;
