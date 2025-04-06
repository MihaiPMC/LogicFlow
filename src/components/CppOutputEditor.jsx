import React, { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { lexer } from '../interpretor/lexer';
import { parser } from '../interpretor/parser';
import { generateCPP } from '../transpiler/cppTranspiler';

const CppOutputEditor = ({ pseudocode, refactoredCode, fontSize, editorTheme, wordWrap }) => {
  const [cppCode, setCppCode] = useState('// Codul C++ va apărea aici');
  const [transpileError, setTranspileError] = useState(null);

  useEffect(() => {
    try {
      // Reset error state
      setTranspileError(null);
      
      // Transpilăm codul refactorizat dacă există, altfel pseudocodul original
      const codeToTranspile = refactoredCode || pseudocode;
      
      // Transpilăm codul doar dacă avem pseudocod
      if (codeToTranspile && codeToTranspile.trim() !== '') {
        const tokens = lexer(codeToTranspile);
        const ast = parser(tokens);
        const generatedCode = generateCPP(ast);
        setCppCode(generatedCode);
      } else {
        setCppCode('// Scrie pseudocod în partea stângă pentru a genera cod C++');
      }
    } catch (error) {
      console.error('Eroare de transpilare:', error);
      setTranspileError(error);
      setCppCode(`// Eroare în transpilare:\n// ${error.message}\n// Verifică consola pentru mai multe detalii.`);
    }
  }, [pseudocode, refactoredCode]);

  return (
    <div className="h-full">
      {transpileError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 mb-2 rounded">
          <strong>Eroare de transpilare:</strong> {transpileError.message}
        </div>
      )}
      <Editor
        className="h-[50vh]"
        theme={editorTheme === "light" ? "vs" : "vs-dark"}
        defaultLanguage="cpp"
        value={cppCode}
        options={{
          readOnly: true,
          automaticLayout: true,
          padding: { top: 20 },
          wordWrap: wordWrap ? 'on' : 'off',
          minimap: { enabled: false },
          fontSize: parseInt(fontSize, 10),
        }}
      />
    </div>
  );
};

export default CppOutputEditor;
