import CodeEditor from "./components/CodeEditor";
import OutputConsole from "./components/OutputConsole";
import NavBar from "./components/NavBar";
import { useState, useEffect, use } from "react";
import { interpretor } from "./interpretor/interpretor";
import SettingsOverlay from "./components/SettingsOverlay";
import InstructionsOverlay from "./components/InstructionsOverlay";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
  const [AIassisted, setAIassisted] = useState(localStorage.getItem("AIassisted") === "true");
  const updateSettings = (theme, fontSize, wordWrap, maxIterations, AIassisted) => {
    setTheme(theme);
    setFontSize(fontSize);
    setWordWrap(wordWrap);
    setMaxIterations(maxIterations);
    setAIassisted(AIassisted);
  }

  useEffect(() => {
    localStorage.setItem("theme", theme);
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("wordWrap", wordWrap);
    localStorage.setItem("maxIterations", maxIterations);
    localStorage.setItem("AIassisted", AIassisted);
  }, [theme, fontSize, wordWrap, maxIterations, AIassisted]);

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

  const runCode = async () => {
    let refactoredCode = 0;
    try {
      setOutput("");
      setTextColor("white");
      refactoredCode = await interpretor(code, outputToConsole, maxIterations, AIassisted);
    } catch (err) {
      setTextColor("red");
      setOutput("Eroare la interpretare: " + err.message);
    } finally {
      if (refactoredCode !== 0) {
        toast.info("Codul tau pare sa aive erori, dar au fost corectate de AI!", {
          position: "bottom-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          theme: "light",
        });
      }
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
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </>
  );
};

export default App;
