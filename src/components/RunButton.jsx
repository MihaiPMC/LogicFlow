import React from 'react';

const RunButton = ({ runCode }) => {
  return (
    <button
      onClick={runCode}
      className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-5 rounded-2xl hover:cursor-pointer transition-colors duration-300"
    >
      Rulează Codul
    </button>
  );
};

export default RunButton;
