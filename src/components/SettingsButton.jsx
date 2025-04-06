import React from 'react';

const SettingsButton = ({ openSettings }) => {
  return (
    <button
      onClick={openSettings}
      className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-5 rounded-2xl hover:cursor-pointer transition-colors duration-300"
    >
      Setări
    </button>
  );
};

export default SettingsButton;
