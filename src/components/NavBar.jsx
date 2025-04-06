import RunButton from "./RunButton"
import SettingsButton from "./SettingsButton"
import InstructionsButton from "./InstructionsButton"
import ComplexityButton from "./ComplexityButton"
import { useState, useEffect } from "react";

const NavBar = ({ runCode, openSettings, openInfo, cppCode }) => {
  const [showTitle, setShowTitle] = useState(window.innerWidth < 768 ? false : true);
  
  useEffect(() => {
    const handleResize = () => {
      setShowTitle(window.innerWidth < 768 ? false : true);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);
  
  return (
    <div className="bg-gradient-to-r from-orange-600 via-cyan-700 to-green-400 text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md shadow-black">
        {showTitle && (
          <div className="flex items-center">
            <img 
              src="/src/assets/favicon.ico" 
              alt="LogicFlow logo" 
              className="w-20 h-20 mr-2" 
            />
            <h1 className="font-inter font-extrabold text-2xl md:text-4xl">LogicFlow</h1>
          </div>
        )}
        <div className="flex justify-end items-center space-x-4 ml-auto">
          <RunButton runCode={runCode}/>
          <InstructionsButton openInfo={openInfo} />
          <SettingsButton openSettings={openSettings} />
          <ComplexityButton cppCode={cppCode} />
        </div>
    </div>
  )
}

export default NavBar