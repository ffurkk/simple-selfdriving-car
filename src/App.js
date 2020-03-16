import React, { useState } from 'react';
import './App.css';
import Game from './screens/Game';
import Draw from './screens/Draw';
import Play from './screens/Play';

function App() {
  const [mode, setMode] = useState('draw');
  console.log(mode);
  return (
    <div style={{ backgroundColor: 'red' }}>
      <div style={{ display: 'flex' }}>
        <button
          onClick={() => setMode('play')}
          style={{
            fontSize: '20px',
            backgroundColor: 'blue',
            display: 'flex',
            justifyContent: 'center',
            width: '50%',
            height: '50px',
            color: 'white',
          }}
        >
          Simple Algorithm
        </button>
        <button
          onClick={() => setMode('draw')}
          style={{
            fontSize: '20px',
            backgroundColor: 'blue',
            display: 'flex',
            justifyContent: 'center',
            width: '50%',
            height: '50px',
            color: 'white',
          }}
        >
          Draw
        </button>
        <button
          onClick={() => setMode('game')}
          style={{
            fontSize: '20px',
            backgroundColor: 'blue',
            display: 'flex',
            justifyContent: 'center',
            width: '50%',
            height: '50px',
            color: 'white',
          }}
        >
          Ai
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        {{ game: <Game />, draw: <Draw />, play: <Play /> }[mode] || <Draw />}
      </div>
    </div>
  );
}

export default App;
