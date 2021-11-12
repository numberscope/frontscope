/**
 * @jest-environment jsdom
 */

import { VisualizerDefault } from '@/visualizers/VisualizerDefault';

jest.mock( './VisualizerDefault' );

beforeEach( () => {
  // clear all instances and calls to constructor and all methods
  VisualizerDefault.mockClear();
} );

test( 'if params is undefined', () => {
  const visualizer = new VisualizerDefault();
  expect( visualizer.params ).toBe( undefined );
} );

test( 'if settings is undefined', () => {
  const visualizer = new VisualizerDefault();
  expect( visualizer.settings ).toBe( undefined );
} );

test( 'if ready is undefined', () => {
  const visualizer = new VisualizerDefault();
  expect( visualizer.ready ).toBe( undefined );
} );

test( 'if sketch is undefined', () => {
  const visualizer = new VisualizerDefault();
  expect( visualizer.sketch ).toBe( undefined );
} );

test( 'if seq is undefined', () => {
  const visualizer = new VisualizerDefault();
  expect( visualizer.seq ).toBe( undefined );
} );

test( 'if isValid is false', () => {
  const visualizer = new VisualizerDefault();
  expect( visualizer.isValid ).toBe( undefined );
} );

test( 'if class constructor hasn\'t been called', () => {
  expect( VisualizerDefault ).not.toHaveBeenCalled();
} );

test( 'if class constructor has been called once', () => {
  const visualzier = new VisualizerDefault(); // eslint-disable-line @typescript-eslint/no-unused-vars
  expect( VisualizerDefault ).toHaveBeenCalledTimes( 1 );
} );

test( 'if initialize method is a function', () => {
  const visualizer = new VisualizerDefault();
  expect( typeof visualizer.initialize ).toBe( 'function' );
} );

test( 'if validate method is a function', () => {
  const visualizer = new VisualizerDefault();
  expect( typeof visualizer.validate ).toBe( 'function' );
} );

test( 'if assignParams method is a function', () => {
  const visualizer = new VisualizerDefault();
  expect( typeof visualizer.assignParams ).toBe( 'function' );
} );

test( 'if setup method is a function', () => {
  const visualizer = new VisualizerDefault();
  expect( typeof visualizer.setup ).toBe( 'function' );
} );

test( 'if draw method is a function', () => {
  const visualizer = new VisualizerDefault();
  expect( typeof visualizer.validate ).toBe( 'function' );
} );