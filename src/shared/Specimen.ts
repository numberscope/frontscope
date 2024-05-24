import type {VisualizerInterface} from '../visualizers/VisualizerInterface'
import type {SequenceInterface} from '../sequences/SequenceInterface'

export class Specimen {
    private visualizer: VisualizerInterface
    private sequence: SequenceInterface
    private location: HTMLElement

    constructor(
        visualizer: VisualizerInterface,
        sequence: SequenceInterface,
        location: HTMLElement
    ) {
        this.visualizer = visualizer
        this.sequence = sequence
        this.location = location

        this.visualizer.view(this.sequence)
        this.visualizer.inhabit(this.location)
        this.start()
    }

    getVisualizer(): VisualizerInterface {
        return this.visualizer
    }

    getSequence(): SequenceInterface {
        return this.sequence
    }

    setVisualizer(visualizer: VisualizerInterface) {
        this.visualizer = visualizer
        this.visualizer.view(this.sequence)
        this.visualizer.inhabit(this.location)
        this.start()
    }

    setSequence(sequence: SequenceInterface) {
        this.sequence = sequence
        this.visualizer.view(this.sequence)
    }

    start() {
        this.visualizer.reset()
        this.visualizer.show()
    }

    stop() {
        this.visualizer.stop()
    }

    toURL(): string {
        // TODO
        return ''
    }

    static fromURL(_url: string): Specimen {
        // TODO
        return new Specimen(
            null as unknown as VisualizerInterface,
            null as unknown as SequenceInterface,
            null as unknown as HTMLElement
        )
    }
}
