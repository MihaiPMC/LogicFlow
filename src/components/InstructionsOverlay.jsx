import CodeSnippet from "./CodeSnippet";
import InstructionsParagraph from "./InstructionsParagraph";
import InstructionsTitle from "./InstructionsTitle";
const SettingsOverlay = ({ onClose }) => {
    return (
      <div className="fixed inset-0 flex justify-center items-center z-20 bg-gray-900 backdrop-blur-3xl opacity-90">
        <div className="bg-gray-100 p-8 rounded-lg shadow-lg w-[90%] md:w-1/2 z-30  overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-mono font-extrabold mb-4 underline">
            Instrucțiuni
          </h2>

          <h3 className="text-lg font-mono font-bold mt-4">Observatie! Nu exista tipuri, insa o variabila poate avea ca valoare numai un numar intreg sau rational.</h3>

          <InstructionsTitle text="1. Instrucțiunea de atribuire" />
          <InstructionsParagraph text='Variabilele pot fi atribuite cu un număr întreg sau rațional prin "=" sau "<-".' />
          <CodeSnippet code="a = 5\nb <- 3.14" />

          <InstructionsTitle text="2. Instrucțiunea de citire" />
          <InstructionsParagraph text="Variabilele pot fi citite de la tastatură folosind instrucțiunea 'citeste'." />
          <CodeSnippet code="citeste a, b, c\nciteste n" />

          <InstructionsTitle text="3. Instrucțiunea de afișare" />
          <InstructionsParagraph text="Variabilele sau textul pot fi afișate în consolă folosind instrucțiunea 'scrie'. Pentru a trece pe rând nou se folosește '\n'." />
          <CodeSnippet code='scrie "Hello, World!"\nscrie "a = ", a\nscrie x' />

          <InstructionsTitle text="4. Expresii matematice" />
          <InstructionsParagraph text="Expresiile matematice pot fi evaluate folosind operatorii +, -, *, /, %, [], unde [] reprezintă partea întreagă." />
          <CodeSnippet code='x = [x / 10]\na <- 3 * (2 - 5)\nscrie x % 2' />

          <InstructionsTitle text="5. Expresii booleene" />
          <InstructionsParagraph text="Expresiile booleene pot fi evaluate folosind operatorii <, >, <=, >=, = (==), !=, &&, ||, !. De asemenea, pot fi utilizate și cuvintele cheie 'si', 'sau', 'egal', 'diferit', 'not'." />
          <CodeSnippet code='scrie 2 < 3\nn <- not 0 si 1\nscrie x != y' />

          <InstructionsTitle text="6. Structuri de control" />
          <InstructionsParagraph text="Structurile de control pot fi utilizate pentru a controla fluxul programului." />
          <CodeSnippet code='daca x < 0 atunci\n    scrie "Negativ"\naltfel\n    scrie "Pozitiv"' />
          <InstructionsParagraph text="Dacă structura conține mai multe instrucțiuni, acestea trebuie cuprinse între acolade și se poate omite cuvântul 'atunci'." />
          <CodeSnippet code='daca x < 0 atunci {\n    scrie "Negativ"\n    x = -x\n}' />
          <InstructionsParagraph text="Instrucțiunea poate fi scrisă și mai compact." />
          <CodeSnippet code='daca x % 2 = 0 atunci scrie x, " e par"\naltfel scrie x, " e impar"' />

          <InstructionsTitle text="7. Structuri repetitive" />
          <InstructionsParagraph text="Pentru repetarea mai multor instrucțiuni, acestea trebuie cuprinse între acolade și se poate omite cuvântul 'executa'." />
          <InstructionsParagraph text="Pentru:" />
          <CodeSnippet code='pentru i = 1, 10 executa scrie i, " "\npentru i = 5, -5, -1 {\n    scrie i\n}\npentru i = 0, i < n, i = i + 2 executa\n    x = x + 1' />
          <InstructionsParagraph text="Cât timp:" />
          <CodeSnippet code='cat timp n diferit 0 executa {\n    cnt = cnt + 1\n    n = [n / 10]\n}\n// Mai compact:\ncat timp n != 0 executa cnt = cnt + 1; n = [n / 10]\nscrie cnt' />
          <InstructionsParagraph text="Repetă până când:" />
          <CodeSnippet code='repeta\n     x = x - 1\npana cand x egal 5\n// Mai compact:\nrepeta scrie x, " "; x = x - 1 pana cand x = 0' />

          <button
            className="mt-4 py-2 px-4 font-mono font-black bg-red-500 text-white rounded hover:bg-red-700 transition-all duration-500 hover:cursor-pointer"
            onClick={onClose}
          >
            Închide
          </button>
        </div>
      </div>
    );
  };
  
  export default SettingsOverlay;
  