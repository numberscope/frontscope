const vizFiles = require.context('.', false, /\.ts$/)

/* We want to construct module exports from the files found in the
 * above search. For this, we construct a map (as an object, for simplicity)
 * from module names to the items returned by require.context for the
 * corresponding file names. From the documentation for webpack (which
 * supplies the require.context() function), the TypeScript type for these
 * items is exported as __WebpackModuleApi.RequireContext. Hence,
 * the following variable will be a map whose keys are strings and whose
 * values are of type __WebpackModuleApi.RequireContext.
 */
const vizMODULES: { [key: string]: __WebpackModuleApi.RequireContext } = {};
const vizKeyArray: string[] = [];
vizFiles.keys().forEach((key) => {
     if (key === './index.js' || key === './modules.js') return
     vizKeyArray.push(key)
     vizMODULES[key.replace(/(\.\/|\.ts)/g, '')] = vizFiles(key)
})

module.exports = vizMODULES;
