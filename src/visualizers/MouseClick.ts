import type {ValidationStatus} from '../shared/ValidationStatus'
import type {SequenceInterface} from '../sequences/SequenceInterface'
import {VisualizerExportModule} from './VisualizerInterface'
import {VisualizerP5} from './VisualizerP5'

class MouseClick extends VisualizerP5 {
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

    initialize(canvasContainer: HTMLElement, seq: SequenceInterface) {
        super.initialize(canvasContainer, seq)
    }

    setup() {
        super.setup()
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
