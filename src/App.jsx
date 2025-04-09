import CodeEditor from "./components/CodeEditor";
import OutputConsole from "./components/OutputConsole";
import NavBar from "./components/NavBar";
import { useState, useEffect } from "react";
import { interpretor } from "./interpretor/interpretor";
const App = () => {
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");

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
    setOutput("");
    const outputVariables = interpretor(code, outputToConsole);
  };

  return (
    <>
      <NavBar runCode={runCode} />
      <div className="h-auto px-6 py-8 text-gray-800 flex flex-col gap-2">
        <CodeEditor onCodeChange={setCode} />
        <OutputConsole output={output} />
      </div>
    </>
  );
};

export default App;
