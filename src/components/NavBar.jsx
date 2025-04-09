import RunButton from "./RunButton"
import SettingsButton from "./SettingsButton"
import InstructionsButton from "./InstructionsButton"
import { useState, useEffect } from "react";
const NavBar = ({ runCode, openSettings, openInfo }) => {

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
    <div className="bg-gradient-to-r from-cyan-950 via-cyan-700 to-cyan-950 text-white p-4 flex justify-between items-center sticky top-0 z-10 shadow-md shadow-black">
        {showTitle && <h1 className="font-mono font-extrabold text-2xl md:text-4xl mr-6">Rulează pseudocod</h1>}
        <InstructionsButton openInfo={openInfo} />
        <SettingsButton openSettings={openSettings} />
        <RunButton runCode={runCode}/>
    </div>
  )
}

export default NavBar