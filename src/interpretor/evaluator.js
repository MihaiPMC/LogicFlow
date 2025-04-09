
export function evaluateNode(node, variables, outputToConsole, MAX_ITERATIONS) {
    if (!node) return
    if (node.type === 'PROGRAM') {
        for (let childNode of node.children) {
            evaluateNode(childNode, variables, outputToConsole, MAX_ITERATIONS) 
        }
    } 
    else if (node.type === 'INPUT') {
        let varName = node.value
        let value = prompt(`Introdu valoarea pentru variabila "${varName}": `)
        if (isNaN(value)) {
            throw new Error(`Valoarea introdusa pentru variabila "${varName}" nu este un numar valid!`)
        }
        variables[varName] = parseFloat(value)
    } 
    else if (node.type === 'OUTPUT') {
        if (variables[node.value] === undefined) {
            throw new Error(`Variabila "${node.value}" nu a fost definita!`)
        }
        outputToConsole(variables[node.value].toString())
    } 
    else if (node.type === 'OUTPUTEXP') {
        let value = evaluatePostfixExpression(node.value, variables)
        value = value.toString()
        outputToConsole(value)
    }
    else if (node.type === 'OUTPUTSTR') {
        outputToConsole(node.value)
    }
    else if (node.type === 'ASSIGNMENT') {
        variables[node.value] = evaluatePostfixExpression(node.children, variables)
    }
    else if (node.type === 'IF') {
        let IFNode = node.value
        let condition = evaluatePostfixExpression(IFNode.condition, variables)
        if (condition) {
            evaluateNode(IFNode.thenBlock, variables, outputToConsole, MAX_ITERATIONS)
        } else if (IFNode.elseBlock) {
            evaluateNode(IFNode.elseBlock, variables, outputToConsole, MAX_ITERATIONS)
        }
    }
    else if (node.type === 'WHILE') {
        let WHILENode = node.value
        let condition = evaluatePostfixExpression(WHILENode.condition, variables)
        let count = 0
        while (condition) {
            evaluateNode(WHILENode.block, variables, outputToConsole, MAX_ITERATIONS)
            condition = evaluatePostfixExpression(WHILENode.condition, variables)
            count ++
            if ( count > MAX_ITERATIONS) {
                throw new Error ('Bucla infinita!')
            }
        }
    }
    else if (node.type === 'FOR') {
        let FORNode = node.value
        let INITNode = FORNode.init
        let STEPNode = FORNode.increment
        variables[INITNode.value] = evaluatePostfixExpression(INITNode.children, variables)
        let count = 0
        while (evaluatePostfixExpression(FORNode.condition, variables)) {
            evaluateNode(FORNode.block, variables, outputToConsole, MAX_ITERATIONS);
            evaluateNode(STEPNode, variables, outputToConsole, MAX_ITERATIONS);
            count ++
            if ( count > MAX_ITERATIONS) {
                throw new Error ('Bucla infinita!')
            }
        }
    }
    else if (node.type === 'DO-WHILE') {
        let DO_WHILENode = node.value
        let count = 0
        do {
            evaluateNode(DO_WHILENode.block, variables, outputToConsole, MAX_ITERATIONS)
            count ++
            if ( count > MAX_ITERATIONS) {
                throw new Error ('Bucla infinita')
            }
        } while (!evaluatePostfixExpression(DO_WHILENode.condition, variables))
    }
}

function evaluatePostfixExpression(tokens, variables) {
    let stack = []
    let exprTokens = [...tokens]

    while (exprTokens.length > 0) {
        let token = exprTokens.shift()
        
        if (token.type === 'NUMBER') {
            stack.push(parseFloat(token.value))
        } 
        else if (token.type === 'IDENTIFIER') {
            if (variables[token.value] === undefined) {
                throw new Error(`Variabila "${token.value}" nu a fost definita!`)
            }
            stack.push(variables[token.value] ?? 0)
        } 
        else if (token.type === 'OPERATOR') {
            if (token.value === 'not') {
                let op = stack.pop()
                stack.push(op ? 0 : 1)
            }
            else if (token.value === 'int') {
                let op = stack.pop()
                stack.push(Math.floor(op))
            }
            else {
                let op2 = stack.pop()
                let op1 = stack.pop()

                if (token.value === '+') stack.push(op1 + op2)
                else if (token.value === '-') stack.push(op1 - op2)
                else if (token.value === '*') stack.push(op1 * op2)
                else if (token.value === '/') stack.push(op1 / op2)
                else if (token.value === '%') stack.push(op1 % op2)
                else if (token.value === '>') stack.push(op1 > op2 ? 1 : 0)
                else if (token.value === '<') stack.push(op1 < op2 ? 1 : 0)
                else if (token.value === '>=') stack.push(op1 >= op2 ? 1 : 0)
                else if (token.value === '<=') stack.push(op1 <= op2 ? 1 : 0)
                else if (token.value === 'egal') stack.push(op1 === op2 ? 1 : 0)
                else if (token.value === 'diferit') stack.push(op1 !== op2 ? 1 : 0)
                else if (token.value === 'si') stack.push(op1 && op2 ? 1 : 0)
                else if (token.value === 'sau') stack.push(op1 || op2 ? 1 : 0)
            }
        }
    }
    if (stack.length > 1) {
        throw new Error('Expresie invalida')
    }
    return stack.pop()
}
