const KEYWORDS = [
    'citeste',
    'scrie',
    'daca',
    'atunci',
    'altfel',
    'cat_timp',
    'pentru',
    'executa',
    'EOF',
]

const LOGICAL_OPERATORS = [
    'si',
    'sau',
    'not',
    'egal',
    'diferit',
]

export class Token {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

function isAlpha(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
}

function isDigit(ch) {
    return ch >= '0' && ch <= '9'
}

export function lexer(sourceCode) {
    const tokens = []
    
    const src = sourceCode.split('')
    while ( src.length > 0 ) { 
        let ch = src.shift()
        if ( ch === '\n' || ch === ';' ) {
            tokens.push(new Token('NEWLINE', ch))
        }
        else if ( ch === '+' || (ch === '-' && (tokens[tokens.length - 1].type == 'NUMBER' || tokens[tokens.length - 1].type == 'IDENTIFIER')) || ch === '*' || (ch === '/' && src[0] !== '/') || ch === '%' ) {
            tokens.push(new Token('OPERATOR', ch))
        }
        else if ( ch === '=' ) {
            tokens.push(new Token('ASSIGN', ch))
        }
        else if (ch === '<' || ch === '>') {
            if (src[0] === '=') {
                tokens.push(new Token('OPERATOR', ch + src.shift()));
            } else {
                tokens.push(new Token('OPERATOR', ch));
            }
        }
        else if ( ch === ',' ) {
            tokens.push(new Token('COMMA', ch))
        }
        else if ( ch === '(' ) {
            tokens.push(new Token('LPAREN', ch))
        }
        else if ( ch === ')' ) {
            tokens.push(new Token('RPAREN', ch))
        }
        else if ( ch === '{' ){
            tokens.push(new Token('LBRACE', ch))
        }
        else if ( ch === '}' ){
            tokens.push(new Token('RBRACE', ch))
        }
        else if ( ch === '[' ){
            tokens.push(new Token('LSQUAREBRACE', ch))
        }
        else if ( ch === ']' ){
            tokens.push(new Token('RSQUAREBRACE', ch))
        }
        else {
            // Handle multi-character tokens
            if ( ch === ' ' || ch === '\t' || ch === '\r' ) {
                continue
            }
            else if ( ch === '/' && src[0] === '/' ) {
                while ( src[0] !== '\n' ) {
                    src.shift()
                }
            }
            else if ( isDigit(ch) || ch === '-') {
                let num = ch
                while ( isDigit(src[0]) ) {
                    num += src.shift()
                }
                if ( num === '-' ) {
                    tokens.push(new Token('NUMBER', '-1'))
                    tokens.push(new Token('OPERATOR', '*'))
                }
                else
                    tokens.push(new Token('NUMBER', num))
            }
            else if ( isAlpha(ch) ) {
                let id = ch
                while ( isAlpha(src[0]) || isDigit(src[0]) || src[0] === '_' ) {
                    id += src.shift()
                }
                if ( KEYWORDS.includes(id) ) {
                    tokens.push(new Token('KEYWORD', id))
                }
                else if ( LOGICAL_OPERATORS.includes(id) ) {
                    tokens.push(new Token('OPERATOR', id))
                }
                else {
                    tokens.push(new Token('IDENTIFIER', id))
                }
            }
            else if ( ch === '"') {
                let str = ''
                while ( src[0] !== '"' ) {
                    str += src.shift()
                }
                src.shift()
                tokens.push(new Token('STRING', str))
            }
            else {
                throw new Error(`Invalid character: ${ch}, ASCII: ${ch.charCodeAt(0)}`)
            }
        }
    }
    tokens.push(new Token('EOF', null))
    for ( let tk of tokens ) {
         console.log(tk)
    }
    return tokens
}