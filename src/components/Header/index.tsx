import React from "react";

interface HeaderProps {}
const Header = (props: HeaderProps) => {
  return (
    <div className="sticky top-0 p-4 z-40 lg:z-50 w-full max-w-8xl mx-auto bg-purple-700 flex-none flex ">
      <div className="flex-none pl-4 sm:pl-6 xl:pl-8 flex items-center  lg:border-b-0 lg:w-60 xl:w-72 text-white text-xl">
        Expression Editor
      </div>
      <div className=" flex-1  text-white  h-18 flex items-center justify-between px-4 sm:px-6 lg:mx-6 lg:px-0 xl:mx-8">
        {" "}
        <div className="ml-auto">
          <a
            href="https://github.com/Aashishgtbit/expression-editor"
            target="_blank"
            rel="noreferrer"
          >
            Github
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
