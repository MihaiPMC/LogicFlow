const OutputConsole = () => {
    return (
      <textarea
        className="h-[30vh] w-full text-white font-mono bg-black resize-none border-4 border-gray-800 rounded-lg p-4"
        placeholder="Aici se va vedea ce scrie programul:"
        readOnly
      ></textarea>
    );
  };
  
  export default OutputConsole;
  