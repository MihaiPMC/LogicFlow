const sourceCode = 'citeste a, b, numar\na = 4+(5   %  3) \nscrie a,   numar'

const KEYWORDS = [
    'citeste',
    'scrie',
    'si',
    'sau',
    'nu',
    'daca',
    'altfel',
    'cat_timp',
    'pentru',
    'executa',
    'atunci',

    'EOF',
]

class Token {
    constructor(type, value) {
        this.type = type
        this.value = value
    }
}

function isAlpha(ch) {
    return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z')
}

function lexer(sourceCode) {
    const tokens = []
    
    const src = sourceCode.split('')
    while ( src.length > 0 ) { 
        let ch = src.shift()
        if ( ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '%' ) {
            tokens.push(new Token('OPERATOR', ch))
        }
        else if ( ch === '=' ) {
            tokens.push(new Token('ASSIGN', ch))
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
        else {
            // Handle multi-character tokens
            if ( ch === ' ' || ch === '\n' || ch === '\t' ) {
                continue
            }
            else if ( ch >= '0' && ch <= '9' ) {
                let num = ch
                while ( src[0] >= '0' && src[0] <= '9' ) {
                    num += src.shift()
                }
                tokens.push(new Token('NUMBER', num))
            }
            else if ( isAlpha(ch) ) {
                let id = ch
                while ( isAlpha(src[0]) ) {
                    id += src.shift()
                }
                if ( KEYWORDS.includes(id) ) {
                    tokens.push(new Token('KEYWORD', id))
                }
                else {
                    tokens.push(new Token('IDENTIFIER', id))
                }
            }
            else {
                throw new Error(`Invalid character: ${ch}`)
            }
        }
    }
    tokens.push(new Token('EOF', null))
    return tokens
}

const tokens = lexer(sourceCode)

class Node {
    constructor(type, value = null) {
        this.type = type
        this.value = value
        this.children = []
    }
}

function parser(tokens) {
    let instruction = []



    return instructions
}