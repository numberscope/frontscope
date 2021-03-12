High Priority

- [ ] Implement adding sequences and handling backend sequences and OEIS
- [ ] Import/Export settings for seq and viz via JSON
- [ ] "Add New +" sequence button allows adding new sequences to choose from
- [ ] Get existing visualizers running in the app
- [ ] Add interactivity (change params in a live viz)
- [ ] Implement webhook or some way to notify the server of changes to the repo

- [ ] Investigate PascalCase error and how to handle it
- [ ] Make all classes PascalCase
- [ ] there's a word "bo" instead of "do" (typo)
- [ ] Let assignParams coerce the right dataType
- [ ] Consider how to allow users to add visualizers without checking into VCS
- [ ] How to control having long loops
- [ ] it would be nice to have some discussion of directory structure -- where do I put my new file?  where do I find the visualizerDifferences.ts to follow along?
- [ ] "This visualizer then does the only check it needs to: make sure that the number is more than to the levels. " -- make clear this is something about the example we are looking at somehow, not something general; also grammar
- [ ] typo:  "reference the name of the visualizer to maintain consistently, "
- [ ] typo: "sets it explicitely."
1) why are the primes still commented out in the visualizerDifferences.ts?
2) error in visualizerDidfferences.ts:         numberTermsTop.description = "The number of terms that appear in the top sequence. Must be bigger than the number of rows.";
 is repeated in both parameter specifications
8) why does "numberTermsTop" not have "Param" but "levelsParam" does?  Just as a naming convention question
9) something is fishy when you put "this.settings.number <= this.settings.levels" since levelsParam.name="levels" but numberTermsTop.name="n" -- shouldn't this kind of thing throw an error at compile or runtime?
10) I don't understand some indentation things in visualizerDifferences
11) add an indication of what amount of compiling needs to be done to incorporate it (none?)
12) maybe point out this.seq is how to get the sequence, and it has things like getElement()


Done
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
