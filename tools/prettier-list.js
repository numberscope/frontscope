const PARSER_NAME = 'listing-parser'
const AST_FORMAT_NAME = 'listing-dummy-ast'

function parse(_text, _options) {
    return {node: 'dummy'}
}
function locStart(_node) {
    return 0
}
function locEnd(_node) {
    return 1
}
function print(_path, _options, _print) {
    return ''
}

export const languages = [{name: 'JustListTheFiles', parsers: [PARSER_NAME]}]

export const parsers = {
    [PARSER_NAME]: {parse, astFormat: AST_FORMAT_NAME, locStart, locEnd},
}

export const printers = {
    [AST_FORMAT_NAME]: {print},
}

export const options = {}
export const defaultOptions = {}
