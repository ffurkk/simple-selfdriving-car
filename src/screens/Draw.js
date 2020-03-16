import React, { useState, useEffect } from 'react';
import P5Wrapper from 'react-p5-wrapper';
import sketch from '../components/sketch';
export default function Draw() {
  const [radius, SetRadius] = useState(20);
  const [save, setSave] = useState(false);

  useEffect(() => {
    save && setSave(false);
  }, [save]);

  return (
    <div style={{ display: 'flex' }}>
      <P5Wrapper sketch={sketch} fillRadius={radius} Save={save} />
      <div class='slidecontainer'>
        <p>DrawRadius: {radius}</p>
        <input type='range' min='1' max='100' value={radius} onChange={e => SetRadius(e.target.value)} class='slider' id='myRange' />
        <h2>Draw Your Map</h2>
      </div>
      <div>
        <button onClick={() => setSave(true)}>Save Map</button>
      </div>
    </div>
  );
}
