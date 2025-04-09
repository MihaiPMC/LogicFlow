import React from 'react'

const CodeSnippet = ({ code }) => {

  let formattedCode = ''
  for ( let i = 0; i < code.length; i ++ ) {
    if ( code[i] === "\\" && code[i + 1] === 'n' ) {
      formattedCode += "\n";
      i ++;
    }
    else {
      formattedCode += code[i];
    }
  }
    
  return (
    <>
        <pre className="bg-gray-800 text-gray-100 p-4 rounded font-mono overflow-auto mb-4">
          <code>
{formattedCode}
          </code>
        </pre>
    </>
  )
}

export default CodeSnippet