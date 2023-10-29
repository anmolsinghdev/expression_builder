import React, { useCallback, useMemo, useState } from "react";
import { Mention, MentionsInput } from "react-mentions";
import { defaultMentionStyles } from "./defaultMentionStyles";
import "./style.scss";
import { Parser } from "../Parser";
import { connect } from "react-redux";
import { StoreState } from "../../store";
interface ExpressionEditorProps {}

const ExpressionEditor = (
  props: ExpressionEditorProps & ReturnType<typeof mapStateToProps>
) => {
  const [value, setValue] = useState("");
  const [logicErrorText, setLogicErrorText] = useState("");
  const hanldeAreaInputValue = (val: any) => {
    setValue(val);
  };

  const highlighterSubString = document.getElementsByClassName(
    "customMentionInput__highlighter__substring"
  );

  const dataSetForLogic = useMemo(() => {
    const data: any = [];
    props.availableVariables.forEach((item: string) => {
      const obj = { id: item, display: item };
      data.push(obj);
    });
    return data;
  }, [props.availableVariables]);

  const validate = useCallback(() => {
    const parser = new Parser(value, props.availableVariables);
    try {
      const expr = parser.Parse();
      const pretty = expr.PrettyMath();
      console.log("expr :", expr);

      setLogicErrorText("");
    } catch (exp) {
      console.log("exp :", exp);

      const errorTokenData = exp.token;
      if (errorTokenData && highlighterSubString.length > 0) {
        const firstPart = value.substring(0, errorTokenData.index);
        const lastPart = value.substring(
          errorTokenData.index,
          errorTokenData.index + errorTokenData.text.length + 1
        );

        const finalValue = `${firstPart}<span style="text-decoration:underline; text-decoration-color:red;text-decoration-style: wavy; background-color: rgba(255,0,0,0.2);" >${errorTokenData.text}</span>${lastPart}  `;

        highlighterSubString[0].innerHTML = finalValue;
      }

      setLogicErrorText(exp.message);
    }
  }, [highlighterSubString, value, props.availableVariables]);

  return (
    <>
      <div className="wrapper-expression-input">
      <MentionsInput
          className="customMentionInput"
          id="logicTextArea"
          value={value}
          onChange={(
            event: { target: { value: string } },
            newValue: string,
            newPlainTextValue: string
          ) => {
            hanldeAreaInputValue(newPlainTextValue);
          }}
          style={defaultMentionStyles}
        >
          <Mention
            trigger={/(?:^|)(\$([^\s$]*))$/} // with space = /(?:^|\s)(\$([^\s\$]*))$/
            markup={`[____display____]`}
            data={dataSetForLogic}
            displayTransform={(id, display) => `$'${display}'`}
            appendSpaceOnAdd={true}
          />
        </MentionsInput>
      </div>
      <div className=" h-8 mt-4 flex  text-red-700 ">{logicErrorText}</div>
      <div className="flex-auto flex space-x-3">
        <button
          onClick={validate}
          className="focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none w-32 h-8 mt-4 flex items-center justify-center rounded-full bg-purple-700 text-white"
          type="submit"
        >
          Set
        </button>
      </div>
    </>
  );
};

const mapStateToProps = (state: StoreState) => {
  return {
    availableVariables: state.home.availableVariables,
  };
};

export default connect(mapStateToProps)(ExpressionEditor);
