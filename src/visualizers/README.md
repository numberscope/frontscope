## To add a module:

1. Create a module file consistent with the format moduleSkeleton.js (or look at
   the other modules)
2. Export a tool_MODULE object
3. import the same object in modules.js
4. add the object you imported to the MODULES and give it a unique key

Note:

-   Anytime you want to use a p5 function, use it via object passed as _sketch_
    argument in the constructor, since there might be multiple sketches on the same
    page, the _sketch_ object is the handle to your specific sketch. So if I wanted
    to change the background, instead of

                ```javascript
                background('grey')
                ```

                I would do

                ```javascript
                sketch.background('grey')
                ```
