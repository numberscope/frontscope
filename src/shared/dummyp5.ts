import p5 from 'p5'

// We create a dummy p5 object because we want the sketch data member in the
// VisualizerP5 class to have the correct type, and we don't want to guard
// against it being undefined.
export const dummySketch = new p5(sketch => sketch)
