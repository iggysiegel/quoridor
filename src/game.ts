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

const MAX_WALLS = 10;

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

export function getWinner(state: GameState): PlayerId | null {
  if (state.positions.p1.row === 0) {
    return "p1";
  }
  if (state.positions.p2.row === 8) {
    return "p2";
  }
  return null;
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
  if (
    rowDistance + colDistance === 1 &&
    !isBlockedByWall(state, currentPosition, target)
  ) {
    return true;
  }

  // Special move (jumping over the opponent)
  const isStraightJump =
    (rowDistance === 2 && colDistance === 0) ||
    (rowDistance === 0 && colDistance === 2);
  const isDiagonalJump = rowDistance === 1 && colDistance === 1;
  const opponent = player === "p1" ? "p2" : "p1";

  if (isStraightJump) {
    // Straight jump
    const midpoint = {
      row: (currentPosition.row + target.row) / 2,
      col: (currentPosition.col + target.col) / 2,
    };
    return (
      getPlayerAt(state, midpoint) === opponent &&
      !isBlockedByWall(state, currentPosition, midpoint) &&
      !isBlockedByWall(state, midpoint, target)
    );
  } else if (isDiagonalJump) {
    // Diagonal jump; the opponent could be adjacent in either direction
    // that forms an "L" toward the target
    const elbowCandidates = [
      { row: target.row, col: currentPosition.col },
      { row: currentPosition.row, col: target.col },
    ];
    return elbowCandidates.some((candidate) => {
      const straightJumpTarget = {
        row: 2 * candidate.row - currentPosition.row,
        col: 2 * candidate.col - currentPosition.col,
      };
      const isStraightJumpTargetOnBoard =
        straightJumpTarget.row >= 0 &&
        straightJumpTarget.row <= 8 &&
        straightJumpTarget.col >= 0 &&
        straightJumpTarget.col <= 8;

      return (
        getPlayerAt(state, candidate) === opponent &&
        !isBlockedByWall(state, currentPosition, candidate) &&
        (!isStraightJumpTargetOnBoard ||
          isBlockedByWall(state, candidate, straightJumpTarget)) &&
        !isBlockedByWall(state, candidate, target)
      );
    });
  } else {
    return false;
  }
}

function isBlockedByWall(
  state: GameState,
  from: Position,
  to: Position,
): boolean {
  return state.walls.some((wall) => {
    let edge1: [Position, Position];
    let edge2: [Position, Position];
    const { row, col } = wall.slot;

    if (wall.orientation === "horizontal") {
      edge1 = [
        { row, col },
        { row: row + 1, col },
      ];
      edge2 = [
        { row, col: col + 1 },
        { row: row + 1, col: col + 1 },
      ];
    } else {
      edge1 = [
        { row, col },
        { row, col: col + 1 },
      ];
      edge2 = [
        { row: row + 1, col },
        { row: row + 1, col: col + 1 },
      ];
    }

    return (
      (positionsEqual(from, edge1[0]) && positionsEqual(to, edge1[1])) ||
      (positionsEqual(from, edge1[1]) && positionsEqual(to, edge1[0])) ||
      (positionsEqual(from, edge2[0]) && positionsEqual(to, edge2[1])) ||
      (positionsEqual(from, edge2[1]) && positionsEqual(to, edge2[0]))
    );
  });
}

function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

function hasPathToGoal(state: GameState, player: PlayerId): boolean {
  const goalRow = player === "p1" ? 0 : 8;
  const start = state.positions[player];
  const key = (position: Position) => `${position.row},${position.col}`;

  const visited = new Set<string>([key(start)]);
  const queue: Position[] = [start];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.row === goalRow) {
      return true;
    }

    const neighbors = [
      { row: current.row - 1, col: current.col },
      { row: current.row + 1, col: current.col },
      { row: current.row, col: current.col - 1 },
      { row: current.row, col: current.col + 1 },
    ];
    for (const neighbor of neighbors) {
      const onBoard =
        neighbor.row >= 0 &&
        neighbor.row <= 8 &&
        neighbor.col >= 0 &&
        neighbor.col <= 8;
      if (
        onBoard &&
        !visited.has(key(neighbor)) &&
        !isBlockedByWall(state, current, neighbor)
      ) {
        visited.add(key(neighbor));
        queue.push(neighbor);
      }
    }
  }

  return false;
}

export function placeWall(state: GameState, wall: Wall): GameState {
  return {
    ...state,
    walls: [...state.walls, wall],
    turn: state.turn === "p1" ? "p2" : "p1",
  };
}

export function isValidWallPlacement(state: GameState, wall: Wall): boolean {
  const overlapsExistingWall = state.walls.some((existingWall) => {
    const { row, col } = existingWall.slot;
    const rowDistance = Math.abs(row - wall.slot.row);
    const colDistance = Math.abs(col - wall.slot.col);

    if (existingWall.orientation !== wall.orientation) {
      return rowDistance === 0 && colDistance === 0;
    }
    if (existingWall.orientation === "horizontal") {
      return row === wall.slot.row && colDistance <= 1;
    }
    return col === wall.slot.col && rowDistance <= 1;
  });
  if (getWallsRemaining(state, wall.player) <= 0 || overlapsExistingWall) {
    return false;
  }

  const stateWithWall: GameState = { ...state, walls: [...state.walls, wall] };
  return (
    hasPathToGoal(stateWithWall, "p1") && hasPathToGoal(stateWithWall, "p2")
  );
}

export function getWallsRemaining(state: GameState, player: PlayerId): number {
  return (
    MAX_WALLS -
    state.walls.filter((wall) => {
      return wall.player === player;
    }).length
  );
}
