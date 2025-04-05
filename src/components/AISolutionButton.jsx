import React, { useState } from 'react';

const AISolutionButton = ({ refactoredCode, onApplySolution }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  
  const handleApply = () => {
    onApplySolution(refactoredCode);
    setShowOverlay(false);
  };

  const handleClose = () => {
    setShowOverlay(false);
  };

  return (
    <>
      <div className="absolute top-2 right-2 z-10">
        <button 
          className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white 
                    font-bold py-1 px-3 rounded transition-colors duration-200 text-sm"
          onClick={() => setShowOverlay(true)}
        >
          Arată soluția AI
        </button>
      </div>
      
      {showOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-3/4 max-w-4xl max-h-[80vh] flex flex-col">
            <h2 className="text-white text-xl font-bold mb-4">Soluția propusă de AI</h2>
            
            <div className="overflow-auto flex-grow mb-4">
              <pre className="text-white font-mono text-sm whitespace-pre-wrap p-4 bg-gray-900 rounded-lg">
                {refactoredCode}
              </pre>
            </div>
            
            <div className="flex justify-end space-x-4">
              <button 
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleClose}
              >
                Închide
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleApply}
              >
                Păstrează codul
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AISolutionButton;
