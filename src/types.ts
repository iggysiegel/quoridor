export type GameState = {
  positions: Record<PlayerId, Position>;
  turn: PlayerId;
  walls: Wall[];
};

export type PlayerId = "p1" | "p2";

export type Position = {
  row: number;
  col: number;
};

export type Orientation = "horizontal" | "vertical";

export type Wall = {
  slot: Position;
  orientation: Orientation;
  player: PlayerId;
};
