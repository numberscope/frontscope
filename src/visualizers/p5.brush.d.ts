declare module 'p5.brush' {
    // Inspired by a posting by Joey Figaro at
    // https://github.com/acamposuribe/p5.brush/issues/8#issuecomment-1818000870
    export function instance(sketch: p5): void
    /**
     * Sets a custom seed for deterministic drawing results.
     * @param {string|number} seed
     */
    export function seed(s: string | number): void
    /**
     * Initializes the drawing system and sets up the environment.
     * @param {string|boolean} [canvasID=false]
     *     Optional ID of the canvas element to use.
     *     If false, it uses the current window as the rendering context.
     */
    export function load(canvasID?: string | boolean): void
    /**
     * Preloads necessary assets or configurations.
     * This function should be called before setup to ensure all assets
     * are loaded.
     */
    export function preload(): void
    /**
     * Enables/Disables color caching for WebGL Shaders.
     * Color caching increases performance but might produce worse textures
     * when using the same colour repeatedly.
     * @param {boolean?} bool  True (default) turns on caching, false disables.
     *
     */
    export function colorCache(bool?: boolean): void
    /**
     * Adjusts the global scale of brush parameters based on the provided
     * scale factor. This operation affects the weight, vibration,
     * and spacing of each standard brush.
     *
     * @param {number} scale - The factor to apply to the brush parameters.
     */
    export function scaleBrushes(scale: number): void
    /**
     * Removes brush library brushes and unloads the library. This can be
     * useful if you only used the library to draw into a buffer,
     * and you want to perform only normal p5 operations after that.
     */
    export function remove(): void
    /**
     * Saves current state to object
     */
    export function push(): void
    /**
     * Restores previous state from object
     */
    export function pop(): void
    /**
     * Captures the desired rotation.
     * @param {number?} angle  The number of degrees to rotate, default 0.
     */
    export function rotate(a?: number): void

    type FieldArray = number[][]
    type FieldGenerator = (time: number, field: FieldArray) => FieldArray
    /**
     * Adds a new vector field to the field list with a unique name and
     * a generator function.
     * @param {string} name
     *     The unique name for the new vector field.
     * @param {FieldGenerator} funct
     *     The function that generates the field values.
     */
    export function addField(name: string, funct: FieldGenerator): void
    /**
     * Activates a specific vector field by name, ensuring it's ready for use.
     * @param {string} a  The name of the vector field to activate.
     */
    export function field(a: string): void
    /**
     * Deactivates the current vector field.
     */
    declare function noField(): void
    /**
     * Refreshes the current vector field based on the generator function,
     * which can be time-dependent.
     * @param {number} [t=0]
     *     An optional time parameter that can affect field generation.
     */
    export function refreshField(t?: number): void
    /**
     * Retrieves a list of all available vector field names.
     * @returns {Iterator<string>}
     *     An iterator that provides the names of all the fields.
     */
    export function listFields(): Iterator<string>
    /**
     * Sets a global scaling for all brush parameters.
     *
     * @param {number} s - The scale factor to apply to the brush parameters.
     */
    export function scale(s: number): void
    /**
     * p5.brush uses several buffers and caches to make the drawing
     * operations more performant. Use this function if you want
     * to force noBlend brushes to be drawn into the canvas. It is designed
     * to help maintain the correct draw order for the different strokes
     * and shapes.
     */
    export function reDraw(): void
    /**
     * p5.brush uses several buffers and caches to make the drawing
     * operations more performant. Use this function if you want
     * to force Blend brushes to be drawn into the canvas. It is designed
     * to help maintain the correct draw order for the different strokes
     * and shapes.
     */
    export function reBlend(): void
    /**
     * Retrieves a list of all available brush names from the brush manager.
     * @returns {Array<string>} An array containing the names of all brushes.
     */
    export function box(): Array<string>

    interface BrushParams {
        type: string
        weight: number
        vibration: number
        definition: number
        quality: number
        opacity: number
        spacing: number
        blend: boolean
        pressure: {
            type?: string
            min_max: [number, number]
            curve: [number, number]
        }
    }
    /**
     * Adds a new brush with the specified parameters to the brush list.
     * @param {string} name  The unique name for the new brush.
     * @param {BrushParams} params
     *    The parameters defining the brush behavior and appearance.
     */
    export function add(name: string, params: BrushParams): void
    /**
     * Sets only the current brush type based on the given name.
     * @param {string} brushName  The name of the brush to set as current.
     */
    export function pick(brush: string): void
    /**
     * Sets a rectangular clipping region for all subsequent brush strokes.
     * When this clipping region is active, brush strokes outside this area
     * will not be rendered. This is particularly useful for ensuring that
     * strokes, such as lines and curves, are contained within a specified
     * area. The clipping affects only stroke and hatch operations, not fill
     * operations. The clipping remains in effect for all strokes drawn after
     * the call to brush.clip() until brush.noClip() is used.
     * @param {[number, number, number, number]} clippingRegion
     *     The corners (x1, y1) and (x2, y2) of the clipping rectangle,
     *     given as [x1, y1, x2, y2].
     */
    export function clip(region: [number, number, number, number]): void
    /**
     * Disables the current clipping region, allowing subsequent brush
     * strokes to be drawn across the entire canvas without being clipped.
     */
    export function noClip(): void
    /**
     * Selects and sets up the current brush with a specific name, color,
     * and weight. This function is crucial for preparing the brush to draw
     * strokes with the desired characteristics.
     * @param {string} brushName  The name of the brush to use.
     * @param {string|p5.Color} color  The color for the brush
     * @param {number} weight  The weight or size of the brush.
     */
    export function set(
        name: string,
        color: string | p5.Color,
        weight: number
    ): void
    /**
     * Sets the color of the current brush.
     * @param {number|string|p5.Color} r
     *      The red component of the color, a CSS color string, or
     *      a p5.Color object.
     * @param {number?} g  The green component of the color.
     * @param {number?} b  The blue component of the color.
     */
    export function stroke(
        colOrR: string | number | p5.Color,
        G?: number,
        B?: number
    ): void
    /**
     * Sets the weight (size) of the current brush.
     * @param {number} weight  The weight to set for the brush.
     */
    export function strokeWeight(factor: number): void
    /**
     * Disables the stroke for subsequent drawing operations.
     * This function sets the brush's `isActive` property to false,
     * indicating that no stroke should be applied to the shapes drawn
     * after this method is called.
     */
    export function noStroke(): void
    /**
     * Sets the fill color and opacity for subsequent drawing operations.
     * @param {number|string|p5.Color} a
     *     The red component of the color or grayscale value,
     *     a CSS color string, or a p5.Color object.
     * @param {number?} b
     *     The green component of the color,
     *     or the opacity if there are two arguments.
     * @param {number?} c  The blue component of the color.
     * @param {number?} d  The opacity of the color.
     */
    export function fill(
        a: number | string | p5.Color,
        b?: number,
        c?: number,
        d?: number
    ): void
    /**
     * Adjusts the bleed level for the fill operation and its direction,
     * mimicking the behavior of watercolor paints.
     * @param {number} strength
     *     The intensity of the bleed effect, capped at 0.6.
     * @param {'out'|'in' ?} direction
     *     Defines the direction of the bleed effect.
     */
    export function bleed(strength: number, direction?: 'out' | 'in'): void
    /**
     * Adjusts the texture levels for the fill operation, mimicking the
     * behavior of watercolor paints. This function adds a natural and
     * organic feel to digital artwork.
     * @param {number} textureStrength
     *     The texture of the fill effect, ranging from 0 to 1
     * @param {number} borderIntensity
     *     The intensity of the border watercolor effect, ranging from 0 to 1.
     */
    export function fillTexture(
        textureStrength: number,
        borderIntensity: number
    ): void
    /**
     * Disables the fill for subsequent drawing operations.
     */
    export function noFill(): void
    /**
     * Disables some operations in order to guarantee a consistent bleed
     * effect for animations (at different bleed levels).
     * @param {boolean} mode  True to enter animated mode, false to end.
     */
    export function fillAnimatedMode(mode: boolean): void
    /**
     * Draws a rectangle on the canvas and fills it with the current fill color.
     *
     * @param {number} x  The x-coordinate of the rectangle.
     * @param {number} y  The y-coordinate of the rectangle.
     * @param {number} w  The width of the rectangle.
     * @param {number} h  The height of the rectangle.
     * @param {CORNER|CENTER ?} mode=CORNER
     *      If CENTER, the rectangle is drawn centered at (x, y);
     *      If CORNER, top left at (x, y).
     */
    export function rect(
        x: number,
        y: number,
        w: number,
        h: number,
        mode?: typeof p5.CORNER | typeof p5.CENTER
    ): void
    /**
     * Draws a circle on the canvas and fills it with the current fill color.
     *
     * @param {number} x - The x-coordinate of the center of the circle.
     * @param {number} y - The y-coordinate of the center of the circle.
     * @param {number} radius - The radius of the circle.
     * @param {boolean?} r
     *     Defaults to false. If true, applies a random factor to the radius
     * for each segment.
     */
    export function circle(
        x: number,
        y: number,
        radius: number,
        r?: boolean
    ): void
    /**
     * Creates a Polygon from a given array of points and performs drawing
     * and filling operations based on active states.
     *
     * @param {[number, number][]} pointsArray
     *     An array of coordinates, each an array of two numbers [x, y].
     */
    export function polygon(pointsArray: [number, number][]): void
    /**
     * Creates and draws a spline curve with the given points and curvature.
     * @param {number[][]} array_points
     *     An array of points defining the spline curve.
     * @param {number?} curvature
     *     The curvature of the spline curve, between 0 and 1. A curvature
     *     of 0 will create a series of straight segments. Defaults to 0.5.
     */
    export function spline(array_points: number[][], curvature?: number): void
    /**
     * Renders a predefined shape or plot with a flowing brush stroke,
     * following the currently active vector field. The shape is drawn
     * at a specified starting position and scale.
     * @param {Plot} p  The shape to draw.
     * @param {number} x
     *     The x-coordinate of the starting position to draw the shape.
     * @param {number} y
     *     The y-coordinate of the starting position to draw the shape.
     * @param {number} scale  The scale at which to draw the shape.
     */
    export function plot(p: Plot, x: number, y: number, scale: number)
    /**
     * Starts recording vertices for a custom shape. Optionally, a curvature
     * can be defined.
     * @param {number?} curvature -
     *     From 0 to 1, defaulting to 0. Defines the curvature for the
     *     vertices being recorded.
     */
    export function beginShape(curvature?: number): void
    /**
     * Records a vertex in the custom shape being defined between
     * beginShape and endShape.
     * @param {number} x  The x-coordinate of the vertex.
     * @param {number} y  The y-coordinate of the vertex.
     * @param {number?} pressure  Optional pressure at the vertex.
     */
    export function vertex(x: number, y: number, pressure?: number): void
    /**
     * Finishes recording vertices for a custom shape and either closes it
     * or leaves it open (the default).
     * It also triggers the drawing of the shape with the active stroke(),
     * fill() and hatch() states.
     * @param {p5.CLOSE?} close  If present, close the shape.
     */
    export function endShape(a?: typeof p5.CLOSE): void
    /**
     * Draws a line from one point to another using the current brush
     * settings. This function is affected only by stroke operations
     * and will not produce any drawing if noStroke() has been called.
     * @param {number} x1  The x-coordinate of the start point.
     * @param {number} y1  The y-coordinate of the start point.
     * @param {number} x2  The x-coordinate of the end point.
     * @param {number} y2  The y-coordinate of the end point.
     */
    export function line(x1: number, y1: number, x2: number, y2: number): void
    /**
     * Draws a flow line that adheres to the currently selected vector field.
     * Flow lines are defined by a starting point, length, and direction.
     * They are useful for creating strokes that dynamically follow the flow
     * of the vector field.
     * @param {number} x  The x-coordinate of the starting point.
     * @param {number} y  The y-coordinate of the starting point.
     * @param {number} length  The length of the line to draw.
     * @param {number} dir
     *     The direction in which to draw the line.
     *     Angles measured anticlockwise from the x-axis.
     */
    export function flowLine(
        x: number,
        y: number,
        length: number,
        dir: number
    ): void
    /**
     * Begins a new stroke with a given type and starting position.
     * This initializes a new Plot to record the stroke's path.
     * @param {string} type
     *     The type of the stroke, which defines the kind of Plot to create.
     * @param {number} x  The x-coordinate of the starting point of the stroke.
     * @param {number} y  The y-coordinate of the starting point of the stroke.
     */
    export function beginStroke(type: string, x: number, y: number): void
    /**
     * Adds a segment to the stroke with a given angle, length, and pressure.
     * This function is called between beginStroke and endStroke to define
     * the stroke's path.
     * @param {number} angle
     *     The initial angle of the segment, relative to the canvas.
     * @param {number} length  The length of the segment.
     * @param {number} pressure
     *     The pressure at the start of the segment, affecting
     *     properties like width.
     */
    export function segment(
        angle: number,
        length: number,
        pressure: number
    ): void
    /**
     * Completes the stroke path and triggers the rendering of the stroke.
     * @param {number} angle
     *    The angle of the curve at the last point of the stroke path.
     * @param {number} pressure  The pressure at the end of the stroke.
     */
    export function endStroke(angle: number, pressure: number): void
    type PolyPoint = {x: number; y: number}[]
    export class Polygon {
        /**
         * Constructs a Polygon object from an array of points.
         *
         * @param {[number, number][] | Point[]} pointsArray
         *     An array of vertices. If the second argument is true, each
         *     element of the array should be an object with two number
         *     properties, `x` and `y`. Otherwise, each point should be
         *     an array of two numbers [x, y].
         * @param {boolean} whichKind  Specifies the type of the first argument
         */
        constructor(
            points: [number, number][] | PolyPoint[],
            whichKind: boolean
        )
        /**
         * Intersects a given line with the polygon, returning all
         * intersection points.
         *
         * @param {LineSpec} line
         *     The line to intersect with the polygon, specified as
         *     an object with two Point properties, `point1` and `point2`.
         * @returns {Point[]}
         *     An array of intersection Point objects (each with 'x' and
         *     'y' properties); may be empty if no intersections.
         */
        intersect(line: {point1: PolyPoint; point2: PolyPoint}): PolyPoint[]
        /**
         * Draws the polygon by iterating over its sides and drawing lines
         * between the vertices.
         */
        draw(brush?: boolean | string, color?: string, weight?: number): void
        /**
         * Fills the polygon using the current fill state.
         */
        fill(color?: string | boolean, opacity?: number, bleed?: number): void
        /**
         * Creates hatch lines across the polygon based on a given distance
         * and angle.
         */
        hatch(dist?: number | boolean, angle?: number): void
        erase(flag?: boolean): void
        show(): void
    }
    /**
     * Creates a hatching pattern across the given polygons.
     *
     * @param {Polygon|Polygon[]} polygons
     *     A single Polygon or an array of Polygons to which to apply
     *     the hatching.
     */
    export function hatchArray(polygons: Polygon[] | Polygon): void

    type HatchOptions = {
        rand: boolean
        continuous: boolean
        gradient: boolean
    }
    /**
     * Activates hatching for subsequent geometries, with the given params.
     * @param {number?} dist - The distance between hatching lines.
     * @param {number?} angle - The angle at which hatching lines are drawn.
     * @param {HatchOptions?} options
     *     An object containing optional parameters to affect the
     *     hatching style:
     *       - rand: Introduces randomness to the line placement.
     *       - continuous: Connects ends of lines with start of the next.
     *       - gradient: Changes the distance between lines to create
     *         a gradient effect.
     *     All properties default to false.
     */
    export function hatch(
        dist?: number,
        angle?: number,
        options?: HatchOptions
    ): void
    /**
     * Sets the brush type, color, and weight for subsequent hatches.
     * If this function is not called, hatches will use the parameters
     * from stroke operations.
     * @param {string} brushName - The name of the brush to set as current.
     * @param {string|p5.Color ?} color
     *     The color to set for the brush, defaults to black.
     * @param {number?} weight
     *     The weight (size) to set for the brush, defaults to 1
     */
    export function setHatch(
        brush: string,
        color?: string | p5.Color,
        weight?: number
    ): void
    /**
     * Disables hatching for subsequent shapes
     */
    export function noHatch(): void

    export class Plot {
        /**
         * Creates a new Plot.
         * @param {'curve'|'segments'} type - The type of plot
         */
        constructor(type: 'curve' | 'segments')
        /**
         * Adds a segment to the plot with specified angle, length,
         * and pressure. Defaults are in parentheses below.
         * @param {number?} a  The angle of the segment. (0)
         * @param {number?} length  The length of the segment. (0)
         * @param {number?} pres  The pressure of the segment. (1)
         * @param {boolean?} degrees  Whether the angle is in degrees. (false)
         */
        addSegment(
            a?: number,
            length?: number,
            pres?: number,
            degrees?: boolean
        ): void

        /**
         * Finalizes the plot by setting the last angle and pressure.
         * @param {number?} a  The final angle of the plot. (0)
         * @param {number?} pres  The final pressure of the plot. (1)
         * @param {boolean?} degrees  Whether the angle is in degrees. (false)
         */
        endPlot(a?: number, pres?: number, degrees?: boolean): void
        /**
         * Rotates the entire plot by a given angle.
         * @param {number} a  The angle to rotate the plot.
         */
        rotate(a: number): void
        /**
         * Calculates the pressure at a given distance along the plot.
         * @param {number} d  The distance along the plot.
         * @returns {number}  The calculated pressure.
         */
        pressure(d: number): number
        /**
         * Calculates the angle at a given distance along the plot.
         * @param {number} d  The distance along the plot.
         * @returns {number}  The calculated angle.
         */
        angle(d: number): number
        /**
         * Interpolates values between segments for smooth transitions.
         * @param {number[]} array - The array to interpolate within.
         * @param {number} d - The distance along the plot.
         * @returns {number} - The interpolated value.
         */
        curving(array: number[], d: number): number
        /**
         * Calculates the current index of the plot based on the distance.
         * @param {number} d - The distance along the plot.
         */
        calcIndex(d: number): void
        /**
         * Generates a polygon based on the plot. The first two arguments
         * give the coordinates of the starting point of the polygon.
         * @param {number} x  Starting x-coordinate.
         * @param {number} y  Starting y-coordinate.
         * @param {number?} scale  Optional scale factor for the polygon.
         * @param {boolean?} isHatch  Will the polygon be hatched?
         * @returns {Polygon} - The generated polygon.
         */
        genPol(
            _x: number,
            _y: number,
            _scale?: number,
            isHatch?: boolean
        ): Polygon
        /**
         * Draws the plot on the canvas.
         * @param {number} x  The x-coordinate to draw at.
         * @param {number} y  The y-coordinate to draw at.
         * @param {number} scale  The scale to draw with.
         */
        draw(x: number, y: number, scale: number): void
        /**
         * Fill the plot on the canvas.
         * @param {number} x  The x-coordinate to draw at.
         * @param {number} y  The y-coordinate to draw at.
         * @param {number} scale  The scale to draw with.
         */
        fill(x: number, y: number, scale: number): void
        /**
         * Hatch the plot on the canvas.
         * @param {number} x  The x-coordinate to draw at.
         * @param {number} y  The y-coordinate to draw at.
         * @param {number} scale  The scale to draw with.
         */
        hatch(x: number, y: number, scale: number): void
    }

    export class Position {
        /**
         * Constructs a new Position instance.
         * @param {number} x  The initial x-coordinate.
         * @param {number} y  The initial y-coordinate.
         */
        constructor(x: number, y: number)
        /**
         * Updates the position's coordinates and calculates its offsets
         * and indices within the flow field if active.
         * @param {number} x  The new x-coordinate.
         * @param {number} y  The new y-coordinate.
         */
        update(x: number, y: number): void
        /**
         * Resets the 'plotted' property to 0.
         */
        reset(): void
        /**
         * Checks if the position is within the active flow field's bounds.
         * @returns {boolean}
         *     True if the position is within the flow field, false otherwise.
         */
        isIn(): boolean
        /**
         * Checks if the position is within the canvas bounds.
         * @returns {boolean}
         *     True if the position is within the canvas, false otherwise.
         */
        isInCanvas(): boolean
        /**
         * Calculates the angle of the flow field at the position's
         * current coordinates.
         * @returns {number}
         *     The angle in radians, or 0 if the position is not in the flow
         *     field or if the flow field is not active.
         */
        angle(): number
        /**
         * Moves the position along the flow field by a certain length.
         * @param {number} length  The length to move along the field.
         * @param {number} dir  The direction of movement.
         * @param {number?} step_length  The length of each step.
         * @param {boolean?} isFlow
         *     Whether to use the flow field for movement, defaulting to true.
         */
        moveTo(
            length: number,
            dir: number,
            step_length?: number,
            isFlow?: boolean
        ): void
        /**
         * Plots a point to another position within the flow field,
         * following a Plot object
         * @param {Plot} plot  The Plot path object.
         * @param {number} length
         *     The length to move towards the target position.
         * @param {number} step_length  The length of each step.
         * @param {number} scale  The scaling factor for the plotting path.
         */
        plotTo(
            _plot: Plot,
            length: number,
            step_length: number,
            scale: number
        ): void
    }
}
