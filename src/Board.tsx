import "./Board.css";

import { useState } from "react";

import {
  getPlayerAt,
  getWallsRemaining,
  getWinner,
  INITIAL_STATE,
  isValidMove,
  isValidWallPlacement,
  movePlayer,
  placeWall,
} from "./game";
import { type GameState, type Orientation } from "./types";

const ORIENTATIONS: Orientation[] = ["horizontal", "vertical"];

function getWallGridArea(row: number, col: number, orientation: Orientation) {
  if (orientation === "horizontal") {
    return {
      gridRow: 2 * row + 2,
      gridColumn: `${2 * col + 1} / ${2 * col + 4}`,
    };
  }
  return {
    gridRow: `${2 * row + 1} / ${2 * row + 4}`,
    gridColumn: 2 * col + 2,
  };
}

export default function Board() {
  const [boardState, setBoardState] = useState(INITIAL_STATE);
  const [history, setHistory] = useState<GameState[]>([]);
  const [isRotated, setIsRotated] = useState(false);
  const winner = getWinner(boardState);
  const winnerMessage =
    winner && { p1: "Player 1 Wins", p2: "Player 2 Wins" }[winner];

  function handleClick(row: number, col: number) {
    if (winner) {
      return;
    }

    const target = { row, col };
    if (isValidMove(boardState, boardState.turn, target)) {
      const nextHistory = [...history, boardState];
      setHistory(nextHistory);
      setBoardState(movePlayer(boardState, boardState.turn, target));
    }
  }

  function handleWallClick(row: number, col: number, orientation: Orientation) {
    if (winner) {
      return;
    }

    const wall = { slot: { row, col }, orientation, player: boardState.turn };
    if (isValidWallPlacement(boardState, wall)) {
      const nextHistory = [...history, boardState];
      setHistory(nextHistory);
      setBoardState(placeWall(boardState, wall));
    }
  }

  function handleRestart() {
    setBoardState(INITIAL_STATE);
    setHistory([]);
  }

  function handleUndo() {
    if (history.length === 0) {
      return;
    }
    setBoardState(history[history.length - 1]);
    setHistory(history.slice(0, -1));
  }

  function handleRotate() {
    setIsRotated(!isRotated);
  }

  const rows = Array.from({ length: 9 }, (_, row) => row);
  const cols = Array.from({ length: 9 }, (_, col) => col);
  const slots = Array.from({ length: rows.length - 1 }, (_, i) => i);
  return (
    <>
      <div>{winner && <p>{winnerMessage}</p>}</div>
      <div>
        <p>Player 1: {getWallsRemaining(boardState, "p1")} Walls</p>
        <p>Player 2: {getWallsRemaining(boardState, "p2")} Walls</p>
      </div>
      <div className="game-area">
        <div className={`board ${isRotated ? "rotated" : ""}`}>
          {/* Cells */}
          {rows.map((row) =>
            cols.map((col) => {
              const player = getPlayerAt(boardState, { row, col });
              return (
                <button
                  key={`${row}-${col}`}
                  className="cell"
                  onClick={() => handleClick(row, col)}
                  style={{ gridRow: 2 * row + 1, gridColumn: 2 * col + 1 }}
                >
                  {player && <span className={`piece piece-${player}`} />}
                </button>
              );
            }),
          )}

          {/* Placed walls */}
          {boardState.walls.map((wall, index) => (
            <div
              key={index}
              className={`wall wall-${wall.player}`}
              style={getWallGridArea(
                wall.slot.row,
                wall.slot.col,
                wall.orientation,
              )}
            />
          ))}

          {/* Wall placement targets */}
          {slots.map((row) =>
            slots.map((col) =>
              ORIENTATIONS.map((orientation) => (
                <button
                  key={`${row}-${col}-${orientation}`}
                  className="wall-slot"
                  onClick={() => handleWallClick(row, col, orientation)}
                  style={getWallGridArea(row, col, orientation)}
                />
              )),
            ),
          )}
        </div>

        <div className="sidebar">
          <button className="sidebar-button" onClick={handleRestart}>
            Restart
          </button>
          <button className="sidebar-button" onClick={handleUndo}>
            Undo
          </button>
          <button className="sidebar-button" onClick={handleRotate}>
            Rotate
          </button>
        </div>
      </div>
    </>
  );
}
