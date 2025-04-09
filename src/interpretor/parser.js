import { Token } from './lexer.js'

class Node {
    constructor(type, value = null, children = []) {
        this.type = type
        this.value = value
        this.children = children
    }
    addChild(node) {
        this.children.push(node)
    }
    setChildren(children) {
        this.children = children
    }
    setValue(value) {
        this.value = value
    }
    setType(type) {
        this.type = type
    }
}

class ifNode{
    constructor(condition, thenBlock, elseBlock = null) {
        this.condition = condition
        this.thenBlock = thenBlock
        this.elseBlock = elseBlock
    }
}

function eatNewlines(tokens) {
    while (tokens.length > 0 && tokens[0].type === 'NEWLINE') {
        tokens.shift()
    }
}

export function parser(tokens, rec_level = 0) {
    let instructions = []

    while ( tokens.length > 0 && tokens[0].type !== 'EOF' ) {
        let currToken = tokens.shift()
        switch ( currToken.type ) {
            case 'KEYWORD':
                if ( currToken.value === 'citeste' ) {
                    let vars = []
                    while ( tokens.length > 0 && (tokens[0].type !== 'NEWLINE' && tokens[0].type !== 'EOF') ) {
                        vars.push(tokens.shift())
                    }
                    for ( let i = 0; i < vars.length; i++ ) {
                        if ( vars[i].type === 'IDENTIFIER' && ( i === vars.length - 1 || vars[i + 1].type === 'COMMA' ) ) {
                            instructions.push(new Node('INPUT', vars[i].value))
                        }
                        else if ( vars[i].type === 'COMMA' ) {
                            continue
                        }
                    }
                }
                else if ( currToken.value === 'scrie' ) {
                    let vars = []
                    while ( tokens.length > 0 && (tokens[0].type !== 'NEWLINE' && tokens[0].type !== 'EOF') ) {
                        vars.push(tokens.shift())
                    }
                    for ( let i = 0; i < vars.length; i++ ) {
                        if ( vars[i].type === 'IDENTIFIER' && ( i === vars.length - 1 || vars[i + 1].type === 'COMMA' ) ) {
                            instructions.push(new Node('OUTPUT', vars[i].value))
                        }
                        else if (vars[i].type === 'COMMA') {
                            continue
                        }
                        else {
                            // Avem o expresie
                            let expression = []
                            while (i < vars.length && vars[i].type !== 'COMMA') {
                                expression.push(vars[i])
                                i ++
                            }
                            let postfixExpression = shuntingYard(expression)
                            instructions.push(new Node('OUTPUTEXP', postfixExpression))
                        }
                    }
                }
                else if ( currToken.value === 'daca' ) {
                    let condition = []
                    eatNewlines(tokens)
                    while (tokens.length > 0 && tokens[0].value !== 'atunci' && tokens[0].type !== 'LBRACE') {
                        condition.push(tokens.shift())
                    }
                    if (tokens[0].value === 'atunci') {
                        tokens.shift() //Sari peste atunci
                    }
                    eatNewlines(tokens)
                    tokens.shift() //Sari peste {
                    eatNewlines(tokens)
                    let thenBlock = []
                    let brackets = 1
                    while (tokens.length > 0 && brackets > 0 && tokens[0].type !== 'EOF' ) {
                        if (tokens[0].type === 'LBRACE') {
                            brackets ++
                        }
                        else if (tokens[0].type === 'RBRACE') {
                            brackets --
                        }
                        thenBlock.push(tokens.shift())
                    }
                    eatNewlines(tokens)
                    let elseBlock = []
                    if (tokens[0] && tokens[0].value === 'altfel') {
                        tokens.shift() //Sari peste altfel
                        eatNewlines(tokens)
                        tokens.shift() //Sari peste {
                        eatNewlines(tokens)
                        brackets = 1
                        while (tokens.length > 0 && brackets > 0 && tokens[0].type !== 'EOF' ) {
                            if (tokens[0].type === 'LBRACE') {
                                brackets ++
                            }
                            else if (tokens[0].type === 'RBRACE') {
                                brackets --
                            }
                            elseBlock.push(tokens.shift())
                        }
                    }
                    let thenNode = null, elseNode = null
                    if ( thenBlock ) {
                        thenBlock.push(new Token('EOF', null))
                        thenNode = parser(thenBlock, rec_level + 1)
                    }
                    if ( elseBlock ) {
                        elseBlock.push(new Token('EOF', null))
                        elseNode = parser(elseBlock, rec_level + 1)
                    }
                    let postFixCondition = shuntingYard(condition)
                    console.log(postFixCondition)
                    let IFNode = new ifNode(postFixCondition, thenNode, elseNode)
                    instructions.push(new Node('IF', IFNode))
                }
            case 'IDENTIFIER':
                let varName = currToken.value
                if (tokens.length > 0 && tokens[0].type === 'ASSIGN') {
                    tokens.shift()
                    
                    let expression = []
                    while (tokens.length > 0 && tokens[0].type !== 'NEWLINE') {
                        expression.push(tokens.shift())
                    }
                    
                    // Transformam expresia din forma infixata in forma postfixata
                    let postfixExpression = shuntingYard(expression)
            
                    // Cream nodul de atribuire si il adaugam in lista
                    instructions.push(new Node("ASSIGNMENT", varName, postfixExpression))
                }
            default:
                break
        }
    }

    const program = new Node('PROGRAM', null, instructions)

    return program
}

function shuntingYard(tokens) {
    let output = []
    let stack = []

    function precedence(op) {
        if (op === 'not') return 5 // Operator unar NOT are cea mai mare prioritate
        if (op === '*' || op === '/' || op === '%') return 4
        if (op === '+' || op === '-') return 3
        if (op === '>' || op === '<') return 2
        if (op === 'si') return 1
        if (op === 'sau') return 0 // Cea mai mică prioritate
        return -1
    }

    while (tokens.length > 0) {
        let token = tokens.shift()

        if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
            output.push(token)
        }
        else if (token.type === 'OPERATOR') {
            while (
                stack.length > 0 &&
                stack[stack.length - 1].type === 'OPERATOR' &&
                precedence(stack[stack.length - 1].value) >= precedence(token.value)
            ) {
                output.push(stack.pop())
            }
            stack.push(token)
        }
        else if (token.type === 'LPAREN') {
            stack.push(token)
        }
        else if (token.type === 'RPAREN') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
                output.push(stack.pop())
            }
            stack.pop() // Elimină '('
        }
    }

    while (stack.length > 0) {
        output.push(stack.pop())
    }

    return output
}


// function shuntingYard(tokens) {
//     let output = []
//     let stack = []

//     while (tokens.length > 0) {
//         let token = tokens.shift()
//         if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
//             output.push(token)
//         }
//         else if (token.type === 'OPERATOR') {
//             while (stack.length > 0 && stack[stack.length - 1].type === 'OPERATOR') {
//                 let op1 = token.value
//                 let op2 = stack[stack.length - 1].value
//                 if (op1 === '+' || op1 === '-') {
//                     if (op2 === '*' || op2 === '/' || op2 === '%' || op2 === '+' || op2 === '-') {
//                         output.push(stack.pop())
//                     }
//                     else {
//                         break
//                     }
//                 }
//                 else if (op1 === '*' || op1 === '/' || op1 === '%') {
//                     if (op2 === '*' || op2 === '/' || op2 === '%') {
//                         output.push(stack.pop())
//                     }
//                     else {
//                         break
//                     }
//                 }
//             }
//             stack.push(token)
//         }
//         else if (token.type === 'LPAREN') {
//             stack.push(token)
//         }
//         else if (token.type === 'RPAREN') {
//             while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
//                 output.push(stack.pop())
//             }
//             stack.pop()
//         }
//     }

//     while (stack.length > 0) {
//         output.push(stack.pop())
//     }
//     return output
// }