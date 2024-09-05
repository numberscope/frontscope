import * as child_process from 'child_process'
import * as path from 'path'
import * as process from 'process'

// Checks whether anything has changed since the last e2e test.
// If so, runs full e2e test; if not, just runs those that failed

process.argv.shift() // remove the node path
const toolPath = process.argv.shift()
const packageDir = path.dirname(path.dirname(toolPath))
const playReport = path.join(packageDir, 'test-results/.last-run.json')
const findCommand = `find '${packageDir}' -type f -newer '${playReport}'`
console.log('>>', findCommand, '\n')

let testedCurrent = false
try {
    let out = child_process.execSync(findCommand)
    out = out.toString().trim()
    if (out === '') {
        testedCurrent = true
    } else {
        console.log('Detected the following changed files:')
        console.log(out)
    }
} catch (err) {
    console.log('find failed, assuming test is not current.')
    console.log('Error:', err.message)
}
const testCommand = 'npm'
const testArgs = ['run', 'test:e2e', '--', '--reporter', 'dot']
if (testedCurrent) testArgs.push('--last-failed', '--pass-with-no-tests')
console.log('\n>>', testCommand, testArgs.join(' '), '\n')
const result = child_process.spawnSync(testCommand, testArgs, {
    cwd: packageDir,
    stdio: 'inherit',
})
process.exit(result.status)
