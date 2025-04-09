import { parser } from './parser.js'
import { evaluateNode } from './evaluator.js'
import { lexer } from './lexer.js'
export function interpretor(sourceCode, outputToConsole) {
    try {
        let tokens = lexer(sourceCode)
        let ast = parser(tokens)
        let variables = {}
        evaluateNode(ast, variables, outputToConsole)
        return variables
    }
    catch (err) {
        throw err
    }
}