import {VisualizerDefault} from './VisualizerDefault'
import type {ValidationStatus} from '../shared/ValidationStatus'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import type p5 from 'p5'
import {VisualizerExportModule} from './VisualizerInterface'

class MouseClick extends VisualizerDefault {
    name = 'Mouse Click'
    onClickMessage = 'Huzzah! The mouse was clicked!'

    params = {
        onClickMessage: {
            value: this.onClickMessage,
            forceType: 'string',
            displayName: 'The message to display when the canvas is clicked',
            required: true,
        },
    }

    checkParameters(): ValidationStatus {
        return super.checkParameters()
    }

    initialize(sketch: p5, seq: SequenceInterface) {
        super.initialize(sketch, seq)
    }

    setup() {
        super.setup()
        console.log('in mouse click setup')
        console.log(this.canvas)
        this.canvas.mouseClicked(() => {
            this.sketch.text(this.onClickMessage, 50, 50)
        })
    }

    draw() {
        this.sketch.text('Mouse Click Visualizer', 100, 100)
    }
}

export const exportModule = new VisualizerExportModule(
    'Mouse Click',
    MouseClick,
    'Displays a message when you click the canvas.'
)
