const OutputConsole = ({ output, textColor }) => {
  const consoleClass = textColor === "white" ? "h-[30vh] w-full font-mono bg-black resize-none border-4 border-[#1e1e1e] rounded-lg p-4 text-white" : "h-[30vh] w-full font-mono bg-black resize-none border-4 border-[#1e1e1e] rounded-lg p-4 text-red-600";
  return (
    <textarea
      className={consoleClass}
      placeholder={"Aici se va vedea ce scrie programul:\n"}
      readOnly 
      value={output}
    >
    </textarea>
  );
};

export default OutputConsole;
