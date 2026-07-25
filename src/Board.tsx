import { useState } from "react";
import { type GameState, type PlayerId, type Position } from "./types";
import "./Board.css";

const INITIAL_STATE: GameState = {
  positions: {
    p1: { row: 8, col: 4 },
    p2: { row: 0, col: 4 },
  },
  turn: "p1",
};

function getPlayerAt(
  state: GameState,
  row: number,
  col: number,
): PlayerId | null {
  const p1Position = state.positions.p1;
  const p2Position = state.positions.p2;
  if (p1Position.row === row && p1Position.col === col) {
    return "p1";
  } else if (p2Position.row === row && p2Position.col === col) {
    return "p2";
  } else {
    return null;
  }
}

function movePlayer(
  state: GameState,
  player: PlayerId,
  newPosition: Position,
): GameState {
  return {
    ...state,
    positions: {
      ...state.positions,
      [player]: newPosition,
    },
    turn: player === "p1" ? "p2" : "p1",
  };
}

export default function Board() {
  const [boardState, setBoardState] = useState(INITIAL_STATE);

  function handleClick(row: number, col: number) {
    const newState = movePlayer(boardState, boardState.turn, { row, col });
    setBoardState(newState);
  }

  const rows = Array.from({ length: 9 }, (_, row) => row);
  const cols = Array.from({ length: 9 }, (_, col) => col);
  return (
    <div className="board">
      {rows.map((row) =>
        cols.map((col) => {
          const player = getPlayerAt(boardState, row, col);
          return (
            <button
              key={`${row}-${col}`}
              className="cell"
              onClick={() => handleClick(row, col)}
            >
              {player && <span className={`piece piece-${player}`} />}
            </button>
          );
        }),
      )}
    </div>
  );
}
