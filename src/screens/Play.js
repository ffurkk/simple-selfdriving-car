import React from 'react';
import algoritmSketch from '../components/playSketch';

import P5Wrapper from 'react-p5-wrapper';

export default function Play() {
  return (
    <div>
      <P5Wrapper sketch={algoritmSketch} />
    </div>
  );
}
