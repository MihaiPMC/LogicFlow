import React, { useState, useEffect } from 'react';
import { diffLines } from 'diff';

const AISolutionButton = ({ originalCode, refactoredCode, onApplySolution }) => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [diffResult, setDiffResult] = useState([]);
  const [mergeResult, setMergeResult] = useState('');
  const [selectedChanges, setSelectedChanges] = useState({});
  
  useEffect(() => {
    if (showOverlay) {
      const differences = diffLines(originalCode || '', refactoredCode || '');
      setDiffResult(differences);
      
      // Initialize selected changes - by default, keep original code (don't select AI changes)
      const initialSelections = {};
      differences.forEach((part, index) => {
        if (part.added) {
          // Don't select additions by default (false for additions)
          initialSelections[index] = false;
        } else if (part.removed) {
          // Keep original code by default (false means don't remove)
          initialSelections[index] = false;
        }
      });
      setSelectedChanges(initialSelections);
      
      // Generate initial merge result
      updateMergeResult(differences, initialSelections);
    }
  }, [showOverlay, originalCode, refactoredCode]);
  
  const updateMergeResult = (diffs, selections) => {
    let result = '';
    diffs.forEach((part, index) => {
      if (part.added && selections[index]) {
        // Include selected additions
        result += part.value;
      } else if (part.removed && !selections[index]) {
        // Include removals only if NOT selected for removal
        result += part.value;
      } else if (!part.added && !part.removed) {
        // Always include unchanged parts
        result += part.value;
      }
    });
    setMergeResult(result);
  };

  // Find paired change (addition paired with removal or vice versa)
  const findPairedChangeIndex = (index) => {
    const part = diffResult[index];
    
    if (part.added) {
      // For an addition, look for preceding removal
      for (let i = index - 1; i >= 0; i--) {
        if (diffResult[i].removed) {
          return i;
        }
      }
    } else if (part.removed) {
      // For a removal, look for following addition
      for (let i = index + 1; i < diffResult.length; i++) {
        if (diffResult[i].added) {
          return i;
        }
      }
    }
    
    return -1;
  };

  const toggleChangeSelection = (index) => {
    const newSelections = {...selectedChanges};
    const pairedIndex = findPairedChangeIndex(index);
    
    const part = diffResult[index];
    
    if (part.added) {
      // If selecting an addition, also select the corresponding removal
      const currentValue = newSelections[index] || false;
      newSelections[index] = !currentValue;
      
      if (pairedIndex >= 0) {
        // Make paired selections opposite - if addition is selected, removal should be too
        newSelections[pairedIndex] = newSelections[index];
      }
    } 
    else if (part.removed) {
      // If selecting a removal, also deselect the corresponding addition
      const currentValue = newSelections[index] || false;
      newSelections[index] = !currentValue;
      
      if (pairedIndex >= 0) {
        // Make paired selections opposite - if removal is selected, addition should be deselected
        newSelections[pairedIndex] = newSelections[index];
      }
    }
    
    setSelectedChanges(newSelections);
    updateMergeResult(diffResult, newSelections);
  };

  const handleApply = () => {
    onApplySolution(mergeResult);
    setShowOverlay(false);
  };

  const handleApplyAll = () => {
    onApplySolution(refactoredCode);
    setShowOverlay(false);
  };

  const handleClose = () => {
    setShowOverlay(false);
  };

  const renderDiffLine = (part, index, isOriginal) => {
    const isAddition = part.added;
    const isRemoval = part.removed;
    
    // Skip additions in original view and removals in refactored view
    if ((isOriginal && isAddition) || (!isOriginal && isRemoval)) {
      return null;
    }
    
    let bgClass = '';
    let textClass = 'text-gray-300';
    
    if (isRemoval) {
      bgClass = selectedChanges[index] ? 'bg-red-900/60' : 'bg-red-700/60';
      textClass = 'text-white';
    }
    if (isAddition) {
      bgClass = selectedChanges[index] ? 'bg-green-700/60' : 'bg-green-900/60';
      textClass = 'text-white';
    }
    
    const canToggle = (isRemoval && isOriginal) || (isAddition && !isOriginal);
    
    // Find paired change if it exists
    const pairedIndex = findPairedChangeIndex(index);
    const pairedIsSelected = pairedIndex >= 0 ? selectedChanges[pairedIndex] : false;
    
    // Only allow toggling if this represents a valid user choice
    // (i.e., don't allow toggling both original and refactored to be selected/deselected)
    const isDisabled = canToggle && pairedIndex >= 0 && 
                      ((isRemoval && !selectedChanges[index] && !pairedIsSelected) || 
                       (isAddition && selectedChanges[index] && pairedIsSelected));
    
    return (
      <div 
        key={index} 
        className={`rounded px-1 py-0.5 my-0.5 ${bgClass} ${textClass} 
                   ${canToggle ? (isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:brightness-110') : ''} 
                   relative`}
        onClick={canToggle && !isDisabled ? () => toggleChangeSelection(index) : undefined}
        title={isDisabled ? "Nu puteți șterge atât codul original, cât și codul refactorizat pentru aceeași schimbare" : ""}
      >
        <div className="flex">
          {canToggle && (
            <div className="flex-shrink-0 w-5 mr-2 text-center">
              {isAddition ? (
                selectedChanges[index] ? '✓' : '+'
              ) : (
                !selectedChanges[index] ? '✓' : '×'
              )}
            </div>
          )}
          <pre className="font-mono text-sm whitespace-pre-wrap overflow-x-auto flex-grow">
            {part.value}
          </pre>
        </div>
      </div>
    );
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
          <div className="bg-gray-800/90 backdrop-blur-md rounded-lg p-6 w-11/12 max-w-7xl h-[90vh] flex flex-col shadow-xl">
            <h2 className="text-white text-xl font-bold mb-4">Soluția propusă de AI</h2>
            
            <div className="flex flex-col md:flex-row gap-4 flex-grow h-full overflow-hidden">
              <div className="md:w-1/3 flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-semibold">Codul original</h3>
                  <span className="text-xs text-gray-400">Linii roșii cu bifa sunt păstrate</span>
                </div>
                <div className="overflow-auto flex-grow bg-gray-900/80 rounded-lg p-3">
                  {diffResult.map((part, index) => renderDiffLine(part, index, true))}
                </div>
              </div>
              
              <div className="md:w-1/3 flex flex-col h-full">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-white font-semibold">Codul refactorizat</h3>
                  <span className="text-xs text-gray-400">Faceți clic pentru a include liniile verzi</span>
                </div>
                <div className="overflow-auto flex-grow bg-gray-900/80 rounded-lg p-3">
                  {diffResult.map((part, index) => renderDiffLine(part, index, false))}
                </div>
              </div>
              
              <div className="md:w-1/3 flex flex-col h-full">
                <h3 className="text-white font-semibold mb-2">Rezultat îmbinat</h3>
                <div className="overflow-auto flex-grow bg-gray-900/80 rounded-lg p-3">
                  <pre className="text-white font-mono text-sm whitespace-pre-wrap">
                    {mergeResult}
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-3 justify-end mt-4">
              <button 
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                onClick={handleClose}
              >
                Închide
              </button>
              <button 
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleApply}
              >
                Aplică selecțiile
              </button>
              <button 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                onClick={handleApplyAll}
              >
                Acceptă tot codul AI
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AISolutionButton;
