/**
 * Transpiler pentru conversia pseudocodului în C++
 */

export function generateCPP(ast) {
    if (!ast) return '// Eroare în transpilare: AST invalid';

    let code = '';
    let variables = new Map(); // Track variable name → type mapping
    let vectorVariables = new Set(); // Keep track of variables used as vectors
    let initializedVectors = new Set(); // Track which vectors are explicitly initialized
    let maxVectorIndices = new Map(); // Track maximum index used for each vector

    // Colectăm variabilele înainte de a genera headerele
    if (ast && ast.children) {
        collectVariables(ast, variables, vectorVariables, initializedVectors, maxVectorIndices);
    }
    
    // Verificăm dacă există variabile de tip string și vector
    const hasStringVariables = Array.from(variables.values()).includes('string');
    const hasVectorVariables = vectorVariables.size > 0;

    // Adăugăm header-ele necesare
    code += '#include <iostream>\n';
    if (hasStringVariables) {
        code += '#include <string>\n';
    }
    if (hasVectorVariables) {
        code += '#include <vector>\n';
    }
    code += '\nusing namespace std;\n\n';
    code += 'int main() {\n';
    
    // Generăm declarațiile de variabile
    if (variables.size > 0) {
        // Group variables by type
        const stringVars = [];
        const intVars = [];
        const vectorVars = new Set(vectorVariables);
        
        for (const [variable, type] of variables.entries()) {
            // Skip variables that are already declared as vectors
            if (vectorVars.has(variable)) {
                continue;
            }
            
            if (type === 'string') {
                stringVars.push(variable);
            } else {
                intVars.push(variable);
            }
        }
        
        // Declare string variables
        if (stringVars.length > 0) {
            for (const variable of stringVars) {
                code += `    string ${variable};\n`;
            }
        }
        
        // Declare int variables
        if (intVars.length > 0) {
            for (const variable of intVars) {
                code += `    int ${variable};\n`;
            }
        }
        code += '\n';
    }
    
    // Initialize vectors that are used but not explicitly allocated/initialized
    if (vectorVariables.size > 0) {
        for (const vectorVar of vectorVariables) {
            if (!initializedVectors.has(vectorVar)) {
                // Use the maximum index + 1 as the size, or default to a reasonable size if no index was found
                const maxIndex = maxVectorIndices.get(vectorVar);
                const vectorSize = maxIndex !== undefined ? maxIndex + 1 : 10;
                code += `    vector<int> ${vectorVar}(${vectorSize}, 0);\n`;
            }
        }
        if (vectorVariables.size > initializedVectors.size) {
            code += '\n';
        }
    }
    
    // Parcurgem nodurile AST și grupăm nodurile de output
    if (ast && ast.children) {
        for (let i = 0; i < ast.children.length; i++) {
            const node = ast.children[i];
            if (isOutputNode(node)) {
                let outputs = [];
                // Grupați nodurile consecutive de output
                while (i < ast.children.length && isOutputNode(ast.children[i])) {
                    outputs.push(ast.children[i]);
                    i++;
                }
                // Dacă există un NEWLINE imediat după grup, sarim peste el
                if (i < ast.children.length && ast.children[i].type === 'NEWLINE') {
                    i++;
                }
                code += transpileOutputGroup(outputs, 1);
                i--; // Ajustăm pentru ciclul for
            } else if (node.type === 'NEWLINE') {
                code += getIndentation(1) + "cout << endl;\n";
            } else {
                code += transpileNode(node, 1, variables);
            }
        }
    }
    
    code += '    return 0;\n';
    code += '}\n';
    
    return code;
}

function isOutputNode(node) {
    return node.type === 'OUTPUT' || node.type === 'OUTPUTSTR' || node.type === 'OUTPUTEXP';
}

function transpileOutputGroup(nodes, indentLevel) {
    const indent = getIndentation(indentLevel);
    const parts = [];
    // Parcurgem nodurile de output și le transformăm corespunzător
    for (const node of nodes) {
        if (node.type === 'OUTPUT') {
            parts.push(node.value);
        } else if (node.type === 'OUTPUTSTR') {
            parts.push(`"${node.value}"`);
        } else if (node.type === 'OUTPUTEXP') {
            if (node.children && node.children.length > 0) {
                parts.push(transpileExpression(node.children));
            } else if (node.value) {
                if (Array.isArray(node.value)) {
                    parts.push(transpileExpression(node.value));
                } else {
                    parts.push(node.value);
                }
            }
        }
    }
    return `${indent}cout << ${parts.join(' << ')} << endl;\n`;
}

function collectVariables(node, variables, vectorVariables, initializedVectors, maxVectorIndices) {
    if (!node) return;
    if (node.type === 'ASSIGNMENT') {
        // Check if this variable is used as a vector elsewhere
        if (vectorVariables.has(node.value)) {
            // Skip adding it as a regular variable
            return;
        }
        
        // Check if this is a vector element assignment (contains array indexing)
        if (node.value.includes('[') && node.value.includes(']')) {
            // Extract the base variable name (before '[')
            const baseVarName = node.value.split('[')[0];
            vectorVariables.add(baseVarName);
            // Remove this variable if it was previously added as a scalar
            variables.delete(baseVarName);
            
            // Try to extract index if it's a constant
            try {
                const indexStr = node.value.match(/\[([0-9]+)\]/);
                if (indexStr && indexStr[1]) {
                    const index = parseInt(indexStr[1], 10);
                    const currentMax = maxVectorIndices.get(baseVarName) || 0;
                    if (index > currentMax) {
                        maxVectorIndices.set(baseVarName, index);
                    }
                }
            } catch (e) {
                // Not a constant index, ignore
            }
            
            return;
        }

        // Check if this is a string assignment
        if (node.children && Array.isArray(node.children)) {
            for (const child of node.children) {
                if (child.type === 'STRING') {
                    variables.set(node.value, 'string');
                    break;
                }
            }
            
            // If the assignment contains string concatenation or string literals
            const hasStringValue = detectStringExpression(node.children);
            if (hasStringValue) {
                variables.set(node.value, 'string');
            } else if (!variables.has(node.value)) {
                variables.set(node.value, 'int'); // Default to int if not already set
            }
            
            // Check for array accesses in the expression
            checkArrayAccessesInExpression(node.children, vectorVariables, maxVectorIndices);
        } else {
            if (!variables.has(node.value)) {
                variables.set(node.value, 'int'); // Default to int
            }
        }
    } 
    else if (node.type === 'INPUT') {
        // Check if this is a vector element input
        if (node.value.includes('[') && node.value.includes(']')) {
            // Extract the base variable name (before '[')
            const baseVarName = node.value.split('[')[0];
            vectorVariables.add(baseVarName);
            // Remove this variable if it was previously added as a scalar
            variables.delete(baseVarName);
            
            // Try to extract index if it's a constant
            try {
                const indexStr = node.value.match(/\[([0-9]+)\]/);
                if (indexStr && indexStr[1]) {
                    const index = parseInt(indexStr[1], 10);
                    const currentMax = maxVectorIndices.get(baseVarName) || 0;
                    if (index > currentMax) {
                        maxVectorIndices.set(baseVarName, index);
                    }
                }
            } catch (e) {
                // Not a constant index, ignore
            }
            
            return;
        }
        
        if (!variables.has(node.value) && !vectorVariables.has(node.value)) {
            variables.set(node.value, 'int'); // Default to int for input vars
        }
    }
    else if (node.type === 'VECTOR_ALLOC' || node.type === 'VECTOR_INIT') {
        vectorVariables.add(node.value);
        initializedVectors.add(node.value); // Mark this vector as explicitly initialized
        // If this was previously declared as a scalar, remove it
        variables.delete(node.value);
    }
    else if (node.type === 'OUTPUT' || node.type === 'OUTPUTEXP') {
        // Check if we're outputting a vector element
        if (node.value && typeof node.value === 'string' && node.value.includes('[') && node.value.includes(']')) {
            const baseVarName = node.value.split('[')[0];
            vectorVariables.add(baseVarName);
            variables.delete(baseVarName);
            
            try {
                const indexStr = node.value.match(/\[([0-9]+)\]/);
                if (indexStr && indexStr[1]) {
                    const index = parseInt(indexStr[1], 10);
                    const currentMax = maxVectorIndices.get(baseVarName) || 0;
                    if (index > currentMax) {
                        maxVectorIndices.set(baseVarName, index);
                    }
                }
            } catch (e) {
                // Not a constant index, ignore
            }
        }
        
        // Also check expression outputs for array accesses
        if (node.value && Array.isArray(node.value)) {
            checkArrayAccessesInExpression(node.value, vectorVariables, maxVectorIndices);
        }
    }
    else if (node.type === 'IF') {
        if (node.value.condition) {
            checkArrayAccessesInExpression(node.value.condition, vectorVariables, maxVectorIndices);
        }
        collectVariablesFromBlock(node.value.thenBlock, variables, vectorVariables, initializedVectors, maxVectorIndices);
        if (node.value.elseBlock) {
            collectVariablesFromBlock(node.value.elseBlock, variables, vectorVariables, initializedVectors, maxVectorIndices);
        }
    } else if (node.type === 'WHILE' || node.type === 'DO-WHILE') {
        if (node.value.condition) {
            checkArrayAccessesInExpression(node.value.condition, vectorVariables, maxVectorIndices);
        }
        collectVariablesFromBlock(node.value.block, variables, vectorVariables, initializedVectors, maxVectorIndices);
    } else if (node.type === 'FOR') {
        if (node.value.init) {
            // Make sure this isn't a vector variable before adding it as an int
            if (!vectorVariables.has(node.value.init.value)) {
                variables.set(node.value.init.value, 'int'); // For loops typically use int
            }
        }
        
        if (node.value.condition) {
            checkArrayAccessesInExpression(node.value.condition, vectorVariables, maxVectorIndices);
        }
        
        collectVariablesFromBlock(node.value.block, variables, vectorVariables, initializedVectors, maxVectorIndices);
    }
    
    // Check expressions for array access
    if (node.children && Array.isArray(node.children)) {
        // Look for array access patterns in expressions
        checkArrayAccessesInExpression(node.children, vectorVariables, maxVectorIndices);
        
        // Recursively process children
        for (const child of node.children) {
            collectVariables(child, variables, vectorVariables, initializedVectors, maxVectorIndices);
        }
    }
}

function checkArrayAccessesInExpression(tokens, vectorVariables, maxVectorIndices) {
    if (!tokens || !Array.isArray(tokens)) return;
    
    // First pass: look for explicit array indexing patterns using brackets
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        // Look for pattern: IDENTIFIER followed by LBRACKET
        if (token.type === 'IDENTIFIER' && i + 1 < tokens.length) {
            // Check for direct array access with LBRACKET
            if (tokens[i+1].type === 'LBRACKET') {
                // This is an array access, mark the variable as a vector
                const varName = token.value;
                vectorVariables.add(varName);
                
                // Try to extract the index if it's a constant
                if (i + 2 < tokens.length && tokens[i+2].type === 'NUMBER') {
                    const index = parseInt(tokens[i+2].value, 10);
                    const currentMax = maxVectorIndices.get(varName) || 0;
                    if (index > currentMax) {
                        maxVectorIndices.set(varName, index);
                    }
                }
            }
            
            // Check for direct array usage without indexing (e.g., just "a" but in a context where "a" is an array)
            else if (vectorVariables.has(token.value)) {
                // Just using the variable name, but we know it's a vector
                continue;
            }
        }
        
        // Special case for array access in string format like "a[3]"
        if (token.type === 'STRING' && token.value.includes('[') && token.value.includes(']')) {
            const match = token.value.match(/([a-zA-Z0-9_]+)\[([0-9]+)\]/);
            if (match) {
                const varName = match[1];
                const index = parseInt(match[2], 10);
                vectorVariables.add(varName);
                
                const currentMax = maxVectorIndices.get(varName) || 0;
                if (index > currentMax) {
                    maxVectorIndices.set(varName, index);
                }
            }
        }
    }
    
    // Second pass: look for index operations in postfix notation
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        
        if (token.type === 'OPERATOR' && token.value === 'index' && i >= 2) {
            // The array name should be two positions back in a postfix expression
            const arrayToken = tokens[i-2];
            if (arrayToken && arrayToken.type === 'IDENTIFIER') {
                const varName = arrayToken.value;
                vectorVariables.add(varName);
                
                // Try to extract the index if it's a constant
                const indexToken = tokens[i-1];
                if (indexToken && indexToken.type === 'NUMBER') {
                    const index = parseInt(indexToken.value, 10);
                    const currentMax = maxVectorIndices.get(varName) || 0;
                    if (index > currentMax) {
                        maxVectorIndices.set(varName, index);
                    }
                }
            }
        }
    }
}

function detectStringExpression(tokens) {
    if (!tokens || !Array.isArray(tokens)) return false;
    
    // Look for any string token in the expression
    for (const token of tokens) {
        if (token.type === 'STRING') {
            return true;
        }
    }
    return false;
}

function collectVariablesFromBlock(block, variables, vectorVariables, initializedVectors, maxVectorIndices) {
    if (block && block.children) {
        for (const child of block.children) {
            collectVariables(child, variables, vectorVariables, initializedVectors, maxVectorIndices);
        }
    }
}

function getIndentation(level) {
    return '    '.repeat(level);
}

function transpileNode(node, indentLevel, variables) {
    if (!node) return '';
    
    const indent = getIndentation(indentLevel);
    
    switch (node.type) {
        case 'ASSIGNMENT':
            return transpileAssignment(node, indent, variables);
        case 'INPUT':
            return transpileInput(node, indent, variables);
        case 'OUTPUT':
            return transpileOutput(node, indent);
        case 'OUTPUTSTR':
            return transpileOutputStr(node, indent);
        case 'OUTPUTEXP':
            return transpileOutputExp(node, indent);
        case 'IF':
            return transpileIf(node, indentLevel, variables);
        case 'WHILE':
            return transpileWhile(node, indentLevel, variables);
        case 'FOR':
            return transpileFor(node, indentLevel, variables);
        case 'DO-WHILE':
            return transpileDoWhile(node, indentLevel, variables);
        case 'VECTOR_ALLOC':
            return transpileVectorAlloc(node, indentLevel);
        case 'VECTOR_INIT':
            return transpileVectorInit(node, indentLevel);
        default:
            return `${indent}`;
    }
}

function transpileAssignment(node, indent, variables) {
    const varName = node.value;
    
    if (node.children && node.children.length > 0) {
        // Check if this is a string assignment
        const expression = transpileExpression(node.children);
        
        // If this is the first time we see this variable and it's assigned a string,
        // mark it as a string variable
        if (expression.startsWith('"') && expression.endsWith('"') && !variables.has(varName)) {
            variables.set(varName, 'string');
        }
        
        return `${indent}${varName} = ${expression};\n`;
    }
    
    const type = variables.get(varName) || 'int';
    if (type === 'string') {
        return `${indent}${varName} = ""; // Asignare implicită string\n`;
    } else {
        return `${indent}${varName} = 0; // Asignare implicită int\n`;
    }
}

function transpileInput(node, indent, variables) {
    return `${indent}cin >> ${node.value};\n`;
}

function transpileOutput(node, indent) {
    return `${indent}cout << ${node.value} << endl;\n`;
}

function transpileOutputStr(node, indent) {
    return `${indent}cout << "${node.value}" << flush;\n`;
}

function transpileOutputExp(node, indent) {
    if (node.children && node.children.length > 0) {
        const expression = transpileExpression(node.children);
        return `${indent}cout << ${expression} << endl;\n`;
    } else if (node.value) {
        // Handle the case when node.value is an array of tokens
        if (Array.isArray(node.value)) {
            if (node.value.length === 1 && node.value[0].type === 'NUMBER') {
                // Single number token
                return `${indent}cout << ${node.value[0].value} << endl;\n`;
            } else if (node.value.length === 1 && node.value[0].type === 'STRING') {
                // Single string token
                return `${indent}cout << "${node.value[0].value}" << endl;\n`;
            } else {
                // Process expression tokens
                const expression = transpileExpression(node.value);
                return `${indent}cout << ${expression} << endl;\n`;
            }
        } else {
            // Direct value (string or number)
            return `${indent}cout << ${node.value} << endl;\n`;
        }
    }
    return `${indent}cout << endl;\n`;
}

function transpileIf(node, indentLevel, variables) {
    const indent = getIndentation(indentLevel);
    const ifNode = node.value;
    
    let code = `${indent}if (${transpileExpression(ifNode.condition)}) {\n`;
    
    // Generăm codul pentru blocul then
    if (ifNode.thenBlock && ifNode.thenBlock.children) {
        for (const childNode of ifNode.thenBlock.children) {
            code += transpileNode(childNode, indentLevel + 1, variables);
        }
    }
    
    code += `${indent}}\n`;
    
    // Generăm codul pentru blocul else dacă există
    if (ifNode.elseBlock && ifNode.elseBlock.children) {
        code += `${indent}else {\n`;
        for (const childNode of ifNode.elseBlock.children) {
            code += transpileNode(childNode, indentLevel + 1, variables);
        }
        code += `${indent}}\n`;
    }
    
    return code;
}

function transpileWhile(node, indentLevel, variables) {
    const indent = getIndentation(indentLevel);
    const whileNode = node.value;
    
    let code = `${indent}while (${transpileExpression(whileNode.condition)}) {\n`;
    
    // Generăm codul pentru corpul buclei
    if (whileNode.block && whileNode.block.children) {
        for (const childNode of whileNode.block.children) {
            code += transpileNode(childNode, indentLevel + 1, variables);
        }
    }
    
    code += `${indent}}\n`;
    
    return code;
}

function transpileDoWhile(node, indentLevel, variables) {
    const indent = getIndentation(indentLevel);
    const doWhileNode = node.value;
    
    let code = `${indent}do {\n`;
    
    // Generăm codul pentru corpul buclei
    if (doWhileNode.block && doWhileNode.block.children) {
        for (const childNode of doWhileNode.block.children) {
            code += transpileNode(childNode, indentLevel + 1, variables);
        }
    }
    
    code += `${indent}} while (${transpileExpression(doWhileNode.condition)});\n`;
    
    return code;
}

function transpileFor(node, indentLevel, variables) {
    const indent = getIndentation(indentLevel);
    const forNode = node.value;
    
    // Variabila de control
    const varName = forNode.init ? forNode.init.value : '';
    
    // Inițializare
    let initCode = '';
    if (forNode.init && forNode.init.children) {
        initCode = `${varName} = ${transpileExpression(forNode.init.children)}`;
    }
    
    // Condiție
    let condition = '';
    if (forNode.condition) {
        condition = transpileExpression(forNode.condition);
    }
    
    // Incrementare
    let increment = '';
    if (forNode.increment && forNode.increment.children) {
        increment = `${varName} = ${transpileExpression(forNode.increment.children)}`;
    } else {
        increment = `${varName}++`;
    }
    
    let code = `${indent}for (${initCode}; ${condition}; ${increment}) {\n`;
    
    // Generăm codul pentru corpul buclei
    if (forNode.block && forNode.block.children) {
        for (const childNode of forNode.block.children) {
            code += transpileNode(childNode, indentLevel + 1, variables);
        }
    }
    
    code += `${indent}}\n`;
    
    return code;
}

function transpileVectorAlloc(node, indentLevel) {
    const indent = getIndentation(indentLevel);
    const sizeExpr = transpileExpression(node.children);
    return `${indent}vector<int> ${node.value}(${sizeExpr});\n`;
}

function transpileVectorInit(node, indentLevel) {
    const indent = getIndentation(indentLevel);
    const elements = node.children.elements.map(exprTokens => transpileExpression(exprTokens));
    return `${indent}vector<int> ${node.value} = { ${elements.join(', ')} };\n`;
}

function transpileExpression(tokens) {
    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) return '';
    
    // Pentru expresii simple
    if (tokens.length === 1) {
        const token = tokens[0];
        if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
            return token.value;
        }
        if (token.type === 'STRING') {
            return '"' + token.value + '"';
        }
    }
    
    // Pentru expresii complexe care folosesc notația postfixată
    const stack = [];
    
    for (const token of tokens) {
        if (token.type === 'NUMBER' || token.type === 'IDENTIFIER') {
            stack.push(token.value);
        } 
        else if (token.type === 'STRING') {
            stack.push('"' + token.value + '"');
        }
        else if (token.type === 'LSQUAREBRACE' || token.type === 'LBRACKET') {
            // Skip brackets as they are handled with the indexing operation
            continue;
        }
        else if (token.type === 'RSQUAREBRACE' || token.type === 'RBRACKET') {
            // Skip brackets as they are handled with the indexing operation
            continue;
        }
        else if (token.type === 'OPERATOR') {
            // Convertim operatorii din pseudocod în operatori C++
            const operator = mapOperator(token.value);
            
            if (operator === '!') {
                // Operatorul unary not
                const operand = stack.pop();
                stack.push(`!${operand}`);
            } 
            else if (operator === 'int') {
                // Funcția de conversie la int
                const operand = stack.pop();
                stack.push(`${operand}`);
            } 
            else if (operator === 'index') {
                // Handle array indexing - correctly format as array[index]
                const index = stack.pop();
                const array = stack.pop();
                stack.push(`${array}[${index}]`);
            }
            else {
                // Operatori binari
                const right = stack.pop();
                const left = stack.pop();
                
                // Special case for string concatenation with + operator
                const isStringConcat = 
                    (right.startsWith('"') && right.endsWith('"')) || 
                    (left.startsWith('"') && left.endsWith('"'));
                
                if (operator === '+' && isStringConcat) {
                    stack.push(`${left} + ${right}`);  // String concatenation
                } else {
                    // Standard binary operation
                    stack.push(`${left} ${operator} ${right}`);
                }
            }
        }
    }
    
    return stack.length > 0 ? stack[0] : '';
}

function mapOperator(operator) {
    const operatorMap = {
        'egal': '==',
        'diferit': '!=',
        'si': '&&',
        'sau': '||',
        'not': '!',
        'int': 'int',
        'mod': '%',
        'div': '/'
    };
    
    return operatorMap[operator] || operator;
}

