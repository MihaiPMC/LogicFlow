import CodeEditor from "./components/CodeEditor";
import OutputConsole from "./components/OutputConsole";
import NavBar from "./components/NavBar";
import { useState, useEffect } from "react";
import { interpretor } from "./interpretor/interpretor";
const App = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [textColor, setTextColor] = useState("white");

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
      const outputVariables = interpretor(code, outputToConsole);
    }
    catch (err) {
      setTextColor("red");
      setOutput("Eroare la interpretare: " + err.message);
    }
  };

  return (
    <>
      <NavBar runCode={runCode} />
      <div className="w-full h-auto px-6 py-8 text-gray-800 flex flex-col gap-2">
        <CodeEditor onCodeChange={setCode} />
        <OutputConsole output={output} textColor = {textColor}/>
      </div>
    </>
  );
};

export default App;
