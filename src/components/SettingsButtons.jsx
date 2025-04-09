import { useEffect, useState } from "react";
const SettingsButton = ({ openSettings }) => {

  const [buttonText, setButtonText] = useState(window.innerWidth < 768 ? "⚙" : "Setări ⚙");

  useEffect(() => {
    const handleResize = () => {
      setButtonText(window.innerWidth < 768 ? "⚙" : "Setări ⚙");
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <button
      className="inline-block bg-amber-500 hover:bg-amber-600 py-2 px-6 font-mono font-bold text-neutral-100 m-4 rounded-2xl hover:cursor-pointer transition-all duration-150 w-44"
      onClick={openSettings}
    >
      {buttonText}
    </button>
  );
};

export default SettingsButton;
