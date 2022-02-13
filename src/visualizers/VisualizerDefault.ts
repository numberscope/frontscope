import {VisualizerInterface} from './VisualizerInterface'
import {ValidationStatus} from '@/shared/ValidationStatus'
import p5 from 'p5'
import {SequenceInterface} from '@/sequences/SequenceInterface'
import {SequenceClassDefault} from '@/sequences/SequenceClassDefault'

export class VisualizerDefault implements VisualizerInterface {
    params = {}
    ready = false
    sketch: p5 = new p5(sketch => {
        return sketch
    })
    seq: SequenceInterface = new SequenceClassDefault(0)
    public isValid = false

    /***
      Sets the sketch and the sequence to draw with
      This is also where you would generate any settings or
      draw functions if needed
      */
    initialize(sketch: p5, seq: SequenceInterface): void {
        if (this.isValid) {
            this.sketch = sketch
            this.seq = seq

            this.ready = true
        } else {
            throw (
                'The visualizer is not valid. '
                + 'Run validate and address any errors.'
            )
        }
    }

    /**
     * All implementations based on this default delegate the checking of
     * parameters to the checkParameters() method.
     * That leaves the required validate() method to just call checkParameters
     * and set the isValid property based on the result.
     */
    validate(): ValidationStatus {
        const status = this.checkParameters()
        this.isValid = status.isValid
        return status
    }

    /**
     * checkParameters should check that all parameters are well-formed,
     * in-range, etc.
     * @returns {ValidationStatus}
     */
    checkParameters(): ValidationStatus {
        return new ValidationStatus(true)
    }

    setup(): void {
        return
    }

    draw(): void {
        return
    }
}
