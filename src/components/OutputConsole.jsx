import React, { useRef, useEffect } from 'react';

const OutputConsole = ({ output, textColor }) => {
  const consoleEndRef = useRef(null);

  // Auto-scroll la fiecare actualizare a output-ului
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [output]);

  return (
    <div className="mt-4">
      <h2 className="text-xl font-bold text-white mb-2">Consolă</h2>
      <div className="bg-gray-900 rounded p-4 h-[20vh] overflow-auto">
        {output.length === 0 ? (
          <p className="text-gray-400">Rulează codul pentru a vedea rezultatul...</p>
        ) : (
          <>
            <div className={`font-mono text-${textColor}`}>
              {output.map((line, index) => (
                <div key={index}>{line}</div>
              ))}
            </div>
            <div ref={consoleEndRef} />
          </>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;
