import {
  type GameState,
  type PlayerId,
  type Position,
  type Wall,
} from "./types";

export const INITIAL_STATE: GameState = {
  positions: {
    p1: { row: 8, col: 4 },
    p2: { row: 0, col: 4 },
  },
  turn: "p1",
  walls: [],
};

export function getPlayerAt(
  state: GameState,
  position: Position,
): PlayerId | null {
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

export function movePlayer(
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

export function placeWall(state: GameState, wall: Wall): GameState {
  return {
    ...state,
    walls: [...state.walls, wall],
    turn: state.turn === "p1" ? "p2" : "p1",
  };
}

export function isValidMove(
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

export function getWinner(state: GameState): PlayerId | null {
  if (state.positions.p1.row === 0) {
    return "p1";
  }
  if (state.positions.p2.row === 8) {
    return "p2";
  }
  return null;
}
