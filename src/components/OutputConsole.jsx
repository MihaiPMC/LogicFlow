import React, { useRef, useEffect } from 'react';

const OutputConsole = ({ output }) => {
  const consoleEndRef = useRef(null);

  // Auto-scroll la fiecare actualizare a output-ului
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  return (
    <div className="mt-4 p-4 bg-gray-800 rounded-md h-[20vh] overflow-y-auto text-white font-mono">
      <div className="text-lg font-bold border-b border-gray-700 mb-2 text-green-400">Output:</div>
      {output.length === 0 ? (
        <p className="text-gray-400">Rulați codul pentru a vedea rezultatele aici</p>
      ) : (
        <div className="space-y-1">
          {output.map((line, index) => (
            <div key={index} className="whitespace-pre-wrap">
              &gt; {line}
            </div>
          ))}
          <div ref={consoleEndRef} />
        </div>
      )}
    </div>
  );
};

export default OutputConsole;
