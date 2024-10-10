import * as child_process from 'child_process'
import {createTwoFilesPatch} from 'diff'
import {ESLint} from 'eslint'
import * as fs from 'fs'
import * as path from 'path'
import * as prettier from 'prettier'
import * as process from 'process'
import * as util from 'util'

// Takes a collection of glob arguments and determines all of the
// files that prettier and eslint (with the frontscope configuration)
// would process given those arguments

process.argv.shift() // remove the node path
const toolPath = process.argv.shift()
const packageDir = path.dirname(path.dirname(toolPath))
const toolName = path.relative(packageDir, toolPath)
const options = {
    help: {type: 'boolean', short: 'h', help: 'Print a help message'},
    'list-different': {
        type: 'boolean',
        short: 'l',
        help: 'Write a list of nonconformant files to stdout',
    },
    'show-differences': {
        type: 'boolean',
        short: 's',
        help: 'Show differences between current and reformatted',
    },
    named: {
        type: 'string',
        help: `The file name to use for processing stdin, which is
            specified by '-' as a file/dir/glob argument`,
    },
    quiet: {type: 'boolean', short: 'q', help: "Don't display errors"},
    write: {type: 'boolean', help: 'Modify nonconformant files in place'},
}
let parsedArgs
try {
    parsedArgs = util.parseArgs({
        args: process.argv, // have already extracted execPath and filename
        allowPositionals: true,
        options,
    })
} catch (err) {
    process.stderr.write(`prettiest: ${err.code}:\n    ${err.message}\n`)
    process.stderr.write(`    or try \`node ${toolName} -h\` for help.\n`)
    process.exit(1)
}
const {values: opt, positionals: globs} = parsedArgs

if (opt.help) {
    console.log(
        'Check and/or correct code formatting with prettier then eslint.\n'
    )
    console.log(`Usage: node ${toolName} [options] [file/dir/glob ...]`)
    let maxHeader = 0
    for (const flag in options) {
        const short =
            'short' in options[flag] ? `-${options[flag].short}, ` : `    `
        options[flag].header = `${short}--${flag}`
        maxHeader = Math.max(maxHeader, options[flag].header.length)
    }
    maxHeader += 3
    for (const flag in options) {
        console.log(
            `${options[flag].header.padEnd(maxHeader)}${options[flag].help}`
        )
    }
    console.log('\nNote that when not using --write, line numbers on error')
    console.log('messages may be approximate, as they are inferred from the')
    console.log('transformed results.')
    process.exit(0)
}

let files = new Set() // the collection of files

// Create the ESLint instance we will use throughout this process:
const overrideConfigFile = path.join(packageDir, 'etc/eslint.config.js')
const eslint = new ESLint({overrideConfigFile, cwd: packageDir, fix: true})

// First check if every glob is actually an explicit file:
let allFiles = false
try {
    allFiles = globs.every(glob => {
        return glob === '-' || fs.lstatSync(glob).isFile()
    })
} catch {
    /* pass */
}

if (allFiles) {
    globs.forEach(files.add, files)
} else {
    await addGlobsToSet(globs, files)
}

// Time to load up prettier and apply it and eslint to each file
const config = path.join(packageDir, 'etc/prettier.config.js')
const prettierOptions = await prettier.resolveConfig('', {config})

let unchanged = 0
let changed = 0
let status = 0
let wroteErr = false
let formatter
for (let filePath of files) {
    let original = ''
    let wasStdin = false
    if (filePath === '-') {
        // grab all of stdin
        original = fs.readFileSync(0, 'utf-8')
        filePath = opt.named || '<stdin>'
        wasStdin = true
    } else {
        original = fs.readFileSync(filePath, 'utf-8')
    }
    prettierOptions.filepath = filePath
    let prettified
    try {
        prettified = await prettier.format(original, prettierOptions)
    } catch (err) {
        if (err.name === 'UndefinedParserError') {
            prettified = original
        } else {
            if (!opt.quiet) {
                wroteErr = true
                process.stderr.write(
                    `${filePath}: ${err.name}: ${err.message}\n`
                )
            }
            continue
        }
    }
    const result = (await eslint.lintText(prettified, {filePath}))[0]
    if (
        (result.warningCount > result.fixableWarningCount
            || result.errorCount > result.fixableErrorCount)
        && (result.warningCount !== 1
            || !result.messages[0]?.message
            || !result.messages[0].message.startsWith('File ignored'))
    ) {
        // eslint noticed something bad about this file, tell the user
        status = 2
        if (!formatter) formatter = await eslint.loadFormatter()
        if (prettified !== original && !opt.write && !opt.quiet) {
            // Have to update the line numbers of the messages
            // Since prettier can only map positions forward,
            // and it does it by reformatting the text (!)
            // we perform a search based on offsets from new to old.
            // We assume that the eslint messages occur in order in the file.

            // First, generate the map from lines to cursors:
            let origLineToCursor = linesToCursors(original)
            let pretLineToCursor = linesToCursors(prettified)
            const pretLineFromOrigLine = [0]
            for (const message of result.messages) {
                const pretLine = message.line
                while (!(pretLine in pretLineFromOrigLine)) {
                    const tryOrigLine =
                        pretLine + guessOffset(pretLine, pretLineFromOrigLine)
                    const curOptions = Object.assign({}, prettierOptions, {
                        cursorOffset: origLineToCursor[tryOrigLine],
                    })
                    const {cursorOffset} = await prettier.formatWithCursor(
                        original,
                        curOptions
                    )
                    const tryPretLine = pretLineToCursor.findLastIndex(
                        n => n < cursorOffset
                    )
                    if (tryPretLine in pretLineFromOrigLine) {
                        // Not making progress, so time to make final guess
                        pretLineFromOrigLine[pretLine] = finalGuess(
                            pretLine,
                            pretLineFromOrigLine
                        )
                        break
                    }
                    pretLineFromOrigLine[tryPretLine] = tryOrigLine
                }
                message.line = pretLineFromOrigLine[pretLine]
            }
        }
        if (!opt.quiet) {
            const formatted = await formatter.format([result])
            wroteErr = true
            process.stderr.write(formatted)
        }
    }
    const prettiest = result.output || result.source || prettified
    let isChanged = prettiest !== original
    if (isChanged) {
        ++changed
        if (opt['list-different']) console.log(filePath)
        if (opt['show-differences']) {
            const origName = opt['list-different'] ? 'original' : filePath
            const pretName = opt['list-different']
                ? 'reformatted'
                : origName + '[reformatted]'
            console.log(
                createTwoFilesPatch(origName, pretName, original, prettiest)
            )
        }
    } else ++unchanged
    if (opt.write && (isChanged || wasStdin)) {
        if (wasStdin) {
            process.stdout.write(prettiest)
        } else {
            fs.renameSync(filePath, filePath + '~')
            fs.writeFileSync(filePath, prettiest)
        }
    }
}
let nonconform = opt.write ? 'changed' : 'nonconformant'
let conform = opt.write ? 'unchanged' : 'conformant'
let changeMessage = ''
if (changed > 0) {
    changeMessage =
        `${changed} ${pluralize('file', changed)} ${nonconform}, ` + 'and '
}
if (!opt.quiet && (wroteErr || changed + unchanged > 1)) {
    process.stderr.write(
        `\n${changeMessage}`
            + `${unchanged} ${pluralize('file', unchanged)} ${conform}.\n`
    )
}

if (changed > 0) {
    // Differences are not by themselves errors when writing:
    if (!opt.write) {
        if (!opt.quiet) {
            process.stderr.write(
                'Nonconforming files detected, try `npm run lint` to fix.\n'
            )
        }
        process.exit(1)
    }
}
process.exit(status)

function pluralize(s, num) {
    if (num === 1) return s
    return s + 's'
}

async function addGlobsToSet(inglobs, fileSet) {
    const hadStdin = inglobs.includes('-')
    const globs = inglobs.filter(g => g !== '-')
    // First get files from prettier. Note as per
    // https://stackoverflow.com/questions/78984297/
    // there does not currently appear to be a way to do this through
    // the api, but rather one must go through the cli, alas.
    let prettierList = `prettier --config etc/prettier.config.js
        --parser listing-parser --plugin tools/prettier-list.js
        --list-different`.split(/\s+/)
    prettierList = prettierList.concat(globs)
    if (!opt['list-different']) {
        console.log(`>> ${prettierList.join(' ')}`)
    }
    const plistResult = child_process.spawnSync('npx', prettierList, {
        cwd: packageDir,
        encoding: 'utf-8',
    })
    const files = plistResult.stdout
        .split('\n')
        .filter(f => !!f)
        .map(f => path.join(packageDir, f))
    files.forEach(fileSet.add, fileSet)

    // Now it's eslint's turn; we can do this with the api. Sadly, this
    // is a wasted run because we don't yet know if the "real" prettier
    // run is going to change any of these files.
    let eslintAll = await eslint.lintFiles(globs)
    for (const result of eslintAll) fileSet.add(result.filePath)

    // Finally, add stdin back in if we had it
    if (hadStdin) fileSet.add('-')
}

function linesToCursors(text) {
    let cursor = 0
    const lines = text.split('\n')
    return lines.map(line => {
        const lastCursor = cursor
        cursor += line.length + 1
        return lastCursor
    })
}

function guessOffset(line, knownMap) {
    let guess = 0
    let from = 0
    for (const knownLine in knownMap) {
        if (knownLine < line) {
            guess = knownMap[knownLine] - knownLine
            from = knownLine
        } else if (knownLine === line) return knownMap[knownLine] - knownLine
        else {
            const newGuess = knownMap[knownLine] - knownLine
            const oldWeight = knownLine - line
            const newWeight = line - from
            return Math.floor(
                (guess * oldWeight + newGuess * newWeight)
                    / (oldWeight + newWeight)
            )
        }
    }
    // Never seen a bigger line, so just go with the current offset
    return guess
}

function finalGuess(line, knownMap) {
    return line + guessOffset(line, knownMap) + 1 // so we don't just
    // return the same thing we last tried
}
