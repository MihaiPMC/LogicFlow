import CodeEditor from "./components/CodeEditor";
import OutputConsole from "./components/OutputConsole";
import NavBar from "./components/NavBar";
import { useState, useEffect, use } from "react";
import { interpretor } from "./interpretor/interpretor";
import SettingsOverlay from "./components/SettingsOverlay";
import InstructionsOverlay from "./components/InstructionsOverlay";
const App = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [textColor, setTextColor] = useState("white");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [fontSize, setFontSize] = useState(localStorage.getItem("fontSize") || "16");
  const [wordWrap, setWordWrap] = useState(localStorage.getItem("wordWrap") === "true");
  const [maxIterations, setMaxIterations] = useState(localStorage.getItem("maxIterations") || 100000);
  const updateSettings = (theme, fontSize, wordWrap, maxIterations) => {
    setTheme(theme);
    setFontSize(fontSize);
    setWordWrap(wordWrap);
    setMaxIterations(maxIterations);
  }

  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("wordWrap", wordWrap);
    localStorage.setItem("maxIterations", maxIterations);
  }, [theme, fontSize, wordWrap, maxIterations]);

  const handleOpenSettings = () => {setSettingsOpen(true)};
  const handleCloseSettings = () => {setSettingsOpen(false)};

  const handleOpenInfo = () => {setInfoOpen(true)};
  const handleCloseInfo = () => {setInfoOpen(false)};

  useEffect(() => {
    setCode(localStorage.getItem("code"));
  }, [code]);

  const outputToConsole = (text) => {
    for ( let i = 0; i < text.length; i ++ ) {
      if ( text[i] === "\\" && text[i + 1] === 'n' ) {
        setOutput((prevOutput) => prevOutput + "\n");
        i ++;
      }
      else {
        setOutput((prevOutput) => prevOutput + text[i]);
      }
    }
  }

  const runCode = () => {
    try {
      setOutput("");
      setTextColor("white");
      const outputVariables = interpretor(code, outputToConsole, maxIterations);
    }
    catch (err) {
      setTextColor("red");
      setOutput("Eroare la interpretare: " + err.message);
    }
  };

  return (
    <>
      <NavBar runCode={runCode} openSettings={handleOpenSettings} openInfo={handleOpenInfo} />
      <div className="w-full h-auto px-6 py-8 text-gray-800 flex flex-col gap-2">
        <CodeEditor onCodeChange={setCode} fontSize={fontSize} editorTheme={theme} wordWrap={wordWrap} />
        <OutputConsole output={output} textColor = {textColor}/>
      </div>
      {settingsOpen && <SettingsOverlay onClose={handleCloseSettings} updateSettings={updateSettings} />}
      {infoOpen && <InstructionsOverlay onClose={handleCloseInfo} />}
    </>
  );
};

export default App;
