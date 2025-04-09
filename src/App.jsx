import CodeEditor from "./components/CodeEditor";
import OutputConsole from "./components/OutputConsole";
import NavBar from "./components/NavBar";
const App = () => {
  return (
    <>
      <NavBar />
      <div className="h-auto px-6 py-8 text-gray-800 flex flex-col gap-2">
        <CodeEditor />
        <OutputConsole />
      </div>
    </>
  );
};

export default App;
