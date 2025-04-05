import React from 'react';

const RunButton = ({ runCode }) => {
  return (
    <button
    className="inline-block bg-green-500 hover:bg-green-600 py-2 px-6 font-mono font-bold text-neutral-100 m-4 rounded-2xl hover:cursor-pointer transition-all duration-150 w-44"
    onClick={runCode}
    >
      <span className="hidden sm:inline">Rulează</span>
      <span className="ml-1">▶</span>
    </button>
  );
};

export default RunButton;
