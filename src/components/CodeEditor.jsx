import { Editor } from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { useRef } from "react";
import AISolutionButton from "./AISolutionButton";

const CodeEditor = ({ onCodeChange, fontSize, editorTheme, wordWrap, refactoredCode }) => {
  const editorRef = useRef();
  const [monaco, setMonaco] = useState(null);

  function handleEditorMount(editor, monacoInstance) {
    editorRef.current = editor;
    setMonaco(monacoInstance);
    editor.focus();

    // Înregistrează limbajul personalizat
    monacoInstance.languages.register({ id: "pseudocode" });

    const keywords = ["citeste", "scrie", "daca", "atunci", "altfel", "cat timp", "pentru", "executa", "repeta", "pana cand"];
    const operators = ["sau", "si", "egal", "diferit", "not"];

    let regkw = new RegExp(`\\b(${keywords.join("|")})\\b`);
    let regop = new RegExp(`\\b(${operators.join("|")})\\b`);
    // Setează regulile de tokenizare (highlighting) pentru pseudocode
    monacoInstance.languages.setMonarchTokensProvider("pseudocode", {
      keywords,
      tokenizer: {
        root: [
          [regkw, "keyword"],
          [regop, "operator"],
          [/[a-zA-Z_]\w*/, "identifier"],
          [/\d+/, "number"],
          [/".*?"/, "string"],
          [/[+\-*=<>!]+/, "operator"],
          [/\/\//, { token: "comment", next: "@comment" }],
          [/\//, "operator"],
        ],

        comment: [
          [/.*/, "comment", "@pop"],
        ],
      },
    });

    // Configurarea limbajului (comentarii, paranteze etc.)
    monacoInstance.languages.setLanguageConfiguration("pseudocode", {
      comments: { lineComment: "//" },
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
      ],
    });

    // Configurare completare automată
    const autoComplete = ["citeste", "scrie", "daca", "atunci", "altfel", "sau", "si", "egal", "diferit", "not", "cat timp", "pentru", "executa", "repeta", "pana cand"];
    monacoInstance.languages.registerCompletionItemProvider("pseudocode", {
      provideCompletionItems: () => ({
        suggestions: autoComplete.map((kw) => ({
          label: kw,
          kind: monacoInstance.languages.CompletionItemKind.Keyword,
          insertText: kw,
        })),
      }),
    });

    // Definirea temei personalizate
    monacoInstance.editor.defineTheme("pseudocode-dark-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "keyword", foreground: "569cd6" },
        { token: "identifier", foreground: "9cdcfe" },
        { token: "number", foreground: "b5cea8" },
        { token: "string", foreground: "ce9178" },
        { token: "operator", foreground: "e8e4c9" },
        { token: "comment", foreground: "608b4e" },
      ],
      colors: {},
    });

    monacoInstance.editor.defineTheme("pseudocode-light-theme", {
      base: "vs", // Use the built-in light theme as the base
      inherit: true,
      rules: [
        { token: "keyword", foreground: "0000FF" },
        { token: "identifier", foreground: "000000" },
        { token: "number", foreground: "098658" },
        { token: "string", foreground: "A31515" },
        { token: "operator", foreground: "000000" },
        { token: "comment", foreground: "008000" },
      ],
      colors: {
        "editor.background": "#FFFFFF", // Set the editor background to white
      },
    });

    if (editorTheme === "light") {
      monacoInstance.editor.setTheme("pseudocode-light-theme");
    } else if (editorTheme === "dark") {
      monacoInstance.editor.setTheme("pseudocode-dark-theme");
    }

    // Trigger initial code change to populate the C++ view
    const initialCode = localStorage.getItem("code") || "// Scrie pseudocod aici";
    onCodeChange(initialCode);
  }

  const handleApplySolution = (solution) => {
    if (editorRef.current) {
      editorRef.current.setValue(solution);
      onCodeChange(solution);
    }
  };

  useEffect(() => {
    if (editorRef.current && monaco) {
      const editor = editorRef.current;
      editor.updateOptions({
        fontSize: parseInt(fontSize, 10),
        wordWrap: wordWrap ? "on" : "off",
      });
      monaco.editor.setTheme(editorTheme === "light" ? "pseudocode-light-theme" : "pseudocode-dark-theme");
    }
  }, [fontSize, editorTheme, wordWrap, monaco]);

  return (
    <div className="relative">
      {refactoredCode && (
        <AISolutionButton 
          refactoredCode={refactoredCode} 
          onApplySolution={handleApplySolution}
        />
      )}
      <Editor
        className="h-[50vh]"
        theme="pseudocode-theme"
        defaultLanguage="pseudocode"
        defaultValue={localStorage.getItem("code") || "// Scrie pseudocod aici"}
        onMount={handleEditorMount}
        onChange={(value) => {onCodeChange(value); localStorage.setItem("code", value);}}
        options={{
          automaticLayout: true, // Ensure the editor resizes automatically
          padding: { top: 20 }, // Add padding to the top
          wordWrap: wordWrap ? "on" : "off", // Enable word wrapping
          fontSize: parseInt(fontSize, 10),
        }}
      />
    </div>
  );
};

export default CodeEditor;