# High Priority

- [x] Implement adding sequences and handling backend sequences and OEIS
- [ ] Import/Export settings for seq and viz via JSON
- [x] "Add New +" sequence button allows adding new sequences to choose from
- [ ] Get existing visualizers running in the app
- [ ] Add interactivity (change params in a live viz)
- [ ] Implement webhook or some way to notify the server of changes to the repo
- [ ] Consider how to allow users to add visualizers without checking into VCS
- [ ] How to control having long loops
- [ ] Implement a generic getter/setter for visualizer settings to prevent attempting to compare properties that don't exist

# Done

- [x] add an indication of what amount of compiling needs to be done to incorporate it (none?)
- [x] maybe point out this.seq is how to get the sequence, and it has things like getElement()
- [x] it would be nice to have some discussion of directory structure -- where do I put my new file?  where do I find the visualizerDifferences.ts to follow along?
- [x] "This visualizer then does the only check it needs to: make sure that the number is more than to the levels. " -- make clear this is something about the example we are looking at somehow, not something general; also grammar
- [x] something is fishy when you put "this.settings.number <= this.settings.levels" since levelsParam.name="levels" but numberTermsTop.name="n" -- shouldn't this kind of thing throw an error at compile or runtime? (This is a quirk of JS. You can check for nonexistant properties and it will just return undefined. It might make good sense to use getters and setters for this.)
- [x] I don't understand some indentation things in visualizerDifferences
- [x] Let assignParams coerce the right dataType
- [x] Error in visualizerDidfferences.ts:numberTermsTop.description = "The number of terms that appear in the top sequence. Must be bigger than the number of rows.";  is repeated in both parameter specifications
- [x] why does "numberTermsTop" not have "Param" but "levelsParam" does?  Just as a naming convention question
- [x] typo:  "reference the name of the visualizer to maintain consistently, "
- [x] typo: "sets it explicitely."
- [x] why are the primes still commented out in the visualizerDifferences.ts?
- [x] Investigate PascalCase error and how to handle it
- [x] Make all classes PascalCase
- [x] there's a word "bo" instead of "do" (typo)
- [x] Rename 'vizualizer' to 'visualizer'
- [x] Enable blow-up of the canvas
- [x] Fix mod fill and shift compare visualizers
- [x] Consider providing a defaultViz function for assigning params to settings
- [x] Consider removing settings from the interface
- [x] Generate thumbnails
- [x] Implement error checking/param conditions for seqs and vizs
- [x] Implement seq/viz bundles and storing configurations
- [x] Standardize params/settings between visualizers and sequences
- [x] Fix turtle
- [x] Set up the ability to switch out visualizers
- [x] Enable the ability to switch out sequences
- [x] Set up the sequencesParams functionality
- [x] Convert the "modules" to visualizers in all references
- [x] Convert visualizers to typescript and classes