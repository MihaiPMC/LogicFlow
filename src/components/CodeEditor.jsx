import { Editor } from "@monaco-editor/react";
import { useState, useEffect } from "react";
import { useRef } from "react";
const CodeEditor = () => {
    function handleEditorMount(editor, monaco) {
        editorRef.current = editor;
        editor.focus();
    
        // Înregistrează limbajul personalizat
        monaco.languages.register({ id: "pseudocode" });
    
        const keywords = ["citeste", "scrie", "daca", "atunci", "altfel"];

        let regkw = new RegExp(keywords.join("|"));
    
        // Setează regulile de tokenizare (highlighting) pentru pseudocode
        monaco.languages.setMonarchTokensProvider("pseudocode", {
          keywords,
          tokenizer: {
            root: [
              [regkw, "keyword"],
              [/[a-zA-Z_]\w*/, "identifier"],
              [/\d+/, "number"],
              [/".*?"/, "string"],
              [/[+\-*/=<>!]+/, "operator"],
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
        monaco.languages.registerCompletionItemProvider("pseudocode", {
          provideCompletionItems: () => ({
            suggestions: keywords.map((kw) => ({
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
            { token: "operator", foreground: "d4d4d4" },
          ],
          colors: {},
        });

        monaco.editor.setTheme("pseudocode-theme");
      }

  const [code, setCode] = useState("");
  const editorRef = useRef();

  return (
    <Editor
      className="w-75% h-[50vh]"
      theme="pseudocode-theme"
      defaultLanguage="pseudocode"
      defaultValue="// some comment"
      onMount={handleEditorMount}
      value={code}
      onChange={(value) => setCode(value)}
    />
  );
};

export default CodeEditor;
