import React from "react";
import ExpressionEditor from "../components/ExpressionEditor";
import Header from "../components/Header";
import VariableGenerator from "../components/VariableGenerator";
import "./style.scss";
interface HomeProps {}
function Home(props: HomeProps) {
  return (
    <div className="wrapper-home-screen">
      <Header />
      <div className=" flex-1 flex mx-auto flex-row pt-20  items-center ali md:container md:mx-auto  max-w-sm min-w-max ">
        <div className=" h-full flex-1 flex mx-auto flex-col   ali md:container md:mx-auto  max-w-sm min-w-max">
          <ExpressionEditor />
        </div>
        <div className=" h-full flex-1 flex mx-auto flex-col  items-center ali md:container md:mx-auto  max-w-sm min-w-max">
          <VariableGenerator />
        </div>
      </div>
    </div>
  );
}

export default Home;
