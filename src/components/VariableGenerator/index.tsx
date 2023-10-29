import React, { useState } from "react";
import { connect } from "react-redux";
import { Dispatch } from "redux";
import { addToAvailableVariables } from "../../store/home/action";
import { StoreState } from "../../store";

// eslint-disable-next-line react-refresh/only-export-components
const VariableGenerator = (
  props: ReturnType<typeof mapStateToProps> &
    ReturnType<typeof mapDispatchToProps>
) => {
  const [variableName, setVariableName] = useState("");

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setVariableName(value);
  };
  const handleSubmit = (
    event:
      | React.FormEvent<HTMLFormElement>
      | React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();
    props.addToVariables(variableName);
    setVariableName("");
  };
  return (
    <div className="">
      <div className="text-l  font-bold">Variable Generator</div>
      <form onSubmit={handleSubmit}>
        <input
          className=" pl-2 focus:border-purple-500  ring-1 ring-purple-700 focus:ring-2 focus:ring-purple-500 focus:outline-none rounded   h-8 mt-4  items-center justify-center "
          type="text"
          value={variableName}
          placeholder="Enter varaible name"
          onChange={handleOnChange}
        />
        <button
          onClick={handleSubmit}
          className="focus:border-purple-500  ml-5 focus:ring-1 focus:ring-purple-500 focus:outline-none w-16 h-8 mt-4  items-center justify-center rounded-full bg-purple-700 text-white"
        >
          Add
        </button>
      </form>

      <div className="mt-4">
        <div className="text-l  font-bold">Available Variables</div>
        <ul>
          {props.availableVariables.length ? (
            props.availableVariables.map((item) => {
              return <li>{item}</li>;
            })
          ) : (
            <li>No Variables Found! </li>
          )}
        </ul>
      </div>
    </div>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    availableVariables: state.home.availableVariables,
  };
};

const mapDispatchToProps = (dispatch: Dispatch) => {
  return {
    addToVariables: (variable: string) => {
      dispatch(addToAvailableVariables(variable));
    },
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(VariableGenerator);
