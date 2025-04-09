import { Editor } from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { useRef } from "react";
const CodeEditor = ({ onCodeChange }) => {

  function handleEditorMount(editor, monaco) {
    editorRef.current = editor;
    editor.focus();

    // Înregistrează limbajul personalizat
    monaco.languages.register({ id: "pseudocode" });

    const keywords = ["citeste", "scrie", "daca", "atunci", "altfel", "cat timp", "pentru", "executa", "repeta", "pana cand"];
    const operators = ["sau", "si", "egal", "diferit", "not"];

    let regkw = new RegExp(`\\b(${keywords.join("|")})\\b`);
    let regop = new RegExp(`\\b(${operators.join("|")})\\b`);
    // Setează regulile de tokenizare (highlighting) pentru pseudocode
    monaco.languages.setMonarchTokensProvider("pseudocode", {
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
    monaco.languages.setLanguageConfiguration("pseudocode", {
      comments: { lineComment: "//" },
      brackets: [
        ["{", "}"],
        ["[", "]"],
        ["(", ")"],
      ],
    });

    // Configurare completare automată
    const autoComplete = ["citeste", "scrie", "daca", "atunci", "altfel", "sau", "si", "egal", "diferit", "not", "cat timp", "pentru", "executa", "repeta", "pana cand"];
    monaco.languages.registerCompletionItemProvider("pseudocode", {
      provideCompletionItems: () => ({
        suggestions: autoComplete.map((kw) => ({
          label: kw,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: kw,
        })),
      }),
    });

    // Definirea temei personalizate
    monaco.editor.defineTheme("pseudocode-theme", {
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

    monaco.editor.setTheme("pseudocode-theme");
  }

  const editorRef = useRef();

  return (
    <Editor
      className="h-[50vh]"
      theme="pseudocode-theme"
      defaultLanguage="pseudocode"
      defaultValue={localStorage.getItem("code") || "// Scrie pseudocod aici"}
      onMount={handleEditorMount}
      onChange={(value) => {onCodeChange(value); localStorage.setItem("code", value);}}
    />
  );
};

export default CodeEditor;
