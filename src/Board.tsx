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

function getPlayerAt(state: GameState, position: Position): PlayerId | null {
  const p1Position = state.positions.p1;
  const p2Position = state.positions.p2;
  if (p1Position.row === position.row && p1Position.col === position.col) {
    return "p1";
  } else if (
    p2Position.row === position.row &&
    p2Position.col === position.col
  ) {
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

function isValidMove(
  state: GameState,
  player: PlayerId,
  target: Position,
): boolean {
  // A player cannot move to an occupied square
  if (getPlayerAt(state, target) !== null) {
    return false;
  }

  // Normal move (one square)
  const currentPosition = state.positions[player];
  const rowDistance = Math.abs(currentPosition.row - target.row);
  const colDistance = Math.abs(currentPosition.col - target.col);
  if (rowDistance + colDistance === 1) {
    return true;
  }

  // Special move (jumping straight over the opponent)
  const isStraightJump =
    (rowDistance === 2 && colDistance === 0) ||
    (rowDistance === 0 && colDistance === 2);
  if (!isStraightJump) {
    return false;
  }
  const midpoint = {
    row: (currentPosition.row + target.row) / 2,
    col: (currentPosition.col + target.col) / 2,
  };
  const opponent = player === "p1" ? "p2" : "p1";
  return getPlayerAt(state, midpoint) === opponent;
}

export default function Board() {
  const [boardState, setBoardState] = useState(INITIAL_STATE);

  function handleClick(row: number, col: number) {
    const target = { row, col };
    if (isValidMove(boardState, boardState.turn, target)) {
      setBoardState(movePlayer(boardState, boardState.turn, target));
    }
  }

  const rows = Array.from({ length: 9 }, (_, row) => row);
  const cols = Array.from({ length: 9 }, (_, col) => col);
  return (
    <div className="board">
      {rows.map((row) =>
        cols.map((col) => {
          const player = getPlayerAt(boardState, { row, col });
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
