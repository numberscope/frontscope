import * as child_process from 'child_process'
import * as path from 'path'
import * as process from 'process'

// Checks whether there are any unstaged changes or untracked files
// If so, issue a message and fail

process.argv.shift() // remove the node path
const toolPath = process.argv.shift()
const packageDir = path.dirname(path.dirname(toolPath))
process.chdir(packageDir)

const findCommand = `git ls-files . --exclude-standard --others -m`
console.log('>>', findCommand, '\n')

try {
    let out = child_process.execSync(findCommand)
    out = out.toString().trim()
    if (out === '') {
        console.log('No uncommitted changes or untracked files. Proceeding.')
        process.exit(0)
    } else {
        console.log(out)
    }
} catch (err) {
    console.error('Error:', err.message)
    console.error('git ls-files failed, please investigate.')
    process.exit(2)
}
console.warn(`----
The above files are untracked or have uncommitted changes, the presence of
which could affect pre-commit testing. Please 'git stash' and/or store
untracked files elsewhere, and re-try your commit.`)
process.exit(1)
