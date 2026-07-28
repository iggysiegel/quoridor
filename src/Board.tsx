import "./Board.css";

import { useState } from "react";

import {
  getPlayerAt,
  getWinner,
  INITIAL_STATE,
  isValidMove,
  isValidWallPlacement,
  movePlayer,
  placeWall,
} from "./game";
import { type Orientation } from "./types";

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
  const winner = getWinner(boardState);
  const winnerMessage =
    winner && { p1: "Player 1 Wins", p2: "Player 2 Wins" }[winner];

  function handleClick(row: number, col: number) {
    if (winner) {
      return;
    }

    const target = { row, col };
    if (isValidMove(boardState, boardState.turn, target)) {
      setBoardState(movePlayer(boardState, boardState.turn, target));
    }
  }

  function handleWallClick(row: number, col: number, orientation: Orientation) {
    if (winner) {
      return;
    }

    const wall = { slot: { row, col }, orientation, player: boardState.turn };
    if (isValidWallPlacement(boardState, wall)) {
      setBoardState(placeWall(boardState, wall));
    }
  }

  const rows = Array.from({ length: 9 }, (_, row) => row);
  const cols = Array.from({ length: 9 }, (_, col) => col);
  const slots = Array.from({ length: rows.length - 1 }, (_, i) => i);
  return (
    <>
      <div>{winner && <p>{winnerMessage}</p>}</div>
      <div className="board">
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
    </>
  );
}
