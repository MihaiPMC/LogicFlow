import { useState, useEffect } from "react";
const RunButton = ({ runCode }) => {

  const [buttonText, setButtonText] = useState(window.innerWidth < 768 ? "▶" : "Run ▶");

  useEffect(() => {
    const handleResize = () => {
      setButtonText(window.innerWidth < 768 ? "▶" : "Run ▶");
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <button
      className="inline-block py-2 px-6 font-mono font-bold text-neutral-100 bg-green-600 m-4 rounded-2xl hover:cursor-pointer hover:bg-green-700 transition-all duration-150 w-44"
      onClick={runCode}
    >
      {buttonText} 
    </button>
  );
};

export default RunButton
