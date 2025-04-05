import { useState, useEffect } from "react";
import CodeEditor from "./components/CodeEditor";
import OutputConsole from "./components/OutputConsole";
import NavBar from "./components/NavBar";
import SettingsOverlay from "./components/SettingsOverlay";
import InstructionsOverlay from "./components/InstructionsOverlay";
import CppOutputEditor from "./components/CppOutputEditor";
import { interpretor } from "./interpretor/interpretor";

function App() {
  // Starea codului pseudocod
  const [code, setCode] = useState(localStorage.getItem("code") || "");
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
  // Starea pentru a indica dacă codul rulează
  const [isRunning, setIsRunning] = useState(false);

  const handleRun = () => {
    // Salvează codul în localStorage
    localStorage.setItem("code", code);

    // Reinițializează output-ul și setează flag-ul de rulare
    setOutput([]);
    setIsRunning(true);

    // Funcție care adaugă output la consolă
    const outputToConsole = (text) => {
      setOutput((prevOutput) => [...prevOutput, text]);
    };

    try {
      // Execută interpretorul cu un timeout scurt pentru a permite reactualizarea interfeței
      setTimeout(() => {
        try {
          interpretor(code, outputToConsole, parseInt(maxIterations, 10));
        } catch (error) {
          outputToConsole(`Eroare: ${error.message}`);
        } finally {
          setIsRunning(false);
        }
      }, 50);
    } catch (error) {
      outputToConsole(`Eroare neașteptată: ${error.message}`);
      setIsRunning(false);
    }
  };

  // Salvează preferințele utilizatorului în localStorage
  useEffect(() => {
    localStorage.setItem("fontSize", fontSize);
    localStorage.setItem("editorTheme", editorTheme);
    localStorage.setItem("wordWrap", wordWrap);
    localStorage.setItem("maxIterations", maxIterations);
  }, [fontSize, editorTheme, wordWrap, maxIterations]);

  return (
    <div>
      <NavBar 
        runCode={handleRun} 
        openSettings={() => setShowSettings(true)} 
        openInfo={() => setShowInstructions(true)} 
      />
      <div className="container mx-auto mt-4 mb-4">
        <div className="flex flex-col space-y-4">
          <div className="flex space-x-4">
            <div className="w-1/2">
              <h2 className="text-xl font-bold text-white mb-2">Pseudocod</h2>
              <CodeEditor
                onCodeChange={setCode}
                fontSize={fontSize}
                editorTheme={editorTheme}
                wordWrap={wordWrap}
              />
            </div>

            <div className="w-1/2">
              <h2 className="text-xl font-bold text-white mb-2">Cod C++ generat</h2>
              <CppOutputEditor 
                pseudocode={code} 
                fontSize={fontSize}
                editorTheme={editorTheme}
                wordWrap={wordWrap}
              />
            </div>
          </div>
          
          <OutputConsole output={output} />
        </div>
      </div>

      {/* Overlay-uri pentru setări și instrucțiuni */}
      {showSettings && (
        <SettingsOverlay
          onClose={() => setShowSettings(false)}
          fontSize={fontSize}
          setFontSize={setFontSize}
          editorTheme={editorTheme}
          setEditorTheme={setEditorTheme}
          wordWrap={wordWrap}
          setWordWrap={setWordWrap}
          maxIterations={maxIterations}
          setMaxIterations={setMaxIterations}
        />
      )}

      {showInstructions && (
        <InstructionsOverlay onClose={() => setShowInstructions(false)} />
      )}
    </div>
  );
}

export default App;
