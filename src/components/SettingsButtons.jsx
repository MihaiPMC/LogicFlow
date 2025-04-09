const SettingsButton = ({ openSettings }) => {
    return (
      <button
        className="inline-block ml-auto bg-amber-500 hover:bg-amber-600 py-2 px-6 font-mono font-bold text-neutral-100 m-4 rounded-2xl hover:cursor-pointer transition-all duration-150 w-44"
        onClick={openSettings}
      >
        Setări ⚙
      </button>
    );
  };
  
  export default SettingsButton;
  