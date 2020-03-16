import React from 'react';
import gameSketch from '../components/gameSketch';
import P5Wrapper from 'react-p5-wrapper';

export default function Game() {
  return (
    <div>
      <P5Wrapper sketch={gameSketch} />
    </div>
  );
}
