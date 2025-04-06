import { useState, useEffect } from "react";
import CodeEditor from "./components/CodeEditor";
import OutputConsole from "./components/OutputConsole";
import NavBar from "./components/NavBar";
import SettingsOverlay from "./components/SettingsOverlay";
import InstructionsOverlay from "./components/InstructionsOverlay";
import CppOutputEditor from "./components/CppOutputEditor";
import { interpretor } from "./interpretor/interpretor";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AISolutionButton from "./components/AISolutionButton";

function App() {
  // Starea codului pseudocod
  const [code, setCode] = useState(localStorage.getItem("code") || "");
  // Starea pentru codul C++ generat
  const [cppCode, setCppCode] = useState("");
  // Starea pentru output-ul de la interpretor
  const [output, setOutput] = useState([]);
  // Starea pentru overlay-ul de setări
  const [showSettings, setShowSettings] = useState(false);
  // Starea pentru overlay-ul cu instrucțiuni
  const [showInstructions, setShowInstructions] = useState(false);
  // Starea pentru mărimea fontului
  const [fontSize, setFontSize] = useState(
    localStorage.getItem("fontSize") || "14"
  );
  // Starea pentru tema editorului
  const [editorTheme, setEditorTheme] = useState(
    localStorage.getItem("editorTheme") || "dark"
  );
  // Starea pentru word wrap
  const [wordWrap, setWordWrap] = useState(
    localStorage.getItem("wordWrap") === "true" || false
  );
  // Starea pentru limitarea iterațiilor
  const [maxIterations, setMaxIterations] = useState(
    localStorage.getItem("maxIterations") || "1000"
  );
  // Starea pentru modul AI asistat
  const [AIassisted, setAIassisted] = useState(
    localStorage.getItem("AIassisted") === "true" || false
  );
  // Starea pentru a indica dacă codul rulează
  const [isRunning, setIsRunning] = useState(false);
  // Starea pentru culoarea textului în consolă
  const [textColor, setTextColor] = useState("white");
  // Starea pentru codul refactorat de AI
  const [refactoredCode, setRefactoredCode] = useState(null);

  const updateSettings = (theme, fontSize, wordWrap, maxIterations, AIassisted) => {
    setEditorTheme(theme);
    setFontSize(fontSize);
    setWordWrap(wordWrap);
    setMaxIterations(maxIterations);
    setAIassisted(AIassisted);
  };

  const handleCppCodeChange = (newCppCode) => {
    setCppCode(newCppCode);
  };

  const handleRun = () => {
    // Salvează codul în localStorage
    localStorage.setItem("code", code);

    // Reinițializează output-ul și setează flag-ul de rulare
    setOutput([]);
    setIsRunning(true);
    setTextColor("white");
    setRefactoredCode(null); // Resetează codul refactorat

    // Funcție care adaugă output la consolă
    const outputToConsole = (text) => {
      // If text is empty string, clear the output
      if (text === "") {
        setOutput([]);
        return;
      }
      setOutput((prevOutput) => [...prevOutput, text]);
    };

    try {
      // Execută interpretorul cu un timeout scurt pentru a permite reactualizarea interfeței
      setTimeout(async () => {
        try {
          const result = await interpretor(code, outputToConsole, parseInt(maxIterations, 10), AIassisted);
          
          if (result && result !== 0) {
            setRefactoredCode(result);
            toast.info("Codul tau pare sa aiba erori, dar au fost corectate de AI!", {
              position: "bottom-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              theme: "light",
            });
          }
        } catch (error) {
          outputToConsole(`Eroare: ${error.message}`);
          setTextColor("red");
        } finally {
          setIsRunning(false);
        }
      }, 50);
    } catch (error) {
      outputToConsole(`Eroare neașteptată: ${error.message}`);
      setTextColor("red");
      setIsRunning(false);
    }
  };

  const handleApplySolution = (solution) => {
    setCode(solution);
    localStorage.setItem("code", solution);
  };

  // Salvează preferințele utilizatorului în localStorage
  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("editorTheme", editorTheme);
    localStorage.setItem("wordWrap", wordWrap);
    localStorage.setItem("maxIterations", maxIterations);
    localStorage.setItem("AIassisted", AIassisted);
  }, [fontSize, editorTheme, wordWrap, maxIterations, AIassisted]);

  return (
    <div>
      <NavBar 
        runCode={handleRun} 
        openSettings={() => setShowSettings(true)} 
        openInfo={() => setShowInstructions(true)}
        cppCode={cppCode}
      />
      <div className="container mx-auto mt-4 mb-4">
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <div className="flex items-center mb-2">
                <h2 className="text-xl font-bold text-white mr-3">Pseudocod</h2>
                {refactoredCode && (
                  <AISolutionButton 
                    originalCode={code}
                    refactoredCode={refactoredCode} 
                    onApplySolution={handleApplySolution}
                  />
                )}
              </div>
              <CodeEditor
                onCodeChange={setCode}
                fontSize={fontSize}
                editorTheme={editorTheme}
                wordWrap={wordWrap}
                code={code}
              />
            </div>

            <div className="w-1/2">
              <h2 className="text-xl font-bold text-white mb-2">C++</h2>
              <CppOutputEditor 
                pseudocode={code}
                refactoredCode={refactoredCode}
                fontSize={fontSize}
                editorTheme={editorTheme}
                wordWrap={wordWrap}
                onCppCodeChange={handleCppCodeChange}
              />
            </div>
          </div>
          
          <OutputConsole 
            output={output} 
            textColor={textColor} 
          />
        </div>
      </div>

      {/* Overlay-uri pentru setări și instrucțiuni */}
      {showSettings && (
        <SettingsOverlay
          onClose={() => setShowSettings(false)}
          fontSize={fontSize}
          editorTheme={editorTheme}
          wordWrap={wordWrap}
          maxIterations={maxIterations}
          updateSettings={updateSettings}
        />
      )}

      {showInstructions && (
        <InstructionsOverlay onClose={() => setShowInstructions(false)} />
      )}
      
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
    </div>
  );
}

export default App;

