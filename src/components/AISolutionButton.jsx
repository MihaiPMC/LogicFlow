import React, { useState, useEffect } from 'react';
import { diffLines } from 'diff';

const AISolutionButton = ({ originalCode, refactoredCode, onApplySolution }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [diffResult, setDiffResult] = useState([]);
  
  useEffect(() => {
    if (showOverlay) {
      const differences = diffLines(originalCode || '', refactoredCode || '');
      setDiffResult(differences);
    }
  }, [showOverlay, originalCode, refactoredCode]);

  const handleApply = () => {
    onApplySolution(refactoredCode);
    setShowOverlay(false);
  };

  const handleClose = () => {
    setShowOverlay(false);
  };

  const renderDiff = (changes, isOriginal) => {
    return changes.map((part, index) => {
      // For original code: show removed parts in red, unchanged in normal
      // For refactored code: show added parts in green, unchanged in normal
      const isAddition = part.added;
      const isRemoval = part.removed;
      
      // Skip additions in original view and removals in refactored view
      if ((isOriginal && isAddition) || (!isOriginal && isRemoval)) {
        return null;
      }
      
      let className = '';
      if (isRemoval) className = 'bg-red-800 text-white';
      if (isAddition) className = 'bg-green-800 text-white';
      
      return (
        <span key={index} className={className}>
          {part.value}
        </span>
      );
    });
  };

  return (
    <>
      <button 
        className="border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white 
                  font-bold py-1 px-3 rounded transition-colors duration-200 text-sm"
        onClick={() => setShowOverlay(true)}
      >
        Arată modificările AI
      </button>
      
      {showOverlay && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800/90 backdrop-blur-md rounded-lg p-6 w-4/5 max-w-6xl max-h-[85vh] flex flex-col shadow-xl">
            <h2 className="text-white text-xl font-bold mb-4">Soluția propusă de AI</h2>
            
            <div className="flex flex-grow gap-4 mb-4 overflow-hidden">
              {/* Original Code Panel */}
              <div className="w-1/2 flex flex-col">
                <h3 className="text-white font-semibold mb-2">Codul original</h3>
                <div className="overflow-auto flex-grow bg-gray-900/80 rounded-lg p-4">
                  <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                    {renderDiff(diffResult, true)}
                  </pre>
                </div>
              </div>
              
              {/* Refactored Code Panel */}
              <div className="w-1/2 flex flex-col">
                <h3 className="text-white font-semibold mb-2">Codul refactorizat</h3>
                <div className="overflow-auto flex-grow bg-gray-900/80 rounded-lg p-4">
                  <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                    {renderDiff(diffResult, false)}
                  </pre>
                </div>
              </div>
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
