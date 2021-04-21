# Numberscope Frontend

## Project setup
```
npm install
```

In order to use the app in conjunction with the API server, you will need to tell it where the server is running. Create a file called `.env.local` and add the line

```
VUE_APP_API_URL=localhost:5000
```

The localhost address should match whatever address is assigned to your local instance of the API server.

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

### Canvas

The canvas is currently 800x800 pixels.

## Building a Visualizer


Big picture, every visualizer needs to implement the `visualizerInterface.ts` which provides the basic expectations of a visualizer. See below for the easy way to do this. These include the following:

1. `isValid`: a boolean that is used to determine if the visualizer is ready to draw. Generally this will remain false until the visualizer's `validate` method is called (see below).
2. `params`: The engine expects all visualizers to have parameters that can be set by the user, though these parameters can be empty. Use an array of `visualizerParamsSchema` objects.
3. `seq`: A sequence object that implements the sequence interface. Usually, the way this is handled is to set `seq` to be an instance of the default sequence (`sequenceClassDefault`) upon creation, until the visualizer `initialize()` is called, at which point, its `seq` is set to the sequence that the user selected. This allows the same visualizers to remain live while swapping sequences in and out.
4. `sketch`: a `p5` sketch object already live on the page. Usually, this will be set by the module manager when a visualizer is created, so all you need to do is provide that `initialize()` sets `this.sketch = sketch` (see the `visualizerDefault` for an example).
5. `initialize(sketch, seq)`: a method that is called by the engine to prepare the visualizer for drawing. Good practice is to check that `isValid` is true before intializing, though you are free to initialize however you like.
6. `validate()`: must return `ValidationStatus` object that indicates to the engine that the visualizer is valid. The engine will call `validate` before it calls `initialize` and will only proceed if the `isValid` property of the `ValidationStatus` object is `true`. Otherwise it will display the error.
7. `setup()`: a method that acts on the p5 sketch to set up the canvas for drawing. Called just prior to draw.
8. `draw()`: the method that does the bulk of the visualizer's work. This is where you can get creative. Generally acts on the sketch p5 object and actually draws the visualization. For details on this, refer to the p5 documentation.

### The easy way

The simplest and fastest way to set up your visualizer is to extend the `visualizerDefault` class. This guarantees that you will implement the interface, however you will still need to provide the details of your `validate` `initialize` `setup` and `draw` functions. The default class provides a rough template for the best way to structure a visualizer.

The provided example visualizers are good starting points for how to extend the default class.

### Example: `VisualizerDifferences.ts`

If you open this file, located in `src/visualizers/VisualizerDifferences.ts`, and follow along, you'll notice that it sets the name and params immediately. `settings` is the internal representation of those params in the class, and that is usually how you can access the params you created.

#### Where to put your visualizers

Place your new visualizer in `src/visualizers`, named in PascalCase (capital first letter of every word, no spaces).

#### Creating params and assigning their values

The `constructor` calls the constructor of the default class, which is empty, but which may eventually implement useful scaffolding, so it's good practice to call `super();`. In the differences visualizer, the constructor is where all the params are built and set using the `visualizerParamsSchema` object.

If you have a lot of params, this may not be the best way to set them: check out `visualizerTurtle` for a different approach if you have a lot of params. In this visualizer, we build the params schema as an array containing all the params. Then, in the constructor, we simply assign `this.params = shemaTurtle`. This would allow you to set up your params schema in a separate file if you wanted to, which could assist with keeping your code tidy.

These params will be used by the frontend engine to build the UI display that asks the user to set the values. These values are then assigned to the params, usually with `assignParams`, a helper function provided in the default visualizer, in `validate()`. This takes the param values (as `visualizerSettings`) from the UI and assigns them to the appropriate params so they can be used. You may implement your own way of moving settings from the UI to params but this is a good way to do it because the settings are already assigned names that match the params you set.

#### Params vs. settings

A good way to think about params is that these are the user-facing structures that you create to ask for values, which you then inject into your visualizer. The way this happens is that `assignParams` will create a setting for each param you make. So for example, if you create a param called `color`, the UI will create a popup field asking the user to set a value for `color`. Once that is received, it is available to you in the `params` but it hasn't been converted into a form that your visualizer can interact with yet.

Calling `assignParams` (if you've extended the default class), will create a setting called `color`, which you can get via `this.settings['color']` or `this.settings.color`.

In short, if you use `visualizerParamSchema` arrays to create params for your visualizer, the UI will automatically generate a popup for the user to choose values, and if you call `assignParams` in `validate` (assuming you extended the `visualizerDefault`), those values will get assigned to your visualizer settings so you can use them.

> The reason `settings` is not in the interface is that you aren't required to use them. The interface simply guarantees that the frontend UI engine gets what it expects, and since the only object that interacts with `settings` is the visualizer itself internally, you aren't forced to use `settings`. However, it's a good idea, and that's the pattern recommended by the default class.

#### Validating
 This visualizer only has one validation check. It makes sure that the `number` is more than to the `levels`. If this is not the case, it will return a `ValidationStatus` with an error message that is displayed to the user on the settings popup. Otherwise, it sets the visualizer's `isValid` setting to `true` and then returns a passing `ValidationStatus`. This, and all specific validations, are unique to each visualizer, and you will probably want to create your own checks.

#### Drawing your sequence
`drawDifferences` is a helper function that is not required, but simplifies the `draw` function later on. This particular visualizer uses it to do the bulk of the drawing work.

`setup` is mostly empty and just logs out a notice to the console, as this visualizer doesn't have any setup work to do.

`draw` calls `drawDifferences` with some arguments and then stops the sketch from drawing, as normally `draw` is called in a loop.

To access each sequence element, use `this.seq`. This is a `SequenceInterface` object, which is guaranteed to have a method `getElement(n)` that returns the `n`-th element in the sequence.

## Exporting a visualizer

The engine expects visualizers to be packaged in `visualizerExportModules` which take as their arguments the name of the visualizer which is displayed in the UI. You can also reference the name of the visualizer to maintain consistency, though the `visualizerDifferences` sets it explicitly.

The other arguments in the export module are the visualizer itself (`VizDifferences` in the example case, which is the name of the class we created), and a description, which is empty in the example (the empty string `""`).

If you place the file containing your visualizer class definition with the export module in the folder name `Visualizers`, the engine will automatically package it up and include it in the list of available visualizers.

There is no compiling needed. Simply place your file in the appropriate folder and run the app. JavaScript is compiled at runtime.