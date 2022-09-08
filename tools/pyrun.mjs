import * as child_process from 'child_process'
import * as path from 'path'
import * as process from 'process'

process.argv.shift() // remove the node path
const toolPath = process.argv.shift()
const packageDir = path.dirname(path.dirname(toolPath))
let venvDir
if (process.platform === 'win32') {
    venvDir = path.join(packageDir, '.venv/Scripts')
} else {
    venvDir = path.join(packageDir, '.venv/bin')
}
const file = path.join(venvDir, process.argv.shift())
const result = child_process.spawnSync(file, process.argv, {
    cwd: packageDir,
    stdio: 'inherit',
    windowsHide: true,
})
process.exit(result.status)
