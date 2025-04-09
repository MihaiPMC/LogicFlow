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

class whileNode {
    constructor(condition, block) {
        this.condition = condition
        this.block = block
    }
}

class forNode {
    constructor(init, condition, increment, block) {
        this.init = init
        this.condition = condition
        this.increment = increment
        this.block = block
    }
}

function eatNewlines(tokens) {
    while (tokens.length > 0 && tokens[0].type === 'NEWLINE') {
        tokens.shift()
    }
}

export function parser(tokens) {
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
                        if ( vars[i].type === 'IDENTIFIER') {
                            instructions.push(new Node('INPUT', vars[i].value))
                        }
                        else if ( vars[i].type === 'COMMA' ) {
                            continue
                        }
                        else {
                            throw new Error('Variabila invalida')
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
                        else if ( vars[i].type === 'STRING' ) {
                            instructions.push(new Node('OUTPUTSTR', vars[i].value))
                        }
                        else if (vars[i].type === 'COMMA') {
                            continue
                        }
                        else {
                            // Avem o expresie
                            let expression = []
                            let valid_expression = false
                            while (i < vars.length && vars[i].type !== 'COMMA' && vars[i].type !== 'NEWLINE' && vars[i].type !== 'EOF' && vars[i].type !== 'RBRACE' && vars[i].type !== 'LBRACE' && vars[i].type !== 'KEYWORD') {
                                if (vars[i].type === 'OPERATOR')
                                    valid_expression = true
                                expression.push(vars[i])
                                i ++
                            }
                            if (valid_expression || expression.length === 1) {
                                let postfixExpression = shuntingYard(expression)
                                instructions.push(new Node('OUTPUTEXP', postfixExpression))
                            }
                            else {
                                console.log('Invalid expression')
                            }
                        }
                    }
                }
                else if ( currToken.value === 'daca' ) {
                    let found_condition = false, found_then = false, found_else = false
                    let thenBlock = [], elseBlock = []
                    let condition = []
                    eatNewlines(tokens)
                    while (tokens.length > 0 && tokens[0].value !== 'atunci' && tokens[0].type !== 'LBRACE') {
                        condition.push(tokens.shift())
                    }
                    found_condition = true
                    if (tokens[0].value === 'atunci') {
                        tokens.shift() //Sari peste atunci
                        // E posibil sa fie un if scris pe o linie: daca <conditie> atunci <instr1> altfel <instr2>
                        if (tokens[0].value !== '{') {
                            // Daca nu avem acolade, atunci avem doar o singura instructiune
                            thenBlock = []
                            let ifs = 1
                            eatNewlines(tokens)
                            while (tokens.length > 0 && ifs > 0 && tokens[0].type !== 'EOF' && tokens[0].value !== '\n') {
                                if (tokens[0].value === 'daca') 
                                    ifs ++
                                else if (tokens[0].value === 'altfel'){
                                    ifs --
                                    if (ifs === 0) {
                                        break
                                    }
                                }
                                thenBlock.push(tokens.shift())
                            }
                            found_then = true
                            eatNewlines(tokens)
                            if (tokens[0] && tokens[0].value === 'altfel' && tokens[1].value !== '{') {
                                tokens.shift() //Sari peste altfel
                                eatNewlines(tokens)
                                elseBlock = []
                                while (tokens.length > 0 && tokens[0].type !== 'EOF' && tokens[0].type !== 'NEWLINE') {
                                    elseBlock.push(tokens.shift())
                                }
                                found_else = true
                            }
                        }
                    }
                    if (!found_then) {
                        eatNewlines(tokens)
                        tokens.shift() //Sari peste {
                        eatNewlines(tokens)
                        thenBlock = []
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
                    }
                    if (!found_else) {
                        eatNewlines(tokens)
                        elseBlock = []
                        if (tokens[0] && tokens[0].value === 'altfel') {
                            tokens.shift() //Sari peste altfel
                            eatNewlines(tokens)

                            // Putem avea un else fara acolade
                            if (tokens[0] && tokens[0].value !== '{') {
                                eatNewlines(tokens)
                                elseBlock = []
                                while (tokens.length > 0 && tokens[0].type !== 'EOF' && tokens[0].type !== 'NEWLINE') {
                                    elseBlock.push(tokens.shift())
                                }
                            }
                            else {
                                tokens.shift() //Sari peste {
                                eatNewlines(tokens)
                                let brackets = 1
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
                        }
                    }
                    let thenNode = null, elseNode = null
                    if ( thenBlock ) {
                        thenBlock.push(new Token('EOF', null))
                        thenNode = parser(thenBlock)
                    }
                    if ( elseBlock ) {
                        elseBlock.push(new Token('EOF', null))
                        elseNode = parser(elseBlock)
                    }
                    let postFixCondition = shuntingYard(condition)
                    console.log(postFixCondition)
                    let IFNode = new ifNode(postFixCondition, thenNode, elseNode)
                    instructions.push(new Node('IF', IFNode))
                }
                else if ( currToken.value === 'cat timp' ) {
                    // Cazul in care avem un while
                    let found_condition = false, found_then = false
                    let condition = []
                    let thenBlock = []
                    eatNewlines(tokens)
                    while (tokens.length > 0 && tokens[0].value !== 'executa' && tokens[0].type !== 'LBRACE') {
                        condition.push(tokens.shift())
                    }
                    found_condition = true

                    if (tokens[0].value === 'executa') {
                        tokens.shift() //Sari peste executa
                        eatNewlines(tokens)
                        // E posibil sa fie un while scris pe o linie: cat_timp <conditie> executa <instr1>
                        if (tokens[0].value !== '{') {
                            // Daca nu avem acolade, atunci avem doar o singura instructiune
                            thenBlock = []
                            while (tokens.length > 0 && tokens[0].type !== 'EOF' && tokens[0].value !== '\n') {
                                thenBlock.push(tokens.shift())
                            }
                            found_then = true
                        }
                    }
                    if(tokens[0].value === '{' && !found_then) {
                        tokens.shift() //Sari peste {
                        eatNewlines(tokens)
                        thenBlock = []
                        let brackets = 1
                        while (tokens.length > 0 && brackets > 0 && tokens[0].type !== 'EOF' ) {
                            if (tokens[0].type === 'LBRACE') {
                                brackets ++
                            }
                            else if (tokens[0].type === 'RBRACE') {
                                brackets --
                                if (brackets === 0) {
                                    break
                                }
                            }
                            thenBlock.push(tokens.shift())
                        }
                    }

                    let thenNode = null
                    if ( thenBlock ) {
                        thenBlock.push(new Token('EOF', null))
                        thenNode = parser(thenBlock)
                    }
                    let postFixCondition = shuntingYard(condition)

                    let WHILENode = new whileNode(postFixCondition, thenNode)
                    instructions.push(new Node('WHILE', WHILENode))
                }
                else if ( currToken.value === 'pentru' ) {
                    let found_condition = false, found_then = false
                    let condition = []
                    let thenBlock = []
                    eatNewlines(tokens)
                    while (tokens.length > 0 && tokens[0].value !== 'executa' && tokens[0].type !== 'LBRACE') {
                        condition.push(tokens.shift())
                    }
                    found_condition = true

                    if (tokens[0].value === 'executa') {
                        tokens.shift() //Sari peste executa
                        eatNewlines(tokens)
                        // E posibil sa fie un for scris pe o linie: pentru <conditie> executa <instr1>
                        if (tokens[0].value !== '{') {
                            eatNewlines(tokens)
                            // Daca nu avem acolade, atunci avem doar o singura instructiune
                            thenBlock = []
                            while (tokens.length > 0 && tokens[0].type !== 'EOF' && tokens[0].value !== '\n') {
                                thenBlock.push(tokens.shift())
                            }
                            found_then = true
                        }
                    }
                    if (tokens[0].value === '{' && !found_then) {
                        tokens.shift() //Sari peste {
                        eatNewlines(tokens)
                        thenBlock = []
                        let brackets = 1
                        while (tokens.length > 0 && brackets > 0 && tokens[0].type !== 'EOF' ) {
                            if (tokens[0].type === 'LBRACE') {
                                brackets ++
                            }
                            else if (tokens[0].type === 'RBRACE') {
                                brackets --
                                if (brackets === 0) {
                                    break
                                }
                            }
                            thenBlock.push(tokens.shift())
                        }
                    }

                    // Parsam conditia 
                    let init = [], cond = [], inc = []
                    while (condition.length > 0 && condition[0].type !== 'COMMA' && condition[0].type !== 'NEWLINE') {
                        init.push(condition.shift())
                    }
                    condition.shift() // Sari peste ,
                    while (condition.length > 0 && condition[0].type !== 'COMMA' && condition[0].type !== 'NEWLINE') {
                        cond.push(condition.shift())
                    }
                    condition.shift() // Sari peste ,
                    while (condition.length > 0) {
                        inc.push(condition.shift())
                    }

                    // Mai intai gasim variabila la care se refera for-ul
                    let varName = null
                    for ( let tk of init ) {
                        if (tk.type === 'IDENTIFIER') {
                            varName = tk.value
                            break
                        }
                    }
                    // Gasim expresia de initializare
                    let initExp = []
                    for ( let i = 0; i < init.length; i++ ) {
                        if ( init[i].type === 'ASSIGN' ) {
                            i ++
                            while ( i < init.length && init[i].type !== 'COMMA' ) {
                                initExp.push(init[i])
                                i ++
                            }
                            break
                        }
                    }

                    let tipFor = 'crescator'

                    // Acum parsam incrementarea si o "aranjam" daca nu exista sau daca are un singur element
                    if (inc.length === 0) {
                        // Daca nu avem incrementare, atunci incrementarea este cu 1
                        let newInc = []
                        newInc.push(new Token('IDENTIFIER', varName))
                        newInc.push(new Token('ASSIGN', '='))
                        newInc.push(new Token('IDENTIFIER', varName))
                        newInc.push(new Token('OPERATOR', '+'))
                        newInc.push(new Token('NUMBER', '1'))
                        inc = newInc
                    }
                    else if (inc.length === 1) {
                        // Daca avem doar un element, il aduna la variabila
                        if ( inc[0].type === 'NUMBER' && parseFloat(inc[0].value) < 0 ) {
                            tipFor = 'descrescator'
                        }
                        let newInc = []
                        newInc.push(new Token('IDENTIFIER', varName))
                        newInc.push(new Token('ASSIGN', '='))
                        newInc.push(new Token('IDENTIFIER', varName))
                        newInc.push(new Token('OPERATOR', '+'))
                        newInc.push(inc[0])
                        inc = newInc
                    }


                    // Parsam si "aranjam" conditia, daca are un singur element
                    if ( cond.length === 1 ) {
                        let newCond = []
                        newCond.push(new Token('IDENTIFIER', varName))
                        if ( tipFor === 'crescator' ) {
                            newCond.push(new Token('OPERATOR', '<='))
                        }
                        else {
                            newCond.push(new Token('OPERATOR', '>='))
                        }
                        newCond.push(cond[0])
                        cond = newCond
                    }

                    console.log("InitExp: ")
                    initExp = shuntingYard(initExp)
                    for( let tk of initExp ) {
                        console.log(tk.value)
                    }

                    init.push(new Token('EOF', null))
                    cond.push(new Token('EOF', null))
                    inc.push(new Token('EOF', null))
                    thenBlock.push(new Token('EOF', null))
                    const initNode = new Node('ASSIGNMENT', varName, shuntingYard(initExp))
                    const postFixCondition = shuntingYard(cond)
                    const incNode = parser(inc)
                    const thenNode = parser(thenBlock)
                    const FORNode = new forNode(initNode, postFixCondition, incNode, thenNode)
                    instructions.push(new Node('FOR', FORNode))
                }
                else if ( currToken.value === 'repeta' ) {
                    // Cazul in care avem un do-while
                    let found_condition = false, found_then = false
                    let condition = []
                    let thenBlock = []

                    let repetas = 1
                    while (tokens.length > 0 && repetas > 0 && tokens[0].type !== 'EOF' ) {
                        if (tokens[0].value === 'repeta') 
                            repetas ++
                        else if (tokens[0].value === 'pana cand') {
                            repetas --
                            if (repetas === 0) {
                                break
                            }
                        }
                        thenBlock.push(tokens.shift())
                    }

                    if (tokens[0].value === 'pana cand') {
                        tokens.shift() //Sari peste pana cand
                        eatNewlines(tokens)
                        condition = []
                        while (tokens.length > 0 && tokens[0].type !== 'EOF' && tokens[0].value !== '\n') {
                            condition.push(tokens.shift())
                        }
                        found_condition = true
                    }

                    let thenNode = null
                    if ( thenBlock ) {
                        thenBlock.push(new Token('EOF', null))
                        thenNode = parser(thenBlock)
                    }
                    let postFixCondition = shuntingYard(condition)

                    let DO_WHILENode = new whileNode(postFixCondition, thenNode)
                    instructions.push(new Node('DO-WHILE', DO_WHILENode))
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
    console.dir(program, { depth: null })
    return program
}

function shuntingYard(tokens) {

    function precedence(op) {
        if (op === 'not') return 6 
        if (op === '*' || op === '/' || op === '%') return 5
        if (op === '+' || op === '-') return 4
        if (op === '>' || op === '<' || op === '>=' || op === '<=') return 3
        if (op === 'egal' || op === 'diferit') return 2
        if (op === 'si') return 1
        if (op === 'sau') return 0
        return -1
    }

    let output = []
    let stack = []

    while (tokens.length > 0) {
        let token = tokens.shift()

        if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
            output.push(token)
        }
        else if (token.type === 'OPERATOR') {
            while (stack.length > 0 && stack[stack.length - 1].type === 'OPERATOR') {
                let op1 = token.value
                let op2 = stack[stack.length - 1].value

                if (precedence(op1) <= precedence(op2)) {
                    output.push(stack.pop())
                } else {
                    break
                }
            }
            stack.push(token)
        }
        else if (token.type === 'LSQUAREBRACE') {
            stack.push(token)
        }
        else if (token.type === 'RSQUAREBRACE') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LSQUAREBRACE') {
                output.push(stack.pop())
            }
            stack.pop() 
            output.push(new Token('OPERATOR', 'int'))
        }
        else if (token.type === 'LPAREN') {
            stack.push(token)
        }
        else if (token.type === 'RPAREN') {
            while (stack.length > 0 && stack[stack.length - 1].type !== 'LPAREN') {
                output.push(stack.pop())
            }
            stack.pop()
        }
    }

    while (stack.length > 0) {
        output.push(stack.pop())
    }

    return output
}
