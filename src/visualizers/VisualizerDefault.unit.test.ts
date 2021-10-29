import {VisualizerDefault} from '@/visualizers/VisualizerDefault';

jest.mock( './VisualizerDefault' );

test( 'check if methods are called', () => {
  expect( VisualizerDefault ).not.toHaveBeenCalled();
} );