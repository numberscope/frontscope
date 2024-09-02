import p5 from 'p5'

import {P5Visualizer} from './P5Visualizer'
import type {ViewSize} from './VisualizerInterface'
import {VisualizerExportModule} from './VisualizerInterface'

import type {GenericParamDescription, ParamValues} from '@/shared/Paramable'
import {ParamType} from '@/shared/ParamType'
import {ValidationStatus} from '@/shared/ValidationStatus'
import {modulo} from '../shared/math'

/** md
# Turtle Visualizer

[<img
  src="../../assets/img/Turtle/turtle-waitforit.png"
  width=500
  style="margin-left: 1em; margin-right: 0.5em"
/>](../assets/img/Turtle/turtle-waitforit.png)

This visualizer interprets a sequence as instructions for a drawing machine.
For each value in a domain of possible sequence values, the entry determines
a turn angle and step length.  The visualizer displays the resulting polygonal
path.

There are two ways to animate the resulting path:

1.  By setting the growth parameter to be positive, you can watch the path
being drawn some number of steps per frame until it reaches the full length.

2.  By setting non-zero values for the `Folding rates', the user can set the
turn angles to gradually increase or decrease over time, resulting a
protein-folding effect.

## Parameters
**/

const paramDesc = {
    /**
- modulus: the modulus to apply to any incoming sequence.  This is the most
common way
to ensure the sequence values will lie in your domain.  A value of 0 means 
that no modulus is applied.
     **/
    modulus: {
        default: 5,
        type: ParamType.INTEGER,
        displayName: 'Sequence Modulus',
        required: true,
        description: 'consider sequence values modulo this; 0 means none',
        hideDescription: false,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n < 0,
                'Modulus should be non-negative; 0 means none.'
            ),
    },
    /** md
- domain: A list of all of the values that may occur in the sequence.
Values of the sequence not occurring in this list will be ignored.
(One way to ensure a small number of possible values is to use a
sequence that has been reduced with respect to some small modulus (see
`modulus' below). But
some sequences, like A014577 "The regular paper-folding sequence", naturally
have a small domain.)
     **/
    domain: {
        default: [0n, 1n, 2n, 3n, 4n] as bigint[],
        type: ParamType.BIGINT_ARRAY,
        displayName: 'Sequence Domain',
        required: true,
        description:
            'values to interpret as rules; sequence values not '
            + ' matching any term here are ignored',
        hideDescription: false,
    },
    /** md
- turns: a list of numbers. These are turning angles, in degrees, 
corresponding positionally to the domain elements. Must contain 
the same number of elements as the domain.  In other words, the first
element of the domain will be interpreted as an instruction to turn
x degrees, where x is the first number in this field.
     **/
    turns: {
        default: [30, 45, 60, 90, 120] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Turning angles',
        required: true,
        description:
            'list of angles in degrees, in order corresponding'
            + ' to the sequence values listed in domain',
        hideDescription: false,
    },
    /** md
- steps: a list of numbers. These are step lengths, corresponding
positionally to the domain elements.  Must contain the same number of 
elements as the domain.  As with turn angles, the n-th step length
will be interpreted as the step length for the n-th domain element.
     **/
    steps: {
        default: [20, 20, 20, 20, 20] as number[],
        type: ParamType.NUMBER_ARRAY,
        displayName: 'Step lengths',
        required: true,
        description:
            'list of step lengths in pixels, in order corresponding'
            + ' to the sequence values listed in domain',
        hideDescription: false,
    },
    /**
- walkAnimation: boolean. If true, show animation controls
    **/
    walkAnimation: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Turtle movement controls ↴',
        required: false,
    },
    /**
- growth: a number.  If zero, the full path is drawn all at once.  
Otherwise, the visualizer will animate: this is the number of steps of the path
to grow per frame, until the path reaches its maximum length (give by 
`pathLength` set above).
     **/
    growth: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Turtle speed',
        required: false,
        description: 'how many more terms to show per frame',
        hideDescription: false,
        visibleDependency: 'walkAnimation',
        visibleValue: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(n <= 0, 'Path growth must be positive'),
    },
    /**
- startEndControl: boolean. If true, show animation controls
    **/
    startEndControl: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Custom start/end ↴',
        required: false,
    },
    /**
- firstTerm: a number. Gives the first term to use.  
Entering a 0 means to use all available terms (possibly forever), and 
will force the 'growth' animation to turn on.
If the user enters a number exceeding the number of terms available, 
this will default to the max number of terms available.
     **/
    firstTerm: {
        default: 0,
        type: ParamType.INTEGER,
        displayName: 'First term',
        required: false,
        description: 'index of first term to use',
        hideDescription: false,
        visibleDependency: 'startEndControl',
        visibleValue: true,
    },
    /**
- pathLength: a number.  The number of terms to use.
Entering a 0 means to use all available terms (possibly forever), and 
will force the 'growth' animation to turn on.
If the user enters a number exceeding the number of terms available, 
this will default to the max number of terms available.
     **/
    pathLength: {
        default: 0,
        type: ParamType.INTEGER,
        displayName: 'Path length',
        required: false,
        description:
            'cannot exceed available number of terms from sequence;'
            + ' entering 0 will indicate as many terms as possible',
        hideDescription: false,
        visibleDependency: 'startEndControl',
        visibleValue: true,
        validate: (n: number) =>
            ValidationStatus.errorIf(
                n < 0,
                'Path length must be non-negative'
            ),
    },
    /**
- start: x,y coordinates of the point where drawing will start.  The default
0,0 represents the center of the canvas, and positive values will move the
to the right and down, respectively.
     **/
    start: {
        default: new p5.Vector(),
        type: ParamType.VECTOR,
        displayName: 'Start position',
        required: false,
        description: 'coordinates of the point where drawing will start',
        visibleDependency: 'startEndControl',
        visibleValue: true,
        hideDescription: true,
    },
    /**
- foldAnimation: boolean. If true, show folding controls
    **/
    foldAnimation: {
        default: false,
        type: ParamType.BOOLEAN,
        displayName: 'Turn on protein folding animation ↴',
        required: false,
    },
    /** md
- folding: a list of numbers. When these are non-zero, the path will animate.  
These are angle increments added to the turning 
angles each frame.  They correspond
positionally to the domain elements.  Must contain the same number of elements 
as domain.  The units is 1/10^5th of a degree.  For example, if the first
entry here is a `2`, then in each frame of the animation, the turn angle for 
the first domain element will increase by 2/10^5-th of a degree.  The result
looks a little like protein folding.
     **/
    folding: {
        default: [0, 0, 0, 0, 0] as number[],
        type: ParamType.NUMBER_ARRAY,
        // type NUMBER_ARRAY needs to let you type a space even under
        // refreshParams()
        displayName: 'Folding rates',
        required: false,
        description:
            'turns on animation:  list of angle increments per frame in units'
            + ' of 0.01 degree, in order corresponding'
            + ' to the sequence values listed in domain',
        hideDescription: false,
        visibleDependency: 'foldAnimation',
        visibleValue: true,
    },
    /**
- pathLook: boolean. If true, show path style controls
    **/
    pathLook: {
        default: true,
        type: ParamType.BOOLEAN,
        displayName: 'Path styling ↴',
        required: false,
    },
    /**
- strokeWeight: a number. Gives the width of the segment drawn for each entry,
in pixels.
     **/
    strokeWeight: {
        default: 1,
        type: ParamType.INTEGER,
        displayName: 'Stroke Width',
        required: false,
        validate: function (n: number, status: ValidationStatus) {
            if (n <= 0) status.addError('Stroke width must be positive')
        },
        visibleDependency: 'pathLook',
        visibleValue: true,
    },
    /**
- bgColor: The background color of the visualizer canvas.
     **/
    bgColor: {
        default: '#6b1a1a',
        type: ParamType.COLOR,
        displayName: 'Background Color',
        required: true,
        visibleDependency: 'pathLook',
        visibleValue: true,
    },
    /**
- strokeColor: The color used for drawing the path.
     **/
    strokeColor: {
        default: '#c98787',
        type: ParamType.COLOR,
        displayName: 'Stroke Color',
        required: true,
        visibleDependency: 'pathLook',
        visibleValue: true,
    },
} satisfies GenericParamDescription

class Turtle extends P5Visualizer(paramDesc) {
    static category = 'Turtle'
    static description =
        'Use a sequence to steer a virtual turtle that leaves a visible trail'

    // maps from domain to rotations and steps
    private rotMap = new Map<string, number>()
    private stepMap = new Map<string, number>()
    private foldingMap = new Map<string, number>()

    private currentIndex = 0n
    private orientation = 0
    private X = 0
    private Y = 0
    
    // variables controlling path to draw in a given frame
    private begin = 0 // path step at which drawing begins
    private currentLength = 1 // length of path
    private path: p5.Vector[] = [] // array of path info
    private pathIsStatic = true // whether there's any folding
    private growthInitial = 0 // growth is turned on or off overall
    private growthInternal = 0 // growth currently happening or not
    private pathLengthInternal = 1 // can be infinity
    private firstTermInternal = 0 // first term

    // controlling the folding smoothness/speed/units
    // the units of the folding entry field are 1/denom degrees
    private denom = 100000 // larger = more precision/slower

    // handling slow caching
    private pathFailure = false

    // private copies of rule arrays
    private turnsInternal: number[] = []
    private stepsInternal: number[] = []
    private foldingInternal: number[] = []

    checkParameters(params: ParamValues<typeof paramDesc>) {
        const status = super.checkParameters(params)

        // first term handling
        const firstParams =
            paramDesc.firstTerm as ParamInterface<ParamType.INTEGER>
        // this max only shows up after I try to interact with parameters
        // but it should show up right away
        firstParams.displayName =
            `First term (`
            + `${this.seq.first}`
            + ' to '
            + `${this.seq.last})`

        this.firstTermInternal = params.firstTerm
        if (this.firstTermInternal < this.seq.first) {
            status.addWarning(
                'First term is too small, using ' + `${this.seq.first}.`
            )
            this.firstTermInternal = this.seq.first
        }
        if (this.firstTermInternal > this.seq.last) {
            status.addWarning(
                'First term is too big, using ' + `${this.seq.last}.`
            )
            this.firstTermInternal = this.seq.last
        }

        // path length handling
        const seqTerms = this.seq.last - this.firstTermInternal + 1
        if (isFinite(seqTerms)) {
            const termsParams =
                paramDesc.pathLength as ParamInterface<ParamType.INTEGER>
            // this max only shows up after I try to interact with parameters
            // but it should show up right away
            termsParams.displayName = `Path length (max: ${seqTerms})`
        }

        this.pathLengthInternal = params.pathLength
        // 0 means grow as long as possible
        if (params.pathLength == 0) this.pathLengthInternal = seqTerms

        // if requested too many
        if (seqTerms < params.pathLength) {
            // when implemented, have this appear next to parameter
            status.addWarning(
                'More terms requested for path length than available; using '
                    + `all ${seqTerms}.`
            )
            this.pathLengthInternal = seqTerms
        }

        // walkAnimation handling
        this.growthInitial = params.growth

        // domain handling
        // for each of the rule arrays, should match
        // params.domain.length; otherwise special handling

        // tell user the appriopriate rule lengths
        //const paramDescs: ParamInterface<ParamType.INTEGER>[][] = [
        const ruleParams = [
            {
                param: params.turns,
                local: this.turnsInternal,
                desc: paramDesc.turns as ParamInterface<ParamType.NUMBER_ARRAY>,
                text: 'Turn angles',
            },
            {
                param: params.steps,
                local: this.stepsInternal,
                desc: paramDesc.steps as ParamInterface<ParamType.NUMBER_ARRAY>,
                text: 'Step sizes',
            },
            {
                param: params.folding,
                local: this.foldingInternal,
                // I don't know why lint can't figure this out
                // eslint-disable-next-line max-len
                desc: paramDesc.folding as ParamInterface<ParamType.NUMBER_ARRAY>,
                text: 'Folding rates',
            },
        ]

        for (const rule of ruleParams) {
            // how can I add a newline before parenthetical?
            rule.desc.displayName =
                rule.text
                + ` (must match domain length, ${params.domain.length})`
        }

        // ignore (remove) or add extra rules for excess/missing
        // terms compared to domain length
        // note: this changes the actual param values
        // if refreshParams() were called this would be
        // visible to the user
        ruleParams.forEach(rule => {
            rule.local = [...rule.param]
        })
        ruleParams.forEach(rule => {
            while (rule.local.length < params.domain.length) {
                rule.local.push(0)
            }
            while (rule.local.length > params.domain.length) {
                rule.local.pop()
            }
        })
        // store internally
        this.turnsInternal = ruleParams[0].local
        this.stepsInternal = ruleParams[1].local
        this.foldingInternal = ruleParams[2].local

        // add warnings explaining the behaviour
        ruleParams.forEach(rule => {
            if (rule.param.length > params.domain.length) {
                // when implemented, have this appear next to parameter
                // associated to array and make warning instead
                status.addWarning(
                    'More entries ('
                        + rule.param.length
                        + ') in '
                        + rule.text
                        + ' than in domain ('
                        + params.domain.length
                        + '); ignoring extras.'
                )
            }
            if (rule.param.length < params.domain.length) {
                // when implemented, have this appear next to parameter
                // associated to array and make warning instead
                // error is stopping refreshParams()
                status.addWarning(
                    'Fewer entries ('
                        + rule.param.length
                        + ') in '
                        + rule.text
                        + ' than in domain ('
                        + params.domain.length
                        + '); using trivial behaviour for missing terms.'
                )
            }
        })
        return status
    }
    async presketch(size: ViewSize) {
        await super.presketch(size)

        await this.refreshParams()

        // create a map from sequence values to rotations
        for (let i = 0; i < this.domain.length; i++) {
            this.rotMap.set(
                this.domain[i].toString(),
                (Math.PI / 180) * this.turnsInternal[i]
            )
        }

        // create a map from sequence values to step lengths
        for (let i = 0; i < this.domain.length; i++) {
            this.stepMap.set(this.domain[i].toString(), this.stepsInternal[i])
        }

        // create a map from sequence values to turn increments
        // notice if path is static or we are folding
        this.pathIsStatic = true
        for (let i = 0; i < this.domain.length; i++) {
            if (this.foldingInternal[i] != 0) this.pathIsStatic = false
            this.foldingMap.set(
                this.domain[i].toString(),
                // in units of this.incrementFactor
                // 0 map if folding is turned off
                this.foldAnimation ? this.foldingInternal[i] : 0
            )
        }
        if (this.foldAnimation === false) this.pathIsStatic = true
    }

    setup() {
        super.setup()

        // this line should be removed once issue #403 is resolved
        // right now it avoids crashes caused by that issue
        // but ideally we should never be in a state where
        // this.pathLength exceeds this.seq.last - this.firstTermInternal
        this.pathLengthInternal = Math.min(
            this.pathLengthInternal,
            this.seq.last - this.firstTermInternal
        )

        // reset variables
        this.begin = 0
        this.currentLength = 1
        this.growthInternal = this.growthInitial

        // if not growing, set to full length immediately
        // pathLength should always be finite if growth is zero
        if (this.growthInternal == 0)
            this.currentLength = this.pathLengthInternal

        // create initial path
        // must be in setup since uses p5.Vector
        // in case we are animating, we will recompute anyway,
        // so use current length only, for efficiency
        this.createpath(0, this.currentLength)

        // prepare sketch
        this.sketch
            .background(this.bgColor)
            .fill(this.bgColor)
            .stroke(this.strokeColor)
            .strokeWeight(this.strokeWeight)
            .frameRate(30)
    }

    draw() {
        const sketch = this.sketch

        if (angle == undefined) {
            this.stop()
            return
        // if folding, clear and reset draw to beginning of path
        if (!this.pathIsStatic) {
            sketch.clear().background(this.bgColor)
            this.begin = 0
        }

        // draw path from this.begin to this.currentLength
        let startPt = this.path[this.begin]
        for (let i = this.begin + 1; i < this.currentLength; i++) {
            const endPt = this.path[i]
            sketch.line(startPt.x, startPt.y, endPt.x, endPt.y)
            startPt = endPt.copy()
        }
        // advance this.begin
        if (!this.pathFailure) this.begin = this.currentLength - 1

        // stop drawing if no animation
        if (this.pathIsStatic && !this.growthInternal && !this.pathFailure) {
            sketch.noLoop()
        }

        this.sketch.line(oldX, oldY, this.X, this.Y)
        if (++this.currentIndex > this.seq.last) this.stop()

        // if path is growing, lengthen path
        if (!this.pathFailure) {
            this.currentLength += this.growthInternal
        }
        // if reached full length, stop growing
        if (this.currentLength > this.pathLengthInternal) {
            this.currentLength = this.pathLengthInternal
            this.growthInternal = 0
        }

        // if we are still drawing, recreate path
        this.createpath(sketch.frameCount, this.currentLength)
    }

    // this should be run each time the path needs to be extended
    // or re-calculated
    // if folding, include current frames; otherwise `frames=0`
    createpath(frames: number, length: number) {
        this.pathFailure = false

        // initialize turtle position
        let orientation = 0
        const position = new p5.Vector(
            this.sketch.width / 2,
            this.sketch.height / 2
        )
        position.add(this.start)

        // clear path
        this.path = []

        // read sequence to create path
        for (
            let i = this.firstTermInternal;
            i
            < this.firstTermInternal
                + Math.min(length, this.pathLengthInternal);
            i++
        ) {
            // get the current sequence element and infer
            // the rotation/step/increment
            let step = new p5.Vector(0, 0)
            try {
                let currElement = this.seq.getElement(i)
                currElement = this.modulus
                    ? modulo(currElement, this.modulus)
                    : currElement
                const currElementString = currElement.toString()
                const turnAngle = this.rotMap.get(currElementString)
                const stepLength = this.stepMap.get(currElementString)
                const turnIncrement = this.foldingMap.get(currElementString)

                // turn
                const thisIncrement = frames * (turnIncrement ?? 0) // raw inc
                orientation
                    += (turnAngle ?? 0)
                    + (Number(modulo(thisIncrement, 360 * this.denom))
                        / this.denom)
                        * (Math.PI / 180)

                // step
                step = new p5.Vector(
                    Math.cos(orientation),
                    Math.sin(orientation)
                )
                step.mult(stepLength ?? 0)
            } catch (CachingError) {
                this.pathFailure = true
            }
            // happens whether step has info or not
            position.add(step)

            // add the new position to the path
            this.path.push(position.copy())
        }
    }
}

export const exportModule = new VisualizerExportModule(Turtle)
