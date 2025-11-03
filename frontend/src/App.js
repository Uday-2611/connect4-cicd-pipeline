import React, { useState, useEffect } from 'react';
import './App.css';

const ROWS = 6;
const COLS = 7;

function App() {
  const [board, setBoard] = useState(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
  const [currentPlayer, setCurrentPlayer] = useState('red');
  const [winner, setWinner] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Connect to backend
    fetch('http://localhost:5000/api/health')
      .then(res => res.json())
      .then(() => setConnected(true))
      .catch(() => setConnected(false));
  }, []);

  const checkWinner = (board, row, col, player) => {
    // Check horizontal
    let count = 1;
    for (let c = col - 1; c >= 0 && board[row][c] === player; c--) count++;
    for (let c = col + 1; c < COLS && board[row][c] === player; c++) count++;
    if (count >= 4) return true;

    // Check vertical
    count = 1;
    for (let r = row - 1; r >= 0 && board[r][col] === player; r--) count++;
    for (let r = row + 1; r < ROWS && board[r][col] === player; r++) count++;
    if (count >= 4) return true;

    // Check diagonal (top-left to bottom-right)
    count = 1;
    for (let i = 1; row - i >= 0 && col - i >= 0 && board[row - i][col - i] === player; i++) count++;
    for (let i = 1; row + i < ROWS && col + i < COLS && board[row + i][col + i] === player; i++) count++;
    if (count >= 4) return true;

    // Check diagonal (top-right to bottom-left)
    count = 1;
    for (let i = 1; row - i >= 0 && col + i < COLS && board[row - i][col + i] === player; i++) count++;
    for (let i = 1; row + i < ROWS && col - i >= 0 && board[row + i][col - i] === player; i++) count++;
    if (count >= 4) return true;

    return false;
  };

  const dropPiece = async (col) => {
    if (winner) return;

    // Find the lowest empty row
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (!board[r][col]) {
        row = r;
        break;
      }
    }

    if (row === -1) return; // Column is full

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    // Send move to backend
    try {
      await fetch('http://localhost:5000/api/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ row, col, player: currentPlayer })
      });
    } catch (err) {
      console.error('Failed to send move:', err);
    }

    if (checkWinner(newBoard, row, col, currentPlayer)) {
      setWinner(currentPlayer);
    } else {
      setCurrentPlayer(currentPlayer === 'red' ? 'yellow' : 'red');
    }
  };

  const resetGame = () => {
    setBoard(Array(ROWS).fill(null).map(() => Array(COLS).fill(null)));
    setCurrentPlayer('red');
    setWinner(null);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Connect 4 Multiplayer</h1>
        <div className="status">
          {connected ? '🟢 Connected to Server' : '🔴 Disconnected'}
        </div>
        {winner ? (
          <div className="winner">
            <h2>🎉 {winner.toUpperCase()} WINS! 🎉</h2>
            <button onClick={resetGame}>Play Again</button>
          </div>
        ) : (
          <h2>Current Player: <span className={currentPlayer}>{currentPlayer.toUpperCase()}</span></h2>
        )}
        <div className="board">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="row">
              {row.map((cell, colIndex) => (
                <div
                  key={colIndex}
                  className={`cell ${cell || ''}`}
                  onClick={() => dropPiece(colIndex)}
                >
                  {cell && <div className="piece" />}
                </div>
              ))}
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;